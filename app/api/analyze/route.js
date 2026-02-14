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
        
        CRITICAL RULES:
        1. **Verbatim Transcription**: Do NOT summarize or paraphrase. Transcribe every single word, number, and symbol exactly as it appears.
        2. **No Omissions**: Do NOT skip any part of the problem, including sub-questions (a, b, c...), labels, or small text.
        3. **Math Formatting**: Use LaTeX for math formulas. Wrap inline math in $...$ and block math in $$...$$.
        4. **English as Math**: TREAT ALL ENGLISH CHARACTERS AS MATHEMATICAL VARIABLES. ALWAYS wrap them in LaTeX (e.g., $x$, $y$, $A$, $cm$, $kg$). NEVER leave English text as plain text.
        5. **Fractions**: You MUST use \\dfrac{}{} for ALL fractions. Never use \\frac.
        6. **Details**: Pay extreme attention to subscripts, superscripts, and special symbols.
        7. **Clean Output**: Do NOT include any solution, answer key, or step-by-step explanation. Return ONLY the question/problem content.`;

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
