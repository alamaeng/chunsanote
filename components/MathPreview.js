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
                    components={{
                        code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '')
                            if (!inline && match && match[1] === 'svg') {
                                return (
                                    <div
                                        className="svg-container"
                                        dangerouslySetInnerHTML={{ __html: String(children).replace(/\n$/, '') }}
                                        style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}
                                    />
                                );
                            }
                            return <code className={className} {...props}>{children}</code>;
                        }
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
}
