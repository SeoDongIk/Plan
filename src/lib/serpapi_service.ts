export interface SerpApiParams {
  q: string;
  engine?: string;
  location?: string;
  hl?: string;
  gl?: string;
  google_domain?: string;
  num?: number;
}

export async function fetchSerpData(params: SerpApiParams) {
  const apiKey = process.env.SERP_API_KEY;
  if (!apiKey) {
    throw new Error("SERP_API_KEY is not defined in environment variables.");
  }

  const queryParams = new URLSearchParams({
    ...(params as any),
    api_key: apiKey,
  });

  const response = await fetch(`https://serpapi.com/search.json?${queryParams.toString()}`);

  if (!response.ok) {
    throw new Error(`SerpApi request failed with status ${response.status}`);
  }

  return response.json();
}

export async function getAITrends() {
  const trends = await fetchSerpData({
    q: "AI 업무 자동화 트렌드 2025",
    engine: "google",
    gl: "kr",
    hl: "ko",
    num: 5
  });

  return {
    organic_results: trends.organic_results?.slice(0, 5).map((r: any) => ({
      title: r.title,
      link: r.link,
      snippet: r.snippet
    })) || [],
    related_questions: trends.questions_and_answers || trends.related_questions || []
  };
}

export async function getShoppingLink(keyword: string) {
  const shopping = await fetchSerpData({
    q: keyword,
    engine: "google_shopping",
    gl: "kr",
    hl: "ko",
    num: 3
  });

  const results = shopping.shopping_results?.map((item: any) => ({
    title: item.title,
    price: item.price || item.extracted_price,
    thumbnail: item.thumbnail,
    link: item.product_link || item.link || item.source_link, // 여러 속성 중 속성 우선순위
    source: item.source
  })) || [];

  return results.length > 0 ? results[0] : null;
}

/**
 * 특정 주제에 대한 구글 검색 상위 웹문서 타이틀과 스니펫을 가져와
 * AI 프롬프트에 제공할 컨텍스트 문자열로 만듭니다.
 */
export async function getSearchContext(topic: string): Promise<string> {
  try {
    const data = await fetchSerpData({
      q: topic,
      engine: "google",
      gl: "kr",
      hl: "ko",
      num: 5 // 상위 5개만 추출
    });

    let contextStr = "### 실시간 검색 기반 참고 데이터 ###\n";
    
    if (data.organic_results) {
      contextStr += data.organic_results.slice(0, 5).map((r: any, i: number) => 
        `[${i+1}] ${r.title}\n발췌: ${r.snippet}`
      ).join("\n\n");
    }

    if (data.related_questions) {
      contextStr += "\n\n### 연관 질문(People Also Ask) 모음 ###\n";
      contextStr += data.related_questions.map((q: any) => `- ${q.question}`).join("\n");
    }

    return contextStr;
  } catch (err) {
    console.error("Search context extraction failed:", err);
    return "";
  }
}

/**
 * 유튜브 모바일 검색 결과를 통해 현재 AI 트렌딩 영상들의 제목과 조회수 힌트를 가져옵니다.
 */
export async function getYouTubeTrends(keyword: string = "AI 자동화 전략"): Promise<string> {
  try {
    const data = await fetchSerpData({
      search_query: keyword, // YouTube 엔진은 q 대신 search_query를 요구함
      engine: "youtube",
    } as any);

    let context = "### 최근 YouTube 흥행 구조 (영상 제목 및 트렌드) ###\n";
    if (data.video_results) {
      context += data.video_results.slice(0, 10).map((v: any) => 
        `- [조회수 ${v.views || 'N/A'}] ${v.title}`
      ).join("\n");
    }
    return context;
  } catch (e) {
    console.error("YouTube trends fetching failed", e);
    return "";
  }
}

/**
 * 구글 검색의 연관 검색어(Related Searches)와 자동 완성(Autocomplete) 힌트를 가져옵니다.
 */
export async function getGoogleKeywordIdeas(keyword: string = "생성형 AI"): Promise<string> {
  try {
    const data = await fetchSerpData({
      q: keyword,
      engine: "google",
      gl: "kr",
      hl: "ko"
    });

    let context = "### Google 검색 유입 키워드 (연관 검색어 및 질문) ###\n";
    if (data.related_searches) {
      context += "1. 연관 검색어:\n" + data.related_searches.map((r: any) => `- ${r.query}`).join("\n") + "\n\n";
    }
    if (data.related_questions) {
      context += "2. 연관 질문 (People Also Ask):\n" + data.related_questions.map((q: any) => `- ${q.question}`).join("\n");
    }
    
    return context;
  } catch (e) {
    console.error("Google Keyword Ideas fetching failed", e);
    return "";
  }
}
