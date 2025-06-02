import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
});

export interface NewsRequest {
  query: string;
  sources: string[];
  dateRange?: string;
}

export interface ContextRequest {
  modelId: string;
  prompt: string;
  temperature: number;
  maxTokens: number;
}

export const newsApi = {
  async collectNews(request: NewsRequest) {
    const response = await api.post('/api/news/collect', request);
    return response.data;
  },

  async analyzeNews(request: ContextRequest) {
    const response = await api.post('/api/news/analyze', request);
    return response.data;
  },

  async getNewsSummary() {
    const response = await api.get('/api/news/summary');
    return response.data;
  }
}; 