'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DuplicateProjectButton({ projectId, projectTitle }: { projectId: string; projectTitle: string }) {
  const router = useRouter();
  const [isDuplicating, setIsDuplicating] = useState(false);

  async function duplicateProject() {
    const nextTitle = window.prompt('Name the duplicate project', `${projectTitle} Copy`);
    if (!nextTitle) return;

    setIsDuplicating(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: nextTitle })
      });

      if (!response.ok) {
        throw new Error('Unable to duplicate project');
      }

      const data = (await response.json()) as { id: string };
      router.push(`/dashboard/projects/${data.id}`);
    } finally {
      setIsDuplicating(false);
    }
  }

  return (
    <button className="btn-ghost inline-flex items-center justify-center" onClick={duplicateProject} disabled={isDuplicating}>
      {isDuplicating ? 'Duplicating...' : 'Duplicate'}
    </button>
  );
}
