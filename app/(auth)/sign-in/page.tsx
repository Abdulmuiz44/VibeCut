import { MagicLinkForm } from '@/components/auth/magic-link-form';

export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <div className="glass-card w-full p-7">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="muted mt-2">Use email OTP / magic link.</p>
        <MagicLinkForm />
      </div>
    </main>
  );
}
