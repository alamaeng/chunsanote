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

        let modelToUse = preferredModel || "gemini-1.5-flash";
        let availableModelsList = [];

        // Auto-Discovery Logic
        // If preferredModel is NOT provided, or we want to validate, we can query the API.
        // However, for speed, if preferredModel IS provided, we try it first.

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
        Do NOT include any solution, answer key, or step-by-step explanation. 
        Return ONLY the question/problem content.`;

        // 1. Try Preferred Model (if exists)
        if (preferredModel) {
            try {
                // console.log(`Trying preferred model: ${preferredModel}`);
                const model = genAI.getGenerativeModel({ model: preferredModel });
                const result = await model.generateContent([prompt, imagePart]);
                const response = await result.response;
                const text = response.text();
                return NextResponse.json({ text, usedModel: preferredModel });
            } catch (e) {
                console.warn(`Preferred model ${preferredModel} failed, falling back to auto-discovery.`);
            }
        }

        // 2. Dynamic Discovery (Fallback)
        try {
            const listModelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
            const response = await fetch(listModelsUrl);
            const data = await response.json();

            if (data.models) {
                availableModelsList = data.models;
                // Priority: Flash (Speed) -> Pro (Quality) -> Any generateContent model
                const validModel = data.models.find(m =>
                    m.supportedGenerationMethods.includes("generateContent") &&
                    !m.name.includes("embedding") &&
                    m.name.includes("flash")
                ) || data.models.find(m =>
                    m.supportedGenerationMethods.includes("generateContent") &&
                    !m.name.includes("embedding") &&
                    m.name.includes("pro")
                ) || data.models.find(m =>
                    m.supportedGenerationMethods.includes("generateContent") &&
                    !m.name.includes("embedding")
                );

                if (validModel) {
                    modelToUse = validModel.name.replace("models/", "");
                    console.log(`Auto-detected valid model: ${modelToUse}`);
                }
            }
        } catch (e) {
            console.warn("Failed to auto-discover models, using default:", e);
        }

        // Executing model generation

        try {
            const result = await model.generateContent([prompt, imagePart]);
            const response = await result.response;
            const text = response.text();
            return NextResponse.json({ text, usedModel: modelToUse });
        } catch (genError) {
            throw new Error(`Model '${modelToUse}' failed: ${genError.message}. Available models: ${availableModelsList.map(m => m.name).join(", ")}`);
        }

    } catch (error) {
        console.error("Gemini API Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to process image" },
            { status: 500 }
        );
    }
}
