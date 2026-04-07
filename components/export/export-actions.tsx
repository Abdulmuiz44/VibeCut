'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ExportActions({
  exportId,
  projectId,
  sequenceId,
  preset,
  outputUrl,
  canRetry
}: {
  exportId: string;
  projectId: string;
  sequenceId: string;
  preset: string;
  outputUrl: string | null;
  canRetry: boolean;
}) {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);
  const [isReExporting, setIsReExporting] = useState(false);

  async function retryExport() {
    setIsRetrying(true);
    try {
      const response = await fetch(`/api/exports/${exportId}/retry`, { method: 'POST' });
      if (!response.ok) {
        throw new Error('Unable to retry this export');
      }
      router.refresh();
    } finally {
      setIsRetrying(false);
    }
  }

  async function reExport() {
    setIsReExporting(true);
    try {
      const response = await fetch('/api/exports/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, sequenceId, preset })
      });

      if (!response.ok) {
        throw new Error('Unable to queue a new export');
      }

      const data = (await response.json()) as { id: string };
      router.push(`/dashboard/projects/${projectId}/exports/${data.id}`);
    } finally {
      setIsReExporting(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {outputUrl ? (
        <a className="btn-primary inline-flex" href={outputUrl} target="_blank" rel="noreferrer">
          Download video
        </a>
      ) : null}
      {canRetry ? (
        <button className="btn-ghost inline-flex" onClick={retryExport} disabled={isRetrying}>
          {isRetrying ? 'Retrying...' : 'Retry export'}
        </button>
      ) : null}
      <button className="btn-ghost inline-flex" onClick={reExport} disabled={isReExporting}>
        {isReExporting ? 'Queueing...' : 'Re-export preset'}
      </button>
    </div>
  );
}
