from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.chat_models import ChatOpenAI
from langchain.memory import ConversationBufferMemory
from langchain.text_splitter import RecursiveCharacterTextSplitter
from typing import List, Dict, Optional
import os

from .api.tavily_api import TavilyNewsAPI
from .storage.news_storage import NewsStorage

class LangChainController:
    def __init__(self):
        self.memory = ConversationBufferMemory(memory_key="chat_history")
        self.tavily_api = TavilyNewsAPI()
        self.storage = NewsStorage()
        self.smithery_api_key = os.getenv("SMITHERY_API_KEY")
        if not self.smithery_api_key:
            raise ValueError("SMITHERY_API_KEY 환경 변수가 설정되지 않았습니다.")
        
        # LLM 설정
        self.llm = ChatOpenAI(
            temperature=0.3,
            model_name="gpt-3.5-turbo"
        )
        
        # 요약 프롬프트
        self.summary_prompt = PromptTemplate(
            input_variables=["content"],
            template="""
            다음 뉴스 기사를 3-4문장으로 요약해주세요. 
            중요한 사실과 핵심 포인트를 포함해야 합니다.
            
            기사 내용:
            {content}
            
            요약:
            """
        )
        
        # 분석 프롬프트
        self.analysis_prompt = PromptTemplate(
            input_variables=["content"],
            template="""
            다음 뉴스 기사를 분석해주세요. 다음 항목들을 포함해야 합니다:
            1. 주요 이슈
            2. 영향력 있는 관계자/기관
            3. 잠재적 영향
            4. 관련 산업/분야
            
            기사 내용:
            {content}
            
            분석:
            """
        )
        
        # 요약 체인
        self.summary_chain = LLMChain(
            llm=self.llm,
            prompt=self.summary_prompt,
            verbose=True
        )
        
        # 분석 체인
        self.analysis_chain = LLMChain(
            llm=self.llm,
            prompt=self.analysis_prompt,
            verbose=True
        )
        
        # 텍스트 분할기
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=2000,
            chunk_overlap=200
        )
        
    async def process_news_command(self, command: str):
        """뉴스 수집 명령 처리"""
        search_query = command.replace("뉴스 검색", "").replace("뉴스 수집", "").strip()
        if not search_query:
            raise ValueError("검색어를 입력해주세요.")
            
        # Tavily API로 뉴스 검색
        news_items = await self.tavily_api.search_news(search_query)
        
        # 검색 결과 처리 및 저장
        for item in news_items:
            # 헤드라인 저장
            headline_id = await self.storage.save_headline({
                "title": item["title"],
                "url": item["url"],
                "source": item["source"],
                "keywords": item["keywords"]
            })
            
            # 본문 분할 (긴 텍스트 처리)
            content = item["content"]
            if len(content) > 2000:
                chunks = self.text_splitter.split_text(content)
                summaries = []
                analyses = []
                
                # 각 청크별 요약 및 분석
                for chunk in chunks:
                    summary = await self.summary_chain.arun(content=chunk)
                    analysis = await self.analysis_chain.arun(content=chunk)
                    summaries.append(summary)
                    analyses.append(analysis)
                
                # 최종 요약 및 분석 결합
                final_summary = " ".join(summaries)
                final_analysis = self._combine_analyses(analyses)
            else:
                # 짧은 텍스트는 직접 처리
                final_summary = await self.summary_chain.arun(content=content)
                final_analysis = await self.analysis_chain.arun(content=content)
            
            # 요약 정보 저장
            await self.storage.save_summary({
                "headline_id": headline_id,
                "content": content,
                "summary": final_summary,
                "analysis": final_analysis
            })
            
        return f"{len(news_items)}개의 뉴스를 수집하고 분석했습니다."
        
    def _combine_analyses(self, analyses: List[str]) -> Dict:
        """여러 분석 결과 통합"""
        # TODO: 더 나은 통합 로직 구현
        combined = "\n".join(analyses)
        return {
            "full_analysis": combined,
            "chunks_count": len(analyses)
        }
        
    async def call_tavily_api(self, query: str) -> List[Dict]:
        """Tavily API 직접 호출"""
        return await self.tavily_api.search_news(query)
        
    async def analyze_news(self, content: str) -> Dict:
        """뉴스 내용 분석"""
        analysis = await self.analysis_chain.arun(content=content)
        return {"analysis": analysis}
        
    async def summarize_news(self, content: str) -> Dict:
        """뉴스 내용 요약"""
        summary = await self.summary_chain.arun(content=content)
        return {"summary": summary}
        
    async def call_think_mcp(self):
        """Think MCP API 호출"""
        # TODO: Think MCP 구현
        pass
        
    async def execute_langgraph_workflow(self):
        """LangGraph Workflow 실행"""
        # TODO: LangGraph 워크플로우 구현
        pass 
