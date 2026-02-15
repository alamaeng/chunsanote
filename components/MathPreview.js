"use client";

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

export default function MathPreview({ content }) {
    return (
        <div className="preview-pane glass-panel">
            <div className="pane-header">
                <span>LIVE PREVIEW</span>
            </div>
            <div className="preview-content">
                <ReactMarkdown
                    remarkPlugins={[remarkMath, remarkBreaks]}
                    rehypePlugins={[rehypeKatex]}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
}
