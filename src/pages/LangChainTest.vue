<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-8">LangChain 테스트</h1>
      
      <!-- 체인 선택 -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-200">체인 선택</h2>
        <div class="flex space-x-4">
          <button
            v-for="chain in availableChains"
            :key="chain.id"
            @click="selectChain(chain.id)"
            :class="[
              'px-4 py-2 rounded-lg transition-colors',
              selectedChain === chain.id
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-blue-800 hover:bg-blue-50 dark:hover:bg-blue-700'
            ]"
          >
            {{ chain.name }}
          </button>
        </div>
      </div>

      <!-- 입력 폼 -->
      <div class="bg-white dark:bg-blue-800 rounded-lg p-6 shadow-lg mb-8">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            프롬프트 입력
          </label>
          <textarea
            v-model="userInput"
            rows="4"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-blue-900 dark:border-blue-700"
            placeholder="질문을 입력하세요..."
          ></textarea>
        </div>
        <button
          @click="processChain"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? '처리 중...' : '실행' }}
        </button>
      </div>

      <!-- 결과 표시 -->
      <div v-if="result" class="bg-white dark:bg-blue-800 rounded-lg p-6 shadow-lg">
        <h3 class="text-lg font-semibold mb-4 text-blue-800 dark:text-blue-200">결과</h3>
        <div class="prose dark:prose-invert max-w-none">
          <div v-html="markdownToHtml(result)"></div>
        </div>
      </div>

      <!-- 에러 메시지 -->
      <div v-if="error" class="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChatOpenAI } from '@langchain/openai'
import { ConversationChain, LLMChain } from 'langchain/chains'
import { PromptTemplate } from '@langchain/core/prompts'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

// 상태 관리
const userInput = ref('')
const result = ref('')
const loading = ref(false)
const error = ref('')
const selectedChain = ref('conversation')

// 사용 가능한 체인 목록
const availableChains = [
  { id: 'conversation', name: '대화 체인' },
  { id: 'structured', name: '구조화된 출력' },
  { id: 'translation', name: '번역' }
]

// OpenAI 모델 초기화
const model = new ChatOpenAI({
  modelName: 'gpt-3.5-turbo',
  temperature: 0.7
})

// 프롬프트 템플릿
const translationPrompt = PromptTemplate.fromTemplate(
  '다음 텍스트를 한국어로 번역해주세요: {text}'
)

const structuredPrompt = PromptTemplate.fromTemplate(`
다음 주제에 대해 구조화된 정보를 제공해주세요:
주제: {topic}

다음 형식으로 응답해주세요:
- 개요
- 주요 특징 (3가지)
- 장점
- 단점
- 결론
`)

// 체인 선택 처리
const selectChain = (chainId: string) => {
  selectedChain.value = chainId
  result.value = ''
  error.value = ''
}

// 마크다운 변환
const markdownToHtml = (markdown: string) => {
  return DOMPurify.sanitize(marked(markdown))
}

// 체인 처리
const processChain = async () => {
  if (!userInput.value.trim()) {
    error.value = '입력을 입력해주세요.'
    return
  }

  loading.value = true
  error.value = ''
  result.value = ''

  try {
    let response: string

    switch (selectedChain.value) {
      case 'conversation': {
        const chain = new ConversationChain({ llm: model })
        const res = await chain.call({ input: userInput.value })
        response = res.response
        break
      }
      case 'structured': {
        const chain = new LLMChain({
          llm: model,
          prompt: structuredPrompt
        })
        const res = await chain.call({ topic: userInput.value })
        response = res.text
        break
      }
      case 'translation': {
        const chain = new LLMChain({
          llm: model,
          prompt: translationPrompt
        })
        const res = await chain.call({ text: userInput.value })
        response = res.text
        break
      }
      default:
        throw new Error('지원하지 않는 체인 유형입니다.')
    }

    result.value = response
  } catch (e) {
    error.value = e instanceof Error ? e.message : '처리 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.prose {
  @apply text-gray-800 dark:text-gray-200;
}

.prose h1, .prose h2, .prose h3 {
  @apply text-blue-900 dark:text-blue-100;
}

.prose ul, .prose ol {
  @apply my-4 list-disc list-inside;
}

.prose li {
  @apply mb-2;
}
</style> 