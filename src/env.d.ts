/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RPC_URL: string
  readonly VITE_GRAPH_API_URL: string
  readonly VITE_MCP_CONTRACT_ADDRESS: string
  readonly VITE_MCP_API_URL: string
  readonly VITE_MCP_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 