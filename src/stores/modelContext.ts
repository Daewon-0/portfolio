import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ModelContextService, ModelContext, ModelResponse } from '@/services/modelContextService';

export const useModelContextStore = defineStore('modelContext', () => {
  // 상태
  const contexts = ref<ModelContext[]>([]);
  const currentContext = ref<ModelContext | null>(null);
  const contextHistory = ref<ModelResponse[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 서비스 인스턴스
  const contextService = new ModelContextService(
    import.meta.env.VITE_MCP_API_URL,
    import.meta.env.VITE_MCP_API_KEY
  );

  // 게터
  const getCurrentContext = computed(() => currentContext.value);
  const getContextHistory = computed(() => contextHistory.value);

  // 액션
  const createNewContext = async (context: Partial<ModelContext>) => {
    loading.value = true;
    error.value = null;
    
    try {
      const newContext = await contextService.createContext(context);
      contexts.value.push(newContext);
      currentContext.value = newContext;
      return newContext;
    } catch (e) {
      error.value = e instanceof Error ? e.message : '컨텍스트 생성 실패';
      console.error('컨텍스트 생성 실패:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const loadContext = async (contextId: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      const [context, history] = await Promise.all([
        contextService.getContext(contextId),
        contextService.getContextHistory(contextId)
      ]);
      
      currentContext.value = context;
      contextHistory.value = history;
      return context;
    } catch (e) {
      error.value = e instanceof Error ? e.message : '컨텍스트 로딩 실패';
      console.error('컨텍스트 로딩 실패:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateCurrentContext = async (updates: Partial<ModelContext>) => {
    if (!currentContext.value) {
      throw new Error('현재 활성화된 컨텍스트가 없습니다.');
    }

    loading.value = true;
    error.value = null;
    
    try {
      const updated = await contextService.updateContext(
        currentContext.value.contextId,
        updates
      );
      currentContext.value = updated;
      return updated;
    } catch (e) {
      error.value = e instanceof Error ? e.message : '컨텍스트 업데이트 실패';
      console.error('컨텍스트 업데이트 실패:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const generateResponse = async (input: string) => {
    if (!currentContext.value) {
      throw new Error('현재 활성화된 컨텍스트가 없습니다.');
    }

    loading.value = true;
    error.value = null;
    
    try {
      const response = await contextService.generateResponse(
        currentContext.value.contextId,
        input
      );
      contextHistory.value.push(response);
      return response;
    } catch (e) {
      error.value = e instanceof Error ? e.message : '응답 생성 실패';
      console.error('응답 생성 실패:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const loadContextList = async (page: number = 1, limit: number = 10) => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await contextService.listContexts(page, limit);
      contexts.value = result.contexts;
      return result;
    } catch (e) {
      error.value = e instanceof Error ? e.message : '컨텍스트 목록 로딩 실패';
      console.error('컨텍스트 목록 로딩 실패:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const deleteContext = async (contextId: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      await contextService.deleteContext(contextId);
      contexts.value = contexts.value.filter(c => c.contextId !== contextId);
      if (currentContext.value?.contextId === contextId) {
        currentContext.value = null;
        contextHistory.value = [];
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '컨텍스트 삭제 실패';
      console.error('컨텍스트 삭제 실패:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    // 상태
    contexts,
    currentContext,
    contextHistory,
    loading,
    error,

    // 게터
    getCurrentContext,
    getContextHistory,

    // 액션
    createNewContext,
    loadContext,
    updateCurrentContext,
    generateResponse,
    loadContextList,
    deleteContext
  };
}); 