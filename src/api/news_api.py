from sanic import Sanic, response
from sanic.response import json
from sanic_ext import validate

from dataclasses import dataclass
from typing import List, Dict, Optional
from datetime import datetime

from ..langchain_controller import LangChainController

app = Sanic("news_collector")
controller = LangChainController()

@dataclass
class NewsSearchRequest:
    query: str
    max_results: int = 10

@app.post("/news/search")
@validate(json=NewsSearchRequest)
async def search_news(request, body: NewsSearchRequest):
    """뉴스 검색 API"""
    try:
        results = await controller.call_tavily_api(body.query)
        message = await controller.process_news_command(f"뉴스 검색 {body.query}")
        return json({
            "message": message,
            "count": len(results),
            "results": results
        })
    except Exception as e:
        return response.json({"error": str(e)}, status=500)

@app.get("/news/headlines")
async def get_headlines(request):
    """저장된 헤드라인 조회"""
    try:
        days = request.args.get("days", type=int)
        keywords = request.args.get("keywords")
        results = await controller.storage.get_headlines(days, keywords)
        return json(results)
    except Exception as e:
        return response.json({"error": str(e)}, status=500)

@app.get("/news/summaries")
async def get_summaries(request):
    """저장된 요약 조회"""
    try:
        days = request.args.get("days", type=int)
        headline_id = request.args.get("headline_id")
        results = await controller.storage.get_summaries(days, headline_id)
        return json(results)
    except Exception as e:
        return response.json({"error": str(e)}, status=500)

@app.get("/news/search/<keyword>")
async def search_stored_news(request, keyword: str):
    """저장된 뉴스 검색"""
    try:
        days = request.args.get("days", type=int)
        results = await controller.storage.search_news(keyword, days)
        return json(results)
    except Exception as e:
        return response.json({"error": str(e)}, status=500)

@app.websocket("/news/stream")
async def news_stream(request, ws):
    """실시간 뉴스 스트리밍"""
    try:
        while True:
            # 클라이언트로부터 검색어 수신
            query = await ws.recv()
            
            # 뉴스 검색 및 결과 전송
            results = await controller.call_tavily_api(query)
            await ws.send(json(results))
            
            # 저장소에 저장
            await controller.process_news_command(f"뉴스 검색 {query}")
    except Exception as e:
        await ws.send(json({"error": str(e)}))

@app.post("/news/analyze")
async def analyze_content(request):
    """뉴스 내용 분석"""
    try:
        content = request.json.get("content")
        if not content:
            return response.json({"error": "content is required"}, status=400)
            
        result = await controller.analyze_news(content)
        return json(result)
    except Exception as e:
        return response.json({"error": str(e)}, status=500)

@app.post("/news/summarize")
async def summarize_content(request):
    """뉴스 내용 요약"""
    try:
        content = request.json.get("content")
        if not content:
            return response.json({"error": "content is required"}, status=400)
            
        result = await controller.summarize_news(content)
        return json(result)
    except Exception as e:
        return response.json({"error": str(e)}, status=500)

@app.websocket("/news/analyze_stream")
async def analyze_stream(request, ws):
    """실시간 뉴스 분석 스트리밍"""
    try:
        while True:
            # 클라이언트로부터 뉴스 내용 수신
            content = await ws.recv()
            
            # 분석 및 요약 실행
            analysis = await controller.analyze_news(content)
            summary = await controller.summarize_news(content)
            
            # 결과 전송
            await ws.send(json({
                "analysis": analysis,
                "summary": summary
            }))
    except Exception as e:
        await ws.send(json({"error": str(e)}))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True) 