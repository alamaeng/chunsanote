"use client";

import { useState } from "react";
import { Settings, X, Key, Save } from "lucide-react";

export default function SettingsModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [apiKey, setApiKey] = useState("");
    const [model, setModel] = useState("gemini-2.0-flash");
    const [saved, setSaved] = useState(false);

    const handleOpen = () => {
        const storedKey = localStorage.getItem("gemini_api_key");
        if (storedKey) setApiKey(storedKey);

        const storedModel = localStorage.getItem("gemini_model");
        if (storedModel) setModel(storedModel);

        setIsOpen(true);
    };

    const handleSave = () => {
        if (apiKey.trim()) {
            localStorage.setItem("gemini_api_key", apiKey.trim());
            localStorage.setItem("gemini_model", model);
            setSaved(true);
            setTimeout(() => {
                setSaved(false);
                setIsOpen(false);
            }, 1000);
        }
    };

    const handleClear = () => {
        localStorage.removeItem("gemini_api_key");
        setApiKey("");
        setSaved(false);
    };

    return (
        <>
            <button
                onClick={handleOpen}
                className="fixed bottom-4 left-4 p-3 bg-gray-800/80 hover:bg-gray-700 text-white rounded-full shadow-lg backdrop-blur border border-white/10 transition-all z-50"
                title="Settings"
            >
                <Settings size={20} />
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="glass-panel w-full max-w-md p-6 relative animation-fadeIn">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Settings size={24} className="text-blue-400" />
                            Settings
                        </h2>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Google Gemini API Key
                            </label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="AIzaSy..."
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                />
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                Your key is stored locally in your browser. get a key from <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-blue-400 hover:underline">Google AI Studio</a>.
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Gemini Model
                            </label>
                            <select
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                            >
                                <option value="gemini-2.0-flash">Gemini 2.0 Flash (Fastest)</option>
                                <option value="gemini-1.5-pro-002">Gemini 1.5 Pro (High Quality)</option>
                                <option value="gemini-1.5-flash-002">Gemini 1.5 Flash (Balanced)</option>
                            </select>
                            <p className="mt-2 text-xs text-gray-500">
                                &apos;Pro&apos; models are slower but better at generating SVG diagrams.
                            </p>
                        </div>

                        <div className="flex justify-between items-center">
                            <button
                                onClick={handleClear}
                                className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
                            >
                                Clear Key
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!apiKey}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${saved
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-blue-600 hover:bg-blue-500 text-white"
                                    }`}
                            >
                                {saved ? (
                                    <>
                                        <Save size={16} /> Saved!
                                    </>
                                ) : (
                                    "Save Settings"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
