"use client";

import { useState } from "react";
import { Copy, Download, Check } from "lucide-react";

export default function MarkdownEditor({ content, onChange }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy!", err);
        }
    };

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([content], { type: "text/markdown" });
        element.href = URL.createObjectURL(file);
        element.download = "math-note.md";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="editor-pane glass-panel">
            <div className="pane-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span>MARKDOWN INPUT</span>
                    <span style={{ opacity: 0.5, fontSize: '0.8em', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1rem' }}>
                        {content.length} chars
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={handleCopy}
                        className="icon-btn"
                        title="Copy to Clipboard"
                    >
                        {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="icon-btn"
                        title="Download Markdown"
                    >
                        <Download size={16} />
                    </button>
                </div>
            </div>
            <textarea
                className="editor-textarea"
                value={content}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Type some markdown here... Math equations should be wrapped in $ (inline) or $$ (block)."
                spellCheck="false"
            />
        </div>
    );
}
