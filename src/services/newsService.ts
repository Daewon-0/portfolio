import axios from 'axios';

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: Article[];
}

interface Article {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export class NewsService {
  private readonly apiKey: string;
  private readonly baseUrl: string = 'https://newsapi.org/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getStockNews(symbol: string, from?: string, to?: string): Promise<Article[]> {
    try {
      const response = await axios.get<NewsApiResponse>(`${this.baseUrl}/everything`, {
        params: {
          q: symbol,
          language: 'ko',
          from,
          to,
          sortBy: 'publishedAt',
          apiKey: this.apiKey
        }
      });

      return response.data.articles;
    } catch (error) {
      console.error('뉴스 데이터 가져오기 실패:', error);
      return [];
    }
  }

  async getMarketNews(): Promise<Article[]> {
    try {
      const response = await axios.get<NewsApiResponse>(`${this.baseUrl}/top-headlines`, {
        params: {
          country: 'kr',
          category: 'business',
          apiKey: this.apiKey
        }
      });

      return response.data.articles;
    } catch (error) {
      console.error('시장 뉴스 가져오기 실패:', error);
      return [];
    }
  }

  async searchNews(query: string): Promise<Article[]> {
    try {
      const response = await axios.get<NewsApiResponse>(`${this.baseUrl}/everything`, {
        params: {
          q: query,
          language: 'ko',
          sortBy: 'relevancy',
          apiKey: this.apiKey
        }
      });

      return response.data.articles;
    } catch (error) {
      console.error('뉴스 검색 실패:', error);
      return [];
    }
  }
} 