"use client";

import { useState } from "react";
import ImageUploader from "@/components/ImageUploader";
import MarkdownEditor from "@/components/MarkdownEditor";
import MathPreview from "@/components/MathPreview";
import SettingsModal from "@/components/SettingsModal";
import { convertImageToMarkdown } from "@/lib/ocrService";
import { convertPdfToImages } from "@/lib/pdfUtils";

export default function Home() {
    const [step, setStep] = useState('upload'); // 'upload' | 'edit'
    const [loading, setLoading] = useState(false);
    const [markdown, setMarkdown] = useState("");
    const [usedModel, setUsedModel] = useState(null);

    const handleImageSelect = async (file) => {
        if (!file) return;
        setLoading(true);
        try {
            let combinedText = "";
            let modelUsed = null;

            if (file.type === "application/pdf") {
                // 1. Convert PDF to Images
                const images = await convertPdfToImages(file);

                // 2. Process each image
                for (let i = 0; i < images.length; i++) {
                    // Update loading text if you want to reflect progress
                    // setLoadingText(`Processing page ${i + 1} of ${images.length}...`); 

                    // images[i] is now a File object, so we can pass it directly
                    const { text, usedModel } = await convertImageToMarkdown(images[i]);
                    combinedText += `\n\n--- Page ${i + 1} ---\n\n` + text;
                    modelUsed = usedModel; // Store the last used model
                }
            } else {
                // Handle single image
                const { text, usedModel } = await convertImageToMarkdown(file);
                combinedText = text;
                modelUsed = usedModel;
            }

            setMarkdown(combinedText);
            setUsedModel(modelUsed);
            setStep('edit');
        } catch (error) {
            console.error("Failed to convert file", error);
            alert("Failed to convert file. " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStartOver = () => {
        setMarkdown("");
        setStep('upload');
    };

    return (
        <div className="container">
            {/* Loading Overlay */}
            {loading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>Extracting math from image...</p>
                </div>
            )}

            {/* Header */}
            <header className="header">
                <h1>수학데이터 입력</h1>
                <p>Convert Math Images to Markdown & LaTeX instantly.</p>
            </header>

            {/* Main Content */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {step === 'upload' && (
                    <div style={{ animation: 'fadeInDown 0.5s ease' }}>
                        <ImageUploader onImageSelect={handleImageSelect} />
                        <div style={{ textAlign: 'center', marginTop: '2rem', opacity: 0.6 }}>
                            <p>Supported Formats: PNG, JPG, WEBP</p>
                            <p>Powered by Google Gemini {usedModel ? `(${usedModel})` : "(Auto-Detect Mode)"}</p>
                        </div>
                    </div>
                )}

                {step === 'edit' && (
                    <div className="split-view">
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                                <button onClick={handleStartOver} className="start-over-btn">
                                    ← 새 문제 스캔
                                </button>
                            </div>
                            <MarkdownEditor content={markdown} onChange={setMarkdown} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <div style={{ height: '38px' }}></div> {/* Spacer to match button row height perfectly */}
                            <MathPreview content={markdown} />
                        </div>
                    </div>
                )}
            </main>
            <SettingsModal />
        </div>
    );
}
