import Link from 'next/link';
import { auth } from '@/auth';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export async function SiteHeader() {
  const session = await auth();
  const primaryHref = session?.user ? '/dashboard' : '/sign-in';
  const primaryLabel = session?.user ? 'Open workspace' : 'Sign in';

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
