import { generateWithGemini, CREATIVE_PROMPTS } from "./gemini_service";

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

    if (type === "Thumbnail") {
        const prompt = CREATIVE_PROMPTS.YouTube_Thumbnail(topic);
        try {
            const generatedContent = await generateWithGemini(prompt);
            const cleaned = generatedContent.replace(/```json/gi, '').replace(/```/g, '').trim();

            try {
                const parsed = JSON.parse(cleaned);
                return {
                    type: "Thumbnail",
                    title: parsed.title || "No Title",
                    image_prompt: parsed.image_prompt || ""
                };
            } catch (e) {
                console.error("Failed to parse JSON for Thumbnail:", cleaned);
                throw new Error("Invalid Thumbnail format returned from AI.");
            }
        } catch (e) {
            console.error(e);
            throw e;
        }
    } else {
        const prompt = CREATIVE_PROMPTS.Instagram_CardNews(topic);
        try {
            const generatedContent = await generateWithGemini(prompt);
            const cleaned = generatedContent.replace(/```json/gi, '').replace(/```/g, '').trim();

            try {
                const parsed = JSON.parse(cleaned);
                return {
                    type: "CardNews",
                    slides: parsed.slides || []
                };
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
