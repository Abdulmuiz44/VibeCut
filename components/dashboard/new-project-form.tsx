'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function NewProjectForm() {
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const response = await fetch('/api/projects', { method: 'POST', body: JSON.stringify({ title }) });
        if (!response.ok) {
          setError('Unable to create project');
          return;
        }
        const data = await response.json();
        router.push(`/dashboard/projects/${data.id}`);
      }}
    >
      <input className="soft-input" placeholder="My first reel" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <button className="btn-primary">Create</button>
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
    </form>
  );
}
