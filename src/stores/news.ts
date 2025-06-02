import { defineStore } from 'pinia';
import { ref } from 'vue';
import { NewsService } from '@/services/newsService';
import { NaverNewsService } from '@/services/naverNewsService';

interface NewsItem {
  title: string;
  link: string;
  description: string;
  publishedAt: string;
  source: string;
}

export const useNewsStore = defineStore('news', () => {
  // 상태
  const newsItems = ref<NewsItem[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // NewsAPI 서비스 인스턴스
  const newsService = new NewsService(import.meta.env.VITE_NEWS_API_KEY);
  
  // 네이버 뉴스 API 서비스 인스턴스
  const naverNewsService = new NaverNewsService(
    import.meta.env.VITE_NAVER_CLIENT_ID,
    import.meta.env.VITE_NAVER_CLIENT_SECRET
  );

  // 액션
  const fetchStockNews = async (symbol: string, companyName: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      // NewsAPI와 네이버 뉴스 API에서 동시에 데이터 가져오기
      const [newsApiResults, naverResults] = await Promise.all([
        newsService.getStockNews(symbol),
        naverNewsService.getStockNews(symbol, companyName)
      ]);

      // NewsAPI 결과 변환
      const newsApiItems = newsApiResults.map(item => ({
        title: item.title,
        link: item.url,
        description: item.description || '',
        publishedAt: item.publishedAt,
        source: item.source.name
      }));

      // 네이버 뉴스 결과 변환
      const naverItems = naverResults.map(item => ({
        title: item.title.replace(/(<([^>]+)>)/gi, ''), // HTML 태그 제거
        link: item.link,
        description: item.description.replace(/(<([^>]+)>)/gi, ''), // HTML 태그 제거
        publishedAt: item.pubDate,
        source: '네이버 뉴스'
      }));

      // 두 결과 합치기 및 중복 제거
      const allNews = [...newsApiItems, ...naverItems];
      const uniqueNews = Array.from(
        new Map(allNews.map(item => [item.link, item])).values()
      );

      // 최신순 정렬
      newsItems.value = uniqueNews.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    } catch (e) {
      error.value = e instanceof Error ? e.message : '뉴스 데이터 로딩 실패';
      console.error('뉴스 데이터 로딩 실패:', e);
    } finally {
      loading.value = false;
    }
  };

  const fetchMarketNews = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      // NewsAPI와 네이버 뉴스 API에서 동시에 데이터 가져오기
      const [newsApiResults, naverResults] = await Promise.all([
        newsService.getMarketNews(),
        naverNewsService.getMarketNews()
      ]);

      // NewsAPI 결과 변환
      const newsApiItems = newsApiResults.map(item => ({
        title: item.title,
        link: item.url,
        description: item.description || '',
        publishedAt: item.publishedAt,
        source: item.source.name
      }));

      // 네이버 뉴스 결과 변환
      const naverItems = naverResults.map(item => ({
        title: item.title.replace(/(<([^>]+)>)/gi, ''),
        link: item.link,
        description: item.description.replace(/(<([^>]+)>)/gi, ''),
        publishedAt: item.pubDate,
        source: '네이버 뉴스'
      }));

      // 두 결과 합치기 및 중복 제거
      const allNews = [...newsApiItems, ...naverItems];
      const uniqueNews = Array.from(
        new Map(allNews.map(item => [item.link, item])).values()
      );

      // 최신순 정렬
      newsItems.value = uniqueNews.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    } catch (e) {
      error.value = e instanceof Error ? e.message : '뉴스 데이터 로딩 실패';
      console.error('뉴스 데이터 로딩 실패:', e);
    } finally {
      loading.value = false;
    }
  };

  return {
    // 상태
    newsItems,
    loading,
    error,
    
    // 액션
    fetchStockNews,
    fetchMarketNews
  };
}); 