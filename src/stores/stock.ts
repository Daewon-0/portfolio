import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface StockData {
  timestamps: string[]
  actual: number[]
  predicted: number[]
}

export interface NewsItem {
  id: number
  title: string
  content: string
  summary: string
  url: string
  source: string
  publishedAt: Date
  sentiment: 'positive' | 'negative' | 'neutral'
  relevance: number
  tags: string[]
}

export const useStore = defineStore('stock', () => {
  // 상태
  const stockData = ref<Record<string, StockData>>({})
  const news = ref<NewsItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 게터
  const getStockData = computed(() => (symbol: string) => stockData.value[symbol])
  
  const getRelevantNews = computed(() => (symbol: string) => {
    return news.value.filter(item => 
      item.tags.includes(symbol) || 
      item.content.includes(symbol)
    ).sort((a, b) => b.relevance - a.relevance)
  })

  // 액션
  const fetchStockData = async (symbol: string, timeframe: string) => {
    loading.value = true
    error.value = null

    try {
      // API 호출
      const response = await fetch(`/api/stock/${symbol}?timeframe=${timeframe}`)
      if (!response.ok) throw new Error('데이터 로딩 실패')
      
      const data = await response.json()
      stockData.value[symbol] = data
      return data
    } catch (e) {
      error.value = e instanceof Error ? e.message : '알 수 없는 오류 발생'
      throw e
    } finally {
      loading.value = false
    }
  }

  const fetchNews = async (symbol: string) => {
    loading.value = true
    error.value = null

    try {
      // API 호출
      const response = await fetch(`/api/news?symbol=${symbol}`)
      if (!response.ok) throw new Error('뉴스 데이터 로딩 실패')
      
      const data = await response.json()
      news.value = data
      return data
    } catch (e) {
      error.value = e instanceof Error ? e.message : '알 수 없는 오류 발생'
      throw e
    } finally {
      loading.value = false
    }
  }

  const runLSTMAnalysis = async (symbol: string, timeframe: string) => {
    loading.value = true
    error.value = null

    try {
      // LSTM 분석 API 호출
      const response = await fetch('/api/analysis/lstm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ symbol, timeframe })
      })
      
      if (!response.ok) throw new Error('LSTM 분석 실패')
      
      const data = await response.json()
      return data
    } catch (e) {
      error.value = e instanceof Error ? e.message : '알 수 없는 오류 발생'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    // 상태
    stockData,
    news,
    loading,
    error,
    
    // 게터
    getStockData,
    getRelevantNews,
    
    // 액션
    fetchStockData,
    fetchNews,
    runLSTMAnalysis
  }
}) 