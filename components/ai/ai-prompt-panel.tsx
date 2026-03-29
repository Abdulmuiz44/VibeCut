'use client';

import { useState } from 'react';
import type { EditOperationInput } from '@/lib/validation/operations';

const PROMPTS = ['remove dead air', 'make this tighter', 'add a hook title', 'cut the weak ending'];

export function AiPromptPanel({ onApply, projectId, sequenceId }: { onApply: (op: EditOperationInput) => void; projectId: string; sequenceId: string }) {
  const [prompt, setPrompt] = useState('');
  const [proposals, setProposals] = useState<EditOperationInput[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <aside className="glass-card flex min-h-0 flex-col gap-4 p-4">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">AI editor</h2>
        <p className="muted mt-1">Ask for edits in plain language. The best prompts are short and specific.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PROMPTS.map((sample) => (
          <button key={sample} className="btn-ghost px-3 py-1.5 text-xs" onClick={() => setPrompt(sample)}>
            {sample}
          </button>
        ))}
      </div>

      <textarea className="soft-input min-h-28 resize-none" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="remove filler words and tighten the pacing" />

      <button
        className="btn-primary inline-flex items-center justify-center"
        disabled={isLoading || prompt.trim().length === 0}
        onClick={async () => {
          setIsLoading(true);
          try {
            const res = await fetch('/api/ai/propose-edits', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ projectId, sequenceId, prompt })
            });
            const data = await res.json();
            setProposals(data.operations ?? []);
          } finally {
            setIsLoading(false);
          }
        }}
      >
        {isLoading ? 'Thinking...' : 'Propose edits'}
      </button>

      <div className="min-h-0 space-y-2 overflow-y-auto text-sm">
        {proposals.length ? (
          proposals.map((proposal, idx) => (
            <div key={`${proposal.operationType}-${idx}`} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-slate-100">{proposal.operationType}</p>
                  {proposal.summary ? <p className="mt-1 text-xs text-slate-500">{proposal.summary}</p> : null}
                </div>
                <button className="btn-ghost px-3 py-1.5 text-xs" onClick={() => onApply(proposal)}>
                  Apply
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-500">
            Proposed edits will appear here.
          </div>
        )}
      </div>
    </aside>
  );
}