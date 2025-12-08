export const convertImageToMarkdown = async (file) => {
    const apiKey = localStorage.getItem("gemini_api_key");
    const preferredModel = localStorage.getItem("gemini_model"); // Get cached model

    if (!apiKey) {
        throw new Error("Please set your Google Gemini API Key in Settings.");
    }

    // Convert file to Base64
    const base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            image: base64Image,
            apiKey: apiKey,
            preferredModel: preferredModel, // Send cached model
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to analyze image");
    }

    // Cache the working model for next time
    if (data.usedModel) {
        localStorage.setItem("gemini_model", data.usedModel);
    }

    return { text: data.text, usedModel: data.usedModel };
};
