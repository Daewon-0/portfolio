import axios from 'axios';

export interface ModelContext {
  modelId: string;
  contextId: string;
  prompt: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  stop: string[];
  metadata: Record<string, any>;
}

export interface ModelResponse {
  contextId: string;
  response: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata: Record<string, any>;
}

export class ModelContextService {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async createContext(context: Partial<ModelContext>): Promise<ModelContext> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/contexts`,
        context,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('컨텍스트 생성 실패:', error);
      throw error;
    }
  }

  async getContext(contextId: string): Promise<ModelContext> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/contexts/${contextId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('컨텍스트 조회 실패:', error);
      throw error;
    }
  }

  async updateContext(contextId: string, updates: Partial<ModelContext>): Promise<ModelContext> {
    try {
      const response = await axios.patch(
        `${this.baseUrl}/contexts/${contextId}`,
        updates,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('컨텍스트 업데이트 실패:', error);
      throw error;
    }
  }

  async deleteContext(contextId: string): Promise<void> {
    try {
      await axios.delete(
        `${this.baseUrl}/contexts/${contextId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
    } catch (error) {
      console.error('컨텍스트 삭제 실패:', error);
      throw error;
    }
  }

  async generateResponse(contextId: string, input: string): Promise<ModelResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/contexts/${contextId}/generate`,
        { input },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('응답 생성 실패:', error);
      throw error;
    }
  }

  async listContexts(page: number = 1, limit: number = 10): Promise<{
    contexts: ModelContext[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/contexts`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          },
          params: {
            page,
            limit
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('컨텍스트 목록 조회 실패:', error);
      throw error;
    }
  }

  async getContextHistory(contextId: string): Promise<ModelResponse[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/contexts/${contextId}/history`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('컨텍스트 히스토리 조회 실패:', error);
      throw error;
    }
  }
} 