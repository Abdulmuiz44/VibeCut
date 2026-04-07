'use client';

import { useState } from 'react';

export function BillingActions({
  active,
  planLabel,
  className = ''
}: {
  active: boolean;
  planLabel?: string | null;
  className?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function startBillingFlow() {
    setIsLoading(true);
    setMessage(null);
    try {
      const endpoint = active ? '/api/billing/portal' : '/api/billing/checkout';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'Creator' })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Unable to open billing');
      }

      const data = (await response.json()) as { url: string };
      window.location.href = data.url;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to open billing');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={className}>
      <button className="btn-primary inline-flex" onClick={startBillingFlow} disabled={isLoading}>
        {isLoading ? 'Opening...' : active ? 'Manage billing' : 'Subscribe now'}
      </button>
      {planLabel ? <p className="mt-2 text-xs text-slate-500">Current plan: {planLabel}</p> : null}
      {message ? <p className="mt-2 text-xs text-rose-300">{message}</p> : null}
    </div>
  );
}
