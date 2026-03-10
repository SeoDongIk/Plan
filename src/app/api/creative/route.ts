import { NextResponse } from "next/server";
import { generateCreativeContent, CreativeRequest } from "@/lib/creative_service";

export async function POST(request: Request) {
    try {
        const body: CreativeRequest = await request.json();

        if (!body.topic || !body.type) {
            return NextResponse.json(
                { error: "Topic and type are required" },
                { status: 400 }
            );
        }

        if (body.type !== "Thumbnail" && body.type !== "CardNews") {
            return NextResponse.json(
                { error: "Invalid content type. Must be Thumbnail or CardNews." },
                { status: 400 }
            );
        }

        const result = await generateCreativeContent(body);

        return NextResponse.json({
            success: true,
            data: result
        });

    } catch (error: any) {
        console.error("[Creative API Error]", error);

        // Provide a more descriptive error based on the thrown error
        const errorMessage = error instanceof Error ? error.message : "Failed to generate creative content.";

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
