import './globals.css';
import { ReactNode } from 'react';
import { auth } from '@/auth';
import { SiteHeader } from '@/components/site-header';

const themeScript = `
(() => {
  try {
    const stored = localStorage.getItem('vibecut-theme');
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const theme = stored === 'light' || stored === 'dark' ? stored : system;
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
  } catch {
    document.documentElement.dataset.theme = 'dark';
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  }
})();`;

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.09),transparent_24%),linear-gradient(to_bottom,rgba(255,255,255,0.03),transparent_18%)]" />
        <div className="relative min-h-screen">
          <SiteHeader signedIn={Boolean(session?.user)} />
          {children}
        </div>
      </body>
    </html>
  );
}
