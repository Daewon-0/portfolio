from langchain.chains import LLMChain
from langchain.agents import Tool, AgentExecutor
from langchain.memory import ConversationBufferMemory

from src.langchain_controller import LangChainController
from src.langgraph_workflow import NewsWorkflow

from dotenv import load_dotenv
load_dotenv() # .env 파일 로드

class NewsSystem:
    def __init__(self):
        self.memory = ConversationBufferMemory(memory_key="chat_history")
        
    async def process_command(self, command: str):
        """사용자 명령어 처리"""
        pass

    async def collect_news(self):
        """Tavily를 통한 뉴스 수집"""
        pass

    async def analyze_news(self):
        """Think MCP를 통한 뉴스 분석"""
        pass

async def main():
    system = NewsSystem()
    # 시스템 초기화 및 실행
    
if __name__ == "__main__":
    import asyncio
    asyncio.run(main())