import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateWithGemini(prompt: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("[Gemini API Error]", error?.message || error);

    // 할당량 초과(429) 등 예외 상황 처리
    if (error?.message?.includes("429") || error?.message?.includes("Quota")) {
      return "⚠️ [Gemini API 오류] 무료 제공 할당량을 초과했습니다. 잠시 후 1분 뒤에 다시 시도해주시거나, 결제 계정을 확인해주세요.";
    }

    return "⚠️ [API 오류] 콘텐츠를 생성하는 중 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
}

export const PLATFORM_PROMPTS = {
  Threads: (topic: string, style: string, searchContext?: string, shoppingContext?: string) => `
    당신은 SNS 콘텐츠 전문가입니다. 주제: "${topic}", 스타일: "${style}".
    
    ${searchContext ? `[참고 데이터]\n${searchContext}\n위 최신 검색 데이터를 바탕으로 객관적인 사실이나 트렌드를 한 줄 포함해줘.` : ''}
    ${shoppingContext ? `[추천 상품]\n${shoppingContext}\n본문 마지막에 위 상품을 자연스럽게 추천해줘.` : ''}

    Threads(스레드) 앱에 올릴 바이럴 중심의 짧은 글을 작성해줘. 
    호기심을 자극하는 문구와 적절한 이모지, 해시태그 3개를 포함해줘.
    결과만 한국어로 출력해줘.
  `,
  YouTube: (topic: string, style: string, searchContext?: string, shoppingContext?: string) => `
    당신은 유튜브 스크립트 작가입니다. 주제: "${topic}", 스타일: "${style}".
    
    ${searchContext ? `[참고 데이터]\n${searchContext}\n영상 본문(Body)에 위 검색 데이터와 연관 질문(People Also Ask)에 대한 답변을 시청자가 이해하기 쉽게 풀어서 설명해줘.` : ''}
    ${shoppingContext ? `[고정 댓글 추천 상품]\n${shoppingContext}\n아웃트로 부분에서 "고정 댓글의 링크를 확인해보세요"라며 위 상품을 자연스럽게 언급해줘.` : ''}

    약 3분 분량의 유튜브 영상 대본을 작성해줘. 
    [오프닝], [본문 1, 2, 3], [결론/아웃트로] 구조로 작성하고 시청자의 눈길을 끄는 훅(Hook)을 포함해줘.
    결과만 한국어로 출력해줘.
  `,
  WordPress: (topic: string, style: string, searchContext?: string, shoppingContext?: string) => `
    당신은 테크 전문 블로거입니다. 주제: "${topic}", 스타일: "${style}".
    
    ${searchContext ? `[참고 데이터 및 연관 질문]\n${searchContext}\n위 검색 데이터의 핵심 키워드(LSI 키워드)들을 본문에 자연스럽게 녹여내고, 글 중간이나 마지막에 연관 질문들을 바탕으로 한 'Q&A(자주 묻는 질문)' 섹션을 반드시 포함해줘. (SEO 구글 스니펫 최적화 목적)` : ''}
    ${shoppingContext ? `[수익화 링크]\n${shoppingContext}\n글 중간 적절한 문맥에 위 상품 정보를 "에디터 추천 아이템" 형태로 자연스럽게 삽입해줘.` : ''}

    WordPress 블로그에 올릴 가치가 있는 고품질 아티클 전문을 작성해줘. 
    SEO에 최적화된 소제목(H2, H3) 구조를 갖추고, 전문적이면서도 가독성 좋게 Markdown 형식으로 작성해줘.
  `
};

export const CREATIVE_PROMPTS = {
  YouTube_Thumbnail: (topic: string) => `
    당신은 전문 유튜브 썸네일 디자이너이자 카피라이터입니다. 주제: "${topic}"
    이 주제로 시청자의 눈길을 사로잡을 수 있는 썸네일 정보를 JSON 형식으로만 반환하세요.
    
    데이터 구조:
    {
      "title": "썸네일에 들어갈 짧고 자극적인 문구 (최대 15자 이내)",
      "image_prompt": "이미지 생성 AI(Midjourney/Flux 등)에 입력할 사실적인 사진 스타일의 프롬프트 (반드시 영어로만 작성, 쉼표로 구분된 키워드 나열, 예: hyper realistic portrait of a professional businessman, modern office, neon lighting, 8k resolution, cinematic lighting)"
    }
    
    주의: 절대 Markdown 텍스트 블록(\`\`\`json 등)을 포함하지 말고, 순수한 JSON 문자열만 시작부터 끝까지 포함하여 출력하세요.
  `,
  Instagram_CardNews: (topic: string) => `
    당신은 트렌디한 인스타그램 카드뉴스 기획자입니다. 주제: "${topic}"
    이 주제로 4~5장의 슬라이드 분량 인스타그램 카드뉴스를 기획하여 JSON 형식으로만 반환하세요.
    
    데이터 구조:
    {
      "slides": [
        {
          "slide_number": 1,
          "text": "슬라이드에 명확하게 들어갈 핵심 텍스트 문구 (2~3줄 요약)",
          "image_prompt": "이 슬라이드의 배경 또는 적절한 일러스트로 들어갈 상세한 이미지 AI 프롬프트 (반드시 영어로만 작성, 예: minimalist 3d illustration, soft light background, pastel colors, high quality)"
        }
      ]
    }
    
    주의: 표지(1번 슬라이드), 본문(중간 슬라이드), 결론 및 질문 유도(마지막 슬라이드) 구조를 갖추세요.
    절대 Markdown 텍스트 블록(\`\`\`json 등)을 포함하지 말고, 순수한 JSON 문자열만 시작부터 끝까지 포함하여 출력하세요.
  `
};
