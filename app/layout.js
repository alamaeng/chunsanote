import './globals.css';

export const metadata = {
    title: 'Antigravity Math Note',
    description: 'Convert Math Images to Markdown & LaTeX instantly.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>{children}</body>
        </html>
    );
}
