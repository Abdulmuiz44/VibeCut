import './globals.css';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_bottom,rgba(62,207,142,0.08),transparent_130px)]" />
        <div className="relative">{children}</div>
      </body>
    </html>
  );
}