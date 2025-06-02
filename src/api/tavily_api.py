from typing import Dict, List, Optional
import aiohttp
import os
from datetime import datetime
import json

class TavilyNewsAPI:
    def __init__(self):
        self.base_url = "http://localhost:8000/v1"  # Smithery MCP 서버 주소
        
    async def search_news(self, query: str, max_results: int = 10) -> List[Dict]:
        """뉴스 검색 API 호출"""
        async with aiohttp.ClientSession() as session:
            payload = {
                "query": query,
                "search_depth": "advanced",
                "include_domains": ["news.google.com", "reuters.com", "ap.org", "bbc.com", "cnn.com"],
                "max_results": max_results,
                "type": "news"
            }
            
            async with session.post(f"{self.base_url}/search", json=payload) as response:
                if response.status != 200:
                    raise Exception(f"Tavily MCP API 오류: {response.status}")
                    
                data = await response.json()
                return self._process_results(data)
                
    def _process_results(self, data: Dict) -> List[Dict]:
        """API 응답 처리"""
        results = []
        for item in data.get("results", []):
            result = {
                "title": item.get("title"),
                "url": item.get("url"),
                "source": item.get("domain"),
                "content": item.get("content"),
                "keywords": self._extract_keywords(item.get("content", "")),
                "timestamp": datetime.now()  # 수집 시점
            }
            results.append(result)
        return results
        
    def _extract_keywords(self, content: str) -> List[str]:
        """본문에서 키워드 추출"""
        words = content.lower().split()
        stopwords = {"the", "a", "an", "and", "or", "but", "in", "on", "at", "to"}
        keywords = [word for word in words if word not in stopwords and len(word) > 3]
        return list(set(keywords))[:10]
