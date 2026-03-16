import './globals.css';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_bottom,rgba(148,163,184,0.07),transparent_120px)]" />
        <div className="relative">{children}</div>
      </body>
    </html>
  );
}
