from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
import os

class LangChainController:
    def __init__(self):
        self.memory = ConversationBufferMemory(memory_key="chat_history")
        self.smithery_api_key = os.getenv("SMITHERY_API_KEY")
        if not self.smithery_api_key:
            raise ValueError("SMITHERY_API_KEY 환경 변수가 설정되지 않았습니다.")
        
    async def process_news_command(self, command: str):
        """뉴스 수집 명령 처리"""
        pass
        
    async def call_tavily_api(self):
        """Tavily API 호출"""
        pass
        
    async def call_think_mcp(self):
        """Think MCP API 호출"""
        pass
        
    async def execute_langgraph_workflow(self):
        """LangGraph Workflow 실행"""
        pass 
