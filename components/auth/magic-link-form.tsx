'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export function MagicLinkForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/dashboard` } });
    setStatus(error ? error.message : 'Check your email for a secure sign-in link.');
  };

  return (
    <form onSubmit={submit} className="mt-5 space-y-3">
      <input className="soft-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
      <button className="btn-primary w-full">Send magic link</button>
      {status ? <p className="muted">{status}</p> : null}
    </form>
  );
}
