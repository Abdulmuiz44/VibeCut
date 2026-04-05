'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function NewProjectForm() {
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
          const response = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title })
          });

          if (!response.ok) {
            setError('Unable to create project');
            return;
          }

          const data = await response.json();
          router.push(`/dashboard/projects/${data.id}`);
        } catch {
          setError('Unable to create project');
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      <div>
        <label className="input-label" htmlFor="project-title">
          Project title
        </label>
        <input
          id="project-title"
          className="soft-input mt-2"
          placeholder="My first reel"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <button className="btn-primary inline-flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Creating...' : 'Create project'}
      </button>
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
    </form>
  );
}