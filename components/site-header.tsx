'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export function SiteHeader({ signedIn = false }: { signedIn?: boolean }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  if (isHome) {
    return (
      <header className="sticky top-0 z-50 bg-[hsl(var(--background)/0.88)] backdrop-blur-xl">
        <div className="page-shell flex h-20 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm font-semibold text-[hsl(var(--foreground))]">
              VC
            </span>
            <span className="text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))]">VibeCut</span>
          </Link>

          <nav className="hidden items-center gap-8 text-lg text-[hsl(var(--foreground))] md:flex">
            <Link href="/#features" className="transition hover:opacity-70">
              Features
            </Link>
            <Link href="/#pricing" className="transition hover:opacity-70">
              Pricing
            </Link>
            <Link href="/#testimonials" className="transition hover:opacity-70">
              Testimonials
            </Link>
          </nav>

          <Link href={signedIn ? '/dashboard' : '/#cta'} className="rounded-full bg-[#ffd33d] px-8 py-4 text-xl font-medium text-black transition hover:brightness-95">
            Download
          </Link>
        </div>
      </header>
    );
  }

  const primaryHref = signedIn ? '/dashboard' : '/sign-in';
  const primaryLabel = signedIn ? 'Open workspace' : 'Sign in';

  return (
    <header className="sticky top-0 z-50 border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.72)] backdrop-blur-xl">
      <div className="page-shell flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm font-semibold shadow-sm shadow-black/5">
              VC
            </span>
            <div>
              <p className="text-sm font-semibold tracking-tight text-[hsl(var(--foreground))]">VibeCut</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Transcript-first editing</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-[hsl(var(--muted-foreground))] md:flex">
            <Link href="/" className="transition hover:text-[hsl(var(--foreground))]">
              Home
            </Link>
            <Link href="/dashboard" className="transition hover:text-[hsl(var(--foreground))]">
              Workspace
            </Link>
            <Link href="/#pricing" className="transition hover:text-[hsl(var(--foreground))]">
              Pricing
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href={primaryHref} className="btn-primary hidden sm:inline-flex">
            {primaryLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
