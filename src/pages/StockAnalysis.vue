<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- MCP 메트릭 -->
    <section class="px-6 py-8">
      <MCPMetrics />
    </section>

    <!-- 상단 대시보드 -->
    <section class="px-6 py-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">실시간 시장 동향</h3>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">KOSPI</span>
              <span :class="marketTrends.kospi > 0 ? 'text-red-500' : 'text-blue-500'">
                {{ marketTrends.kospi > 0 ? '▲' : '▼' }} {{ Math.abs(marketTrends.kospi).toFixed(2) }}%
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">KOSDAQ</span>
              <span :class="marketTrends.kosdaq > 0 ? 'text-red-500' : 'text-blue-500'">
                {{ marketTrends.kosdaq > 0 ? '▲' : '▼' }} {{ Math.abs(marketTrends.kosdaq).toFixed(2) }}%
              </span>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">LSTM 예측 신호</h3>
          <div class="space-y-4">
            <div v-for="signal in lstmSignals" :key="signal.symbol" class="flex items-center justify-between">
              <span class="text-gray-600 dark:text-gray-400">{{ signal.symbol }}</span>
              <div class="flex items-center space-x-2">
                <span :class="getSignalColor(signal.confidence)">
                  {{ signal.direction === 'up' ? '매수' : '매도' }}
                </span>
                <span class="text-sm text-gray-500">({{ signal.confidence }}%)</span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">뉴스 영향도</h3>
          <div class="space-y-2">
            <div v-for="impact in newsImpacts" :key="impact.category" class="flex items-center">
              <span class="text-gray-600 dark:text-gray-400 w-24">{{ impact.category }}</span>
              <div class="flex-1 ml-4">
                <div class="h-2 bg-gray-200 rounded-full">
                  <div
                    class="h-2 rounded-full"
                    :class="getImpactColor(impact.score)"
                    :style="{ width: `${impact.score}%` }"
                  ></div>
                </div>
              </div>
              <span class="ml-2 text-sm text-gray-500">{{ impact.score }}%</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 주식 차트 및 분석 -->
    <section class="px-6 py-8">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">LSTM 분석 차트</h2>
          <div class="flex space-x-4">
            <select 
              v-model="selectedStock"
              class="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-1"
            >
              <option v-for="stock in stocks" :key="stock.symbol" :value="stock.symbol">
                {{ stock.name }}
              </option>
            </select>
            <select 
              v-model="timeframe"
              class="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-1"
            >
              <option value="1D">1일</option>
              <option value="1W">1주</option>
              <option value="1M">1개월</option>
              <option value="3M">3개월</option>
            </select>
          </div>
        </div>
        <div class="h-96">
          <!-- 차트 컴포넌트가 여기에 들어갈 예정 -->
          <canvas ref="chartCanvas"></canvas>
        </div>
      </div>
    </section>

    <!-- 관련 뉴스 -->
    <section class="px-6 py-8">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">관련 뉴스</h2>
        <div v-if="newsStore.loading" class="flex justify-center items-center h-32">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
        </div>
        <div v-else-if="newsStore.error" class="text-red-500 text-center py-4">
          {{ newsStore.error }}
        </div>
        <div v-else class="space-y-6">
          <div v-for="news in newsStore.newsItems" :key="news.link" class="border-b border-gray-200 dark:border-gray-700 pb-4">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <a 
                  :href="news.link" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {{ news.title }}
                </a>
                <p class="text-gray-600 dark:text-gray-400 mt-1">{{ news.description }}</p>
                <div class="flex items-center mt-2 text-sm text-gray-500">
                  <span>{{ news.source }}</span>
                  <span class="mx-2">•</span>
                  <span>{{ formatDistanceToNow(new Date(news.publishedAt), { addSuffix: true, locale: ko }) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="!newsStore.loading && newsStore.newsItems.length === 0" class="text-center py-4 text-gray-500">
          관련 뉴스가 없습니다.
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useStore } from '@/stores/stock'
import { useNewsStore } from '@/stores/news'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import MCPMetrics from '@/components/ModelContextManager.vue'

Chart.register(...registerables)

// 상태 관리
const store = useStore()
const newsStore = useNewsStore()
const selectedStock = ref('005930') // 삼성전자
const timeframe = ref('1D')
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

// 시장 동향 데이터
const marketTrends = ref({
  kospi: 0.45,
  kosdaq: -0.23
})

// LSTM 신호 데이터
const lstmSignals = ref([
  { symbol: '삼성전자', direction: 'up', confidence: 85 },
  { symbol: 'SK하이닉스', direction: 'down', confidence: 72 },
  { symbol: '네이버', direction: 'up', confidence: 63 }
])

// 뉴스 영향도 데이터
const newsImpacts = ref([
  { category: '국내 경제', score: 75 },
  { category: '해외 시장', score: 45 },
  { category: '산업 동향', score: 60 }
])

// 주식 목록
const stocks = ref([
  { symbol: '005930', name: '삼성전자' },
  { symbol: '000660', name: 'SK하이닉스' },
  { symbol: '035420', name: '네이버' }
])

// 뉴스 데이터 로딩
const loadNewsData = async () => {
  if (selectedStock.value) {
    const stockInfo = stocks.value.find(s => s.symbol === selectedStock.value)
    if (stockInfo) {
      await newsStore.fetchStockNews(selectedStock.value, stockInfo.name)
    }
  }
}

// 유틸리티 함수들
const getSignalColor = (confidence: number) => {
  if (confidence >= 80) return 'text-green-500'
  if (confidence >= 60) return 'text-yellow-500'
  return 'text-red-500'
}

const getImpactColor = (score: number) => {
  if (score >= 70) return 'bg-green-500'
  if (score >= 40) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getSentimentColor = (sentiment: string) => {
  switch (sentiment) {
    case 'positive': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'negative': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
}

const getSentimentLabel = (sentiment: string) => {
  switch (sentiment) {
    case 'positive': return '긍정'
    case 'negative': return '부정'
    default: return '중립'
  }
}

const formatDate = (date: Date) => {
  return formatDistanceToNow(date, { addSuffix: true, locale: ko })
}

// 차트 초기화
const initChart = () => {
  if (!chartCanvas.value) return

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  if (chart) chart.destroy()

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [], // 시간 데이터
      datasets: [
        {
          label: '실제 가격',
          data: [], // 실제 가격 데이터
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        },
        {
          label: 'LSTM 예측',
          data: [], // LSTM 예측 데이터
          borderColor: 'rgb(255, 99, 132)',
          borderDash: [5, 5],
          tension: 0.1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: false
        }
      }
    }
  })
}

// 데이터 로딩
const loadData = async () => {
  try {
    // API 호출 및 데이터 업데이트 로직
    const data = await store.fetchStockData(selectedStock.value, timeframe.value)
    updateChart(data)
  } catch (error) {
    console.error('데이터 로딩 실패:', error)
  }
}

// 차트 업데이트
const updateChart = (data: any) => {
  if (!chart) return

  chart.data.labels = data.timestamps
  chart.data.datasets[0].data = data.actual
  chart.data.datasets[1].data = data.predicted
  chart.update()
}

// 감시자
watch([selectedStock, timeframe], () => {
  loadData()
  loadNewsData()
})

onMounted(() => {
  initChart()
  loadData()
  loadNewsData()
})
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
}
</style> 