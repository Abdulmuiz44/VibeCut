import Link from 'next/link';
import { auth, signIn } from '@/auth';
import { redirect } from 'next/navigation';

const bullets = [
  'Transcript-first review and trim workflow',
  'Visible edit history and restore points',
  'Export presets for fast social delivery'
];

export default async function SignInPage() {
  const session = await auth();

  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <main className="page-shell py-10 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="hero-card spotlight-border flex min-h-[620px] flex-col justify-between p-6 sm:p-8 lg:p-10">
          <div className="space-y-6">
            <span className="section-label">Welcome back</span>
            <div className="space-y-4">
              <h1 className="max-w-2xl text-5xl font-semibold tracking-[-0.04em] text-[hsl(var(--foreground))] sm:text-6xl">
                Sign in and keep the editing flow moving.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[hsl(var(--muted-foreground))] sm:text-lg">
                VibeCut is built for creators who need a polished, repeatable path from source recording to final social cut.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            {bullets.map((bullet) => (
              <div key={bullet} className="rounded-[1.4rem] border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.55)] px-4 py-4 text-sm text-[hsl(var(--foreground))]">
                {bullet}
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card flex items-center p-6 sm:p-8">
          <div className="w-full space-y-6">
            <div>
              <span className="section-label">Access workspace</span>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[hsl(var(--foreground))]">Continue with Google</h2>
              <p className="mt-3 text-sm leading-7 text-[hsl(var(--muted-foreground))]">
                Sign in once, return to your project history, and keep your exports, snapshots, and edits in one place.
              </p>
            </div>

            <form
              action={async () => {
                'use server';
                await signIn('google', { redirectTo: '/dashboard' });
              }}
            >
              <button className="btn-primary w-full justify-center" type="submit">
                Continue with Google
              </button>
            </form>

            <div className="page-divider pt-4 text-sm text-[hsl(var(--muted-foreground))]">
              <p>Need context first?</p>
              <Link href="/" className="mt-3 btn-ghost w-fit">
                Back to home
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
