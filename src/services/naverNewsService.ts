import axios from 'axios';

interface NaverNewsResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverNewsItem[];
}

interface NaverNewsItem {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
}

export class NaverNewsService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly baseUrl: string = 'https://openapi.naver.com/v1/search/news.json';

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  async searchNews(query: string, display: number = 10, start: number = 1): Promise<NaverNewsItem[]> {
    try {
      const response = await axios.get<NaverNewsResponse>(this.baseUrl, {
        params: {
          query,
          display,
          start,
          sort: 'date'
        },
        headers: {
          'X-Naver-Client-Id': this.clientId,
          'X-Naver-Client-Secret': this.clientSecret
        }
      });

      return response.data.items;
    } catch (error) {
      console.error('네이버 뉴스 검색 실패:', error);
      return [];
    }
  }

  async getStockNews(symbol: string, companyName: string): Promise<NaverNewsItem[]> {
    try {
      // 종목 코드와 회사명을 모두 사용하여 검색
      const query = `${symbol} ${companyName}`;
      const response = await this.searchNews(query, 20);
      
      // 관련성이 높은 뉴스만 필터링
      return response.filter(item => 
        item.title.includes(symbol) || 
        item.title.includes(companyName) ||
        item.description.includes(symbol) || 
        item.description.includes(companyName)
      );
    } catch (error) {
      console.error('주식 관련 뉴스 검색 실패:', error);
      return [];
    }
  }

  async getMarketNews(): Promise<NaverNewsItem[]> {
    try {
      // 증시 관련 키워드로 검색
      const queries = ['코스피', '코스닥', '주식시장', '증시'];
      const newsPromises = queries.map(query => this.searchNews(query, 5));
      const newsResults = await Promise.all(newsPromises);
      
      // 중복 제거 및 최신순 정렬
      const allNews = newsResults.flat();
      const uniqueNews = Array.from(new Map(allNews.map(item => 
        [item.link, item]
      )).values());
      
      return uniqueNews.sort((a, b) => 
        new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      );
    } catch (error) {
      console.error('시장 뉴스 검색 실패:', error);
      return [];
    }
  }
} 