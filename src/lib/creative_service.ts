import { generateWithGemini, CREATIVE_PROMPTS } from "./gemini_service";
import { fetchGraphContextForTopic, saveContentToGraph } from "./graph_service";

export interface CreativeRequest {
    type: "Thumbnail" | "CardNews";
    topic: string;
}

export type ThumbnailResponse = {
    type: "Thumbnail";
    title: string;
    image_prompt: string;
};

export type CardNewsSlide = {
    slide_number: number;
    text: string;
    image_prompt: string;
};

export type CardNewsResponse = {
    type: "CardNews";
    slides: CardNewsSlide[];
};

export async function generateCreativeContent(request: CreativeRequest): Promise<ThumbnailResponse | CardNewsResponse> {
    const { type, topic } = request;

    // GraphRAG: Fetch previous context to maintain consistency
    const graphContext = await fetchGraphContextForTopic(topic);
    console.log(`[Graphic Service] Injected Graph Context for ${topic}:\n`, graphContext);

    if (type === "Thumbnail") {
        const prompt = CREATIVE_PROMPTS.YouTube_Thumbnail(topic) + `\n${graphContext}`;
        try {
            const generatedContent = await generateWithGemini(prompt);
            const cleaned = generatedContent.replace(/```json/gi, '').replace(/```/g, '').trim();

            try {
                const parsed = JSON.parse(cleaned);

                // Graph Node Storage (Async)
                const resultData = {
                    type: "Thumbnail",
                    title: parsed.title || "No Title",
                    image_prompt: parsed.image_prompt || ""
                };
                saveContentToGraph(topic, "Thumbnail", JSON.stringify(resultData)).catch(console.error);

                return resultData as ThumbnailResponse;
            } catch (e) {
                console.error("Failed to parse JSON for Thumbnail:", cleaned);
                throw new Error("Invalid Thumbnail format returned from AI.");
            }
        } catch (e) {
            console.error(e);
            throw e;
        }
    } else {
        const prompt = CREATIVE_PROMPTS.Instagram_CardNews(topic) + `\n${graphContext}`;
        try {
            const generatedContent = await generateWithGemini(prompt);
            const cleaned = generatedContent.replace(/```json/gi, '').replace(/```/g, '').trim();

            try {
                const parsed = JSON.parse(cleaned);

                // Graph Node Storage (Async)
                const resultData = {
                    type: "CardNews",
                    slides: parsed.slides || []
                };
                saveContentToGraph(topic, "CardNews", JSON.stringify(resultData)).catch(console.error);

                return resultData as CardNewsResponse;
            } catch (e) {
                console.error("Failed to parse JSON for CardNews:", cleaned);
                throw new Error("Invalid CardNews format returned from AI.");
            }
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
}
