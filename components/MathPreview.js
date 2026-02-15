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
                            const lang = match ? match[1] : ''

                            // Check for svg or xml language
                            if (!inline && (lang === 'svg' || lang === 'xml')) {
                                // Extract the raw SVG string from children
                                const svgString = String(children).replace(/\n$/, '');

                                // Basic validation: Ensure it starts with <svg
                                if (svgString.trim().startsWith('<svg')) {
                                    return (
                                        <div
                                            className="svg-container"
                                            dangerouslySetInnerHTML={{ __html: svgString }}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                margin: '1rem 0',
                                                backgroundColor: 'white',
                                                padding: '1rem',
                                                borderRadius: '8px'
                                            }}
                                        />
                                    );
                                }
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
