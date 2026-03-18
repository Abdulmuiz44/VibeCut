import { auth, signIn } from '@/auth';
import { redirect } from 'next/navigation';

export default async function SignInPage() {
  const session = await auth();

  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <div className="glass-card w-full p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome to VibeCut</h1>
        <p className="muted mt-2">Continue with Google to access your dashboard.</p>
        <form
          className="mt-6"
          action={async () => {
            'use server';
            await signIn('google', { redirectTo: '/dashboard' });
          }}
        >
          <button className="btn-primary w-full" type="submit">
            Continue with Google
          </button>
        </form>
      </div>
    </main>
  );
}