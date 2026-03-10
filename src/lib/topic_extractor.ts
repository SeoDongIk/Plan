import { GoogleGenerativeAI } from "@google/generative-ai";
import { getYouTubeTrends, getGoogleKeywordIdeas } from "./serpapi_service";
import { saveTopicToGraph } from "./graph_service";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface ExtractedTopic {
  level: 1 | 2 | 3;
  topic: string;
  reasoning: string;
}

export async function extractTrendTopics(countN: number, baseKeyword: string = "AI 자동화 전략"): Promise<ExtractedTopic[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  console.log(`[Extactor] Fetching Google & YouTube Trends for: ${baseKeyword}`);
  const [youtubeData, googleData] = await Promise.all([
    getYouTubeTrends(baseKeyword),
    getGoogleKeywordIdeas(baseKeyword)
  ]);

  const prompt = `
당신은 현존하는 최고의 '구글 SEO 및 유튜브 알고리즘 타겟팅 데이터 분석가'입니다.
목표: 유입량(Traffic)과 전환율(Conversion)을 극대화할 수 있는 타겟 주제(Topic) ${countN}개를 도출해야 합니다.

아래 수집된 실시간 구글 및 유튜브 트렌드 데이터를 바탕으로, 반드시 다음 3가지 퍼널 단계(Level 1, 2, 3)로 나누어 총 ${countN}개의 주제를 기획하세요. (계층별 갯안 자유결정, 합쳐서 ${countN}개면 됨)

[트렌드 데이터]
${youtubeData}
${googleData}

[분류 기준]
- Level 1 (Viral/Broad): 대중적 호기심 자극, 숏폼/스레드용, 클릭률(CTR) 극대화 (예: "~하는 법 3가지", "충격적인 ~의 비밀")
- Level 2 (Educational/Mid-funnel): 정보성, 튜토리얼, 체류 시간 확보 (예: "초보자를 위한 ~사용법", "~원리 완벽 정리")
- Level 3 (Professional/Conversion): 전문가 수준, 문제 해결, 제품 추천/구매 유도 (예: "실무자를 위한 ~도입 가이드", "생산성을 300% 높이는 ~툴 비교")

각 기획된 주제에 대해 '키워드명(topic)'과 이를 선정한 구체적인 트래픽/SEO 전략적 이유(reasoning)를 함께 제시하세요. 이유에는 위 트렌드 데이터에서 어떤 부분(조회수, 연관검색어 등)을 참고했는지 명확히 밝히세요.

출력은 반드시 다음 형식의 JSON 배열(Array)만 출력하세요. 마크다운(\`\`\`json) 없이 순수 JSON 배열만 출력하세요.
[
  { "level": 1, "topic": "주제명", "reasoning": "선정 이유" },
  { "level": 2, "topic": "주제명", "reasoning": "선정 이유" }
]
  `;

  try {
    const result = await model.generateContent(prompt);
    let outputText = result.response.text().trim();

    // 혹시라도 마크다운이 섞여올 경우를 대비한 클렌징
    if (outputText.startsWith("\`\`\`json")) {
      outputText = outputText.replace(/^\`\`\`json/g, '').replace(/\`\`\`$/g, '').trim();
    } else if (outputText.startsWith("\`\`\`")) {
      outputText = outputText.replace(/^\`\`\`/g, '').replace(/\`\`\`$/g, '').trim();
    }

    const jsonParsed = JSON.parse(outputText) as ExtractedTopic[];

    // Save generated topics back into the Neo4j Knowledge Graph asynchronously
    if (jsonParsed && Array.isArray(jsonParsed)) {
      Promise.allSettled(
        jsonParsed.map((item: ExtractedTopic) => saveTopicToGraph(baseKeyword, item.topic, item.level))
      );
    }

    return jsonParsed;
  } catch (err: unknown) {
    const error = err as any;
    console.error("[Extractor API Error]", error?.message || error);

    // 429 Quota Exceeded 에러 발생 시 UI가 깨지지 않도록 기본 배열 반환
    if (error?.message?.includes("429") || error?.message?.includes("Quota")) {
      return [
        { level: 1, topic: "⚠️ [API 할당량 초과]", reasoning: "Google Gemini API의 무료 제공 할당량이 초과되었습니다. 1분 뒤 다시 시도해주세요." },
        { level: 2, topic: "⚠️ [API 할당량 초과]", reasoning: "Google Gemini API의 무료 제공 할당량이 초과되었습니다. 1분 뒤 다시 시도해주세요." },
        { level: 3, topic: "⚠️ [API 할당량 초과]", reasoning: "Google Gemini API의 무료 제공 할당량이 초과되었습니다. 1분 뒤 다시 시도해주세요." }
      ];
    }

    throw new Error("주제 추출에 실패했습니다. API 설정을 확인하세요.");
  }
}
