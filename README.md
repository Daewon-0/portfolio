이 프로젝트의 시작은 다음 명령어로 시작한다.
```bash
git clone https://github.com/Daewon-0/portfolio/tree/master
uv python main.py
```

이 프로젝트는 uv를 사용한다.
uv는 Python 패키지 매니저로써 pip의 대체재 역할을 한다.
uv는 가상환경이나 패키지 설치를 한번에 해결해준다.

---
# 프로젝트 개요

목표: 뉴스 데이터를 수집하고, 가공하여 저장한 뒤, 검색/분석/요약 등으로 활용 가능한 시스템 구축

주요 기능:

뉴스 헤드라인 + 본문 검색 및 저장

단기/장기 데이터 분리 저장

LangChain을 통한 제어

RAG 질의응답 처리

Think MCP를 통한 심화 분석 기능

## 전체 컴포넌트 구성
1. 사용자 입력 (User Layer)<br>뉴스 수집/검색/분석 등의 명령어를 입력

2. LangChain Controller (Core Logic)<br>사용자 명령어 처리
<br>각 단계별 워크플로우 실행
<br>외부 API(MCP) 호출 관리
<br>LangGraph 실행 및 상태 관리

3. Tavily MCP (Smithery API 기반)
<br>실시간 뉴스 검색 API (헤드라인 + 본문)
<br>LangChain이 Tavily MCP를 검색
<br>Retriever로 활용

4. Think MCP (Smithery API 기반)
<br>복잡한 뉴스 분석, 윤리 검토, 정책 검토 등 심화 사고 처리
<br>LangChain이 필요할 때 Think MCP에 분석 요청

5. LangGraph Workflow (데이터 파이프라인)
<br>Tavily 검색 결과를 LangGraph로 전달
<br>뉴스 수집/저장/요약/분석 처리 노드 구성
<br>각 노드는 DB 저장소와 연동

6. 저장소 (DB Layer)
<br>장기 저장소: 1년치 뉴스 헤드라인 저장
<br>단기 저장소: 1개월 내 뉴스 본문 요약 및 분석 결과 저장

## 데이터 흐름 (시나리오 예시)
```
사용자 → "최근 AI 뉴스 수집해줘" 명령

LangChain → Tavily MCP 호출 → 헤드라인/본문 검색

LangGraph 실행:

헤드라인 → 장기 저장소에 저장

본문 요약 → 단기 저장소에 저장

사용자 → "이 뉴스는 어떤 윤리 문제를 담고 있지?" 명령

LangChain → Think MCP 호출 → 분석 결과 → 단기 저장소에 저장

사용자 → "이번 달 AI 뉴스 요약해줘" → LangGraph + RAG → DB 질의 → 응답
```

### 요약 (한 줄 설명)
사용자가 뉴스 수집/검색/분석 명령을 입력하면,
LangChain이 Tavily MCP와 Think MCP를 통해 검색 및 분석 요청을 보내고,
그 결과를 LangGraph 파이프라인으로 가공하여,
단기/장기 저장소(DB)에 저장하며,
최종적으로 질의응답 및 분석 결과를 제공하는 AI 파이프라인 시스템.

### 키워드
LangChain

LangGraph

Tavily MCP (검색)

Think MCP (사고/분석)

뉴스 저장소 (장기/단기)

RAG 시스템

AI 워크플로우

portfolio/
├── main.py                    # 메인 실행 파일
├── src/
│   ├── langchain_controller.py  # LangChain 컨트롤러
│   ├── langgraph_workflow.py    # LangGraph 워크플로우
│   └── storage/
│       └── database.py          # 데이터베이스 관리