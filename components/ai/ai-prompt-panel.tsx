'use client';

import { useState } from 'react';
import type { EditOperationInput } from '@/lib/validation/operations';

export function AiPromptPanel({ onApply, projectId, sequenceId }: { onApply: (op: EditOperationInput) => void; projectId: string; sequenceId: string }) {
  const [prompt, setPrompt] = useState('');
  const [proposals, setProposals] = useState<EditOperationInput[]>([]);

  return (
    <aside className="glass-card p-4">
      <h2 className="font-semibold tracking-tight">AI Editor</h2>
      <p className="muted mt-1">Try: “remove dead air”, “make this tighter”, “add a hook title”.</p>
      <textarea className="soft-input mt-3 h-24" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="remove filler words" />
      <button
        className="btn-primary mt-2"
        onClick={async () => {
          const res = await fetch('/api/ai/propose-edits', { method: 'POST', body: JSON.stringify({ projectId, sequenceId, prompt }) });
          const data = await res.json();
          setProposals(data.operations ?? []);
        }}
      >
        Propose edits
      </button>
      <div className="mt-4 space-y-2 text-sm">
        {proposals.map((proposal, idx) => (
          <div key={idx} className="panel-soft rounded-xl p-2">
            <p className="text-brand">{proposal.operationType}</p>
            <button className="btn-ghost mt-2 px-3 py-1" onClick={() => onApply(proposal)}>
              Apply
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
}
