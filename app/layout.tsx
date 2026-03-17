import './globals.css';
import { ReactNode } from 'react';

const brand = process.env.NEXT_PUBLIC_UI_BRAND === 'chatgpt' ? 'chatgpt' : 'perplexity';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" data-brand={brand}>
      <body>
        <div className="top-glow pointer-events-none fixed inset-0" />
        <div className="relative">{children}</div>
      </body>
    </html>
  );
}
