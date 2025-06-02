from datetime import datetime, timedelta
from typing import Dict, List, Optional
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING
import os

class NewsStorage:
    def __init__(self):
        self.client = AsyncIOMotorClient('mongodb://localhost:27017')
        self.db = self.client.news_db
        self.headlines = self.db.headlines  # 1년치 헤드라인
        self.summaries = self.db.summaries  # 1개월 본문 요약
        self._init_storage()
        
    async def _init_storage(self):
        """데이터베이스 초기화"""
        # 인덱스 생성
        await self.headlines.create_index([("timestamp", DESCENDING)])
        await self.headlines.create_index([("keywords", ASCENDING)])
        await self.summaries.create_index([("timestamp", DESCENDING)])
        await self.summaries.create_index([("headline_id", ASCENDING)])
        
        # TTL 인덱스 생성 (자동 문서 삭제)
        await self.headlines.create_index(
            [("timestamp", ASCENDING)],
            expireAfterSeconds=365 * 24 * 60 * 60  # 1년
        )
        await self.summaries.create_index(
            [("timestamp", ASCENDING)],
            expireAfterSeconds=30 * 24 * 60 * 60   # 1개월
        )
            
    async def save_headline(self, headline: Dict):
        """장기 저장소에 헤드라인 저장 (1년)"""
        headline_doc = {
            "timestamp": datetime.now(),
            "title": headline["title"],
            "url": headline.get("url"),
            "source": headline.get("source"),
            "keywords": headline.get("keywords", [])
        }
        result = await self.headlines.insert_one(headline_doc)
        return result.inserted_id
        
    async def save_summary(self, summary: Dict):
        """단기 저장소에 본문 요약 저장 (1개월)"""
        summary_doc = {
            "timestamp": datetime.now(),
            "headline_id": summary.get("headline_id"),
            "summary": summary["summary"],
            "content": summary.get("content"),
            "analysis": summary.get("analysis", {})
        }
        result = await self.summaries.insert_one(summary_doc)
        return result.inserted_id
            
    async def get_headlines(self, days: Optional[int] = None, keywords: Optional[str] = None) -> List[Dict]:
        """헤드라인 조회"""
        query = {}
        
        if days:
            cutoff = datetime.now() - timedelta(days=days)
            query["timestamp"] = {"$gt": cutoff}
            
        if keywords:
            query["keywords"] = {"$regex": keywords, "$options": "i"}
            
        cursor = self.headlines.find(query).sort("timestamp", DESCENDING)
        return await cursor.to_list(length=None)
            
    async def get_summaries(self, days: Optional[int] = None, headline_id: Optional[str] = None) -> List[Dict]:
        """본문 요약 조회"""
        query = {}
        
        if days:
            cutoff = datetime.now() - timedelta(days=days)
            query["timestamp"] = {"$gt": cutoff}
            
        if headline_id:
            query["headline_id"] = headline_id
            
        cursor = self.summaries.find(query).sort("timestamp", DESCENDING)
        return await cursor.to_list(length=None)
            
    async def search_news(self, keyword: str, days: Optional[int] = None) -> List[Dict]:
        """키워드로 뉴스 검색"""
        pipeline = []
        
        # 매칭 조건
        match = {
            "$or": [
                {"title": {"$regex": keyword, "$options": "i"}},
                {"keywords": {"$regex": keyword, "$options": "i"}},
            ]
        }
        
        if days:
            cutoff = datetime.now() - timedelta(days=days)
            match["timestamp"] = {"$gt": cutoff}
            
        pipeline.append({"$match": match})
        
        # 요약 정보 조인
        pipeline.extend([
            {
                "$lookup": {
                    "from": "summaries",
                    "localField": "_id",
                    "foreignField": "headline_id",
                    "as": "summary_info"
                }
            },
            {
                "$unwind": {
                    "path": "$summary_info",
                    "preserveNullAndEmptyArrays": True
                }
            },
            {
                "$project": {
                    "title": 1,
                    "url": 1,
                    "source": 1,
                    "keywords": 1,
                    "timestamp": 1,
                    "summary": "$summary_info.summary",
                    "analysis": "$summary_info.analysis"
                }
            }
        ])
        
        return await self.headlines.aggregate(pipeline).to_list(None) 