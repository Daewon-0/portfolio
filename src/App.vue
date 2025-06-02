<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <nav class="bg-white dark:bg-gray-800 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <router-link 
              to="/" 
              class="flex items-center px-4 text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400"
            >
              홈
            </router-link>
            <router-link 
              to="/langchain" 
              class="flex items-center px-4 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
            >
              LangChain 테스트
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <main>
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
// 필요한 경우 여기에 스크립트 추가
</script> 