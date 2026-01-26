import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { image, apiKey, preferredModel } = await req.json();

        if (!apiKey) {
            return NextResponse.json(
                { error: "API Key is required" },
                { status: 400 }
            );
        }

        if (!image) {
            return NextResponse.json(
                { error: "Image data is required" },
                { status: 400 }
            );
        }

        // Use requested model or fallback to gemini-2.0-flash
        const modelToUse = preferredModel || "gemini-2.0-flash";

        const genAI = new GoogleGenerativeAI(apiKey);

        // Prepare image part
        const base64Data = image.split(",")[1];
        const mimeType = image.split(";")[0].split(":")[1];
        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: mimeType,
            },
        };

        const prompt = `Analyze this image and extract ONLY the problem text and mathematical formulas. 
        Output the result in Markdown format. 
        Use LaTeX for math formulas, wrapping inline math in $ and block math in $$.
        IMPORTANT: Use \\dfrac for ALL fractions instead of \\frac.
        Do NOT include any solution, answer key, or step-by-step explanation. 
        Return ONLY the question/problem content.`;

        // Direct usage without fallback logic
        const model = genAI.getGenerativeModel({ model: modelToUse });

        try {
            const result = await model.generateContent([prompt, imagePart]);
            const response = await result.response;
            // Force replace \frac with \dfrac just in case the model misses it
            // Also strip markdown code block syntax if present
            const text = response.text()
                .replace(/\\frac/g, '\\dfrac')
                .replace(/^```markdown\s*/, '')
                .replace(/^```\s*/, '')
                .replace(/```$/, '');
            return NextResponse.json({ text, usedModel: modelToUse });
        } catch (genError) {
            throw new Error(`Model '${modelToUse}' failed: ${genError.message}.`);
        }

    } catch (error) {
        console.error("Gemini API Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to process image" },
            { status: 500 }
        );
    }
}
