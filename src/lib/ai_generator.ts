import { generateWithGemini, PLATFORM_PROMPTS } from "./gemini_service";
import { getSearchContext, getShoppingLink } from "./serpapi_service";

export interface ContentRequest {
  level: 1 | 2 | 3;
  topic: string;
  count?: number;
}

export async function generateAIContent(request: ContentRequest) {
  const { level, topic, count = 1 } = request;

  const styles = [
    { name: "Provocative (도발형)", tone: "호기심을 자극하고 약간의 논쟁을 유도하는 스타일" },
    { name: "Educational (설명형)", tone: "차근차근 원리와 장점을 설명하는 친절한 스타일" },
    { name: "Practical (실무형)", tone: "바로 따라 할 수 있는 단계별 액션 플랜 중심" },
    { name: "Inspirational (인사이트형)", tone: "미래 전망과 가치를 강조하는 동기부여 스타일" }
  ];

  const platformMap: Record<number, keyof typeof PLATFORM_PROMPTS> = {
    1: "Threads",
    2: "YouTube",
    3: "WordPress"
  };

  const platform = platformMap[level] || "Threads";
  const variations = [];

  // Data-Driven Context Fetching (한 번만 호출하여 모든 변형에 공통 적용)
  console.log(`\n========================================`);
  console.log(`[AI Generator] Starting Data-Driven Flow for Topic: "${topic}"`);
  console.log(`========================================`);

  let searchContext = "";
  let shoppingContext = "";

  try {
    searchContext = await getSearchContext(topic);
    console.log(`\n[SerpApi] Search Context Fetched (${searchContext.length} characters)`);
    if (searchContext) console.log(`[Preview] ${searchContext.substring(0, 100)}...`);

    // 블로그(WordPress)이거나 실용적(Practical) 내용일 때만 쇼핑 링크 적극 탐색
    if (level === 3 || level === 2) {
      const shoppingData = await getShoppingLink(topic);
      if (shoppingData) {
        shoppingContext = `[추천 상품명]: ${shoppingData.title}\n[가격]: ${shoppingData.price}\n[구매 링크]: ${shoppingData.link}`;
        console.log(`\n[SerpApi] Shopping Context Found: \n${shoppingContext}`);
      } else {
        console.log(`\n[SerpApi] No Shopping Context Found for this topic.`);
      }
    }
  } catch (e) {
    console.error("\n[Error] Context fetching failed, proceeding with basic generation.", e);
  }

  // 순차적으로 생성하여 Rate Limit(429) 방지
  console.log(`\n[Gemini API] Generating ${count} variation(s) using gemini-flash-latest...`);

  // GraphRAG: Fetch previous context to maintain consistency
  const { fetchGraphContextForTopic, saveContentToGraph } = await import("./graph_service");
  const graphContext = await fetchGraphContextForTopic(topic);

  for (let i = 0; i < Math.min(count, 4); i++) {
    const style = styles[i % styles.length];

    // 프롬프트에 컨텍스트 주입 (Graph Context 추가)
    const prompt = PLATFORM_PROMPTS[platform](topic, style.name, searchContext, shoppingContext) + `\n${graphContext}`;

    try {
      const generatedContent = await generateWithGemini(prompt);

      const resultObj = {
        id: i + 1,
        style: style.name,
        platform,
        content: generatedContent,
        processed_at: new Date().toISOString()
      };
      variations.push(resultObj);

      // Graph Node Storage (Async)
      // We label the content type as the Platform name here
      saveContentToGraph(topic, platform as 'Thumbnail' | 'CardNews' | string as any, generatedContent).catch(console.error);

      // 무료 티어 API의 경우 요청 간 지연 시간 추가 (1초)
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Gemini generation failed for variation ${i + 1}:`, error);
      variations.push({
        id: i + 1,
        style: style.name,
        platform,
        content: `콘텐츠 생성 중 오류가 발생했습니다. (오류: ${error instanceof Error ? error.message : "API Rate Limit"})`,
        processed_at: new Date().toISOString()
      });
    }
  }

  return {
    topic,
    level,
    variations
  };
}
