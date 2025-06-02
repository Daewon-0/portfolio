<template>
  <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
    <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Model Context Manager</h2>
    
    <!-- 로딩 상태 -->
    <div v-if="store.loading" class="flex justify-center items-center h-32">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
    </div>
    
    <!-- 에러 메시지 -->
    <div v-else-if="store.error" class="text-red-500 text-center py-4">
      {{ store.error }}
    </div>
    
    <div v-else class="space-y-6">
      <!-- 컨텍스트 생성 폼 -->
      <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">새 컨텍스트 생성</h3>
        <form @submit.prevent="createContext" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">모델 ID</label>
            <input
              v-model="newContext.modelId"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">프롬프트</label>
            <textarea
              v-model="newContext.prompt"
              rows="3"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            ></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Temperature</label>
              <input
                v-model.number="newContext.temperature"
                type="number"
                min="0"
                max="2"
                step="0.1"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Max Tokens</label>
              <input
                v-model.number="newContext.maxTokens"
                type="number"
                min="1"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            type="submit"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            컨텍스트 생성
          </button>
        </form>
      </div>

      <!-- 현재 컨텍스트 정보 -->
      <div v-if="store.currentContext" class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">현재 컨텍스트</h3>
        <div class="space-y-2">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            <span class="font-medium">Context ID:</span> {{ store.currentContext.contextId }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            <span class="font-medium">Model ID:</span> {{ store.currentContext.modelId }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            <span class="font-medium">Prompt:</span> {{ store.currentContext.prompt }}
          </p>
        </div>
      </div>

      <!-- 응답 생성 -->
      <div v-if="store.currentContext" class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">응답 생성</h3>
        <div class="space-y-4">
          <textarea
            v-model="userInput"
            rows="3"
            placeholder="메시지를 입력하세요..."
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          ></textarea>
          <button
            @click="generateResponse"
            class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            :disabled="!userInput.trim()"
          >
            응답 생성
          </button>
        </div>
      </div>

      <!-- 컨텍스트 히스토리 -->
      <div v-if="store.contextHistory.length > 0" class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">응답 히스토리</h3>
        <div class="space-y-4">
          <div
            v-for="(response, index) in store.contextHistory"
            :key="index"
            class="bg-white dark:bg-gray-600 p-4 rounded-lg"
          >
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ response.response }}</p>
            <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
              토큰 사용량: {{ response.usage.totalTokens }}
              (프롬프트: {{ response.usage.promptTokens }},
              완성: {{ response.usage.completionTokens }})
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useModelContextStore } from '@/stores/modelContext';
import type { ModelContext } from '@/services/modelContextService';

const store = useModelContextStore();

// 새 컨텍스트 생성을 위한 상태
const newContext = ref<Partial<ModelContext>>({
  modelId: '',
  prompt: '',
  temperature: 0.7,
  maxTokens: 2000,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  stop: []
});

// 응답 생성을 위한 상태
const userInput = ref('');

// 메서드
const createContext = async () => {
  try {
    await store.createNewContext(newContext.value);
    // 폼 초기화
    newContext.value = {
      modelId: '',
      prompt: '',
      temperature: 0.7,
      maxTokens: 2000,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      stop: []
    };
  } catch (error) {
    console.error('컨텍스트 생성 실패:', error);
  }
};

const generateResponse = async () => {
  if (!userInput.value.trim()) return;
  
  try {
    await store.generateResponse(userInput.value);
    userInput.value = ''; // 입력 필드 초기화
  } catch (error) {
    console.error('응답 생성 실패:', error);
  }
};
</script> 