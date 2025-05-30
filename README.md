이 프로젝트의 시작은 다음 명령어로 시작한다.
```bash
git clone https://github.com/Daewon-0/portfolio/tree/master
uv python main.py
```

이 프로젝트는 uv를 사용한다.
uv는 Python 패키지 매니저로써 pip의 대체재 역할을 한다.
uv는 가상환경이나 패키지 설치를 한번에 해결해준다.
---
# 프로젝트 아키텍처

```mermaid
%%{init: { "theme": "redux", "flowchart": {"defaultRenderer": "elk"} } }%%
flowchart TD
 subgraph User["사용자 / 명령어 입력"]
        A1["명령어 (뉴스 수집/요약/검색/분석)"]
  end
 subgraph LangChain["LangChain Controller"]
        L1["뉴스 수집 명령 처리"]
        L2["Tavily API 호출 (검색)"]
        L3["Think MCP API 호출 (사고/분석)"]
        L4["LangGraph Workflow 실행"]
  end
 subgraph TavilyMCP["Tavily MCP (Smithery API)"]
        T1["검색 API (헤드라인+본문)"]
  end
 subgraph ThinkMCP["Think MCP (Smithery API)"]
        P1["복잡한 사고/분석 처리"]
  end
 subgraph LangGraph["LangGraph Server"]
        G1["뉴스 수집 노드"]
        G2["헤드라인 저장 노드"]
        G3["본문 요약 저장 노드"]
        G4["RAG 질의응답 처리"]
        G5["분석 결과 처리 노드"]
  end
 subgraph Storage["뉴스 저장소 (DB)"]
        S1["장기 저장소 (1년, 헤드라인)"]
        S2["단기 저장소 (1개월, 본문 요약)"]
  end
    A1 --> L1 & G4
    L1 --> L2 & L3 & L4 & G5
    L2 --> T1
    T1 --> L1
    L3 --> P1
    P1 --> L1
    L4 --> G1
    G1 --> G2 & G3
    G2 --> S1
    G3 --> S2
    G4 --> S1 & S2
    G5 --> S2
```