import './globals.css';

export const metadata = {
    title: '천사노트 문제입력',
    description: 'Convert Math Images to Markdown & LaTeX instantly.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>{children}</body>
        </html>
    );
}
