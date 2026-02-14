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
        4. **English & Numbers as Math**: TREAT ALL ENGLISH CHARACTERS, NUMBERS, AND SYMBOLS AS MATHEMATICAL VARIABLES. ALWAYS wrap them in LaTeX (e.g., $x$, $y$, $1$, $10$, $cm$, $kg$). NEVER leave them as plain text, even if they are in the middle of a Korean sentence.
        5. **Korean Text Preservation**: DO NOT wrap Korean characters in LaTeX math ($...$). Korean text must remain PLAIN TEXT.
        6. **Mixed Content Rule**: When Korean and Math are mixed, separate them correctly.
           - RIGHT: 길이가 $10cm$ 이다.
           - WRONG: 길이가 10cm 이다.
           - WRONG: $길이가 10cm 이다$.
        6. **Auto-Sizing**: ALWAYS use \\left( ... \\right) for parentheses and \\left[ ... \\right] for brackets. NEVER use plain ( ) or [ ].
        7. **Forbidden Commands**: Do NOT use \\mathbb, \\text, or \\textit. Use standard math fonts (e.g., just $R$ instead of $\\mathbb{R}$).
        8. **Fractions**: You MUST use \\dfrac{}{} for ALL fractions. Never use \\frac.
        10. **Details**: Pay extreme attention to subscripts, superscripts, and special symbols.
        11. **Clean Output**: Do NOT include any solution, answer key, or step-by-step explanation. Return ONLY the question/problem content.`;

        // Direct usage without fallback logic
        const model = genAI.getGenerativeModel({ model: modelToUse });

        try {
            const result = await model.generateContent([prompt, imagePart]);
            const response = await result.response;
            // Force replace \frac with \dfrac just in case the model misses it
            // Also strip markdown code block syntax if present
            // And STRICTLY remove \mathbb, \text, \mathit, \textit
            let text = response.text()
                .replace(/^```markdown\s*/, '')
                .replace(/^```\s*/, '')
                .replace(/```$/, '');

            // 1. Replace \frac with \dfrac
            text = text.replace(/\\frac/g, '\\dfrac');

            // 2. Remove \mathbb{...} -> ...
            text = text.replace(/\\mathbb\{([^{}]+)\}/g, '$1');
            text = text.replace(/\\mathbb\s+([a-zA-Z])/g, '$1');

            // 3. Remove \text{...} -> ...
            text = text.replace(/\\text\{([^{}]+)\}/g, '$1');

            // 4. Remove \mathit{...} -> ...
            text = text.replace(/\\mathit\{([^{}]+)\}/g, '$1');

            // 5. Remove \textit{...} -> ...
            text = text.replace(/\\textit\{([^{}]+)\}/g, '$1');
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
