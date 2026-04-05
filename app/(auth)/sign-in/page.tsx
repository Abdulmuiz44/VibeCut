import Link from 'next/link';
import { auth, signIn } from '@/auth';
import { redirect } from 'next/navigation';

const bullets = [
  'Transcript-first editing built for recurring publishing',
  'Timeline control with AI suggestions that stay reviewable',
  'Subscription workflow for creators who publish every week'
];

export default async function SignInPage() {
  const session = await auth();

  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <main className="page-shell flex min-h-screen items-center py-10 lg:py-16">
      <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex flex-col justify-center gap-6">
          <span className="section-label">Continue to VibeCut</span>
          <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            Sign in and keep your editing pipeline moving.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-300">
            VibeCut is the subscription editor for creators who want faster cuts, less friction, and a workflow they can use every week.
          </p>
          <div className="grid gap-3">
            {bullets.map((bullet) => (
              <div key={bullet} className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {bullet}
              </div>
            ))}
          </div>
          <div className="funnel-row">
            <Link href="/" className="btn-ghost">
              Back home
            </Link>
            <Link href="#" className="btn-ghost opacity-50 pointer-events-none">
              No free plan
            </Link>
          </div>
        </section>

        <section className="hero-card flex items-center">
          <div className="w-full rounded-[1.5rem] border border-slate-800 bg-[#0b0f14] p-8">
            <p className="section-label">Get started</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">Continue with Google</h2>
            <p className="muted mt-3 max-w-md leading-7">
              Use your Google account to unlock the dashboard, create a project, and start editing.
            </p>
            <form
              className="mt-8"
              action={async () => {
                'use server';
                await signIn('google', { redirectTo: '/dashboard' });
              }}
            >
              <button className="btn-primary w-full justify-center" type="submit">
                Continue with Google
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
