import Link from 'next/link';

export default function MarketingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-8 px-6">
      <span className="badge-brand w-fit rounded-full px-3 py-1 text-xs">Transcript-first AI editor</span>
      <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">VibeCut</h1>
      <p className="max-w-2xl text-lg text-brand" style={{ opacity: 0.9 }}>
        Edit videos by transcript and prompt, then export polished social-ready videos fast.
      </p>
      <div className="flex gap-3">
        <Link href="/sign-in" className="btn-primary">
          Sign in
        </Link>
        <Link href="/dashboard" className="btn-ghost">
          Go to dashboard
        </Link>
      </div>
    </main>
  );
}
