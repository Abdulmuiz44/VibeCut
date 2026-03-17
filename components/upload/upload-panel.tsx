'use client';

import { useState } from 'react';
import * as tus from 'tus-js-client';

const ACCEPTED = ['video/mp4', 'video/quicktime', 'video/webm'];

export function UploadPanel({ projectId }: { projectId: string }) {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Choose a source video');

  const onFile = async (file: File) => {
    if (!ACCEPTED.includes(file.type)) {
      setMessage('Unsupported format. Use mp4, mov, or webm.');
      return;
    }

    const createRes = await fetch('/api/uploads/create', {
      method: 'POST',
      body: JSON.stringify({ projectId, fileName: file.name, mimeType: file.type, sizeBytes: file.size })
    });
    const { uploadUrl, assetId } = await createRes.json();

    const upload = new tus.Upload(file, {
      uploadUrl,
      retryDelays: [0, 1000, 3000, 5000],
      onError: (error) => setMessage(`Upload failed: ${error.message}`),
      onProgress: (uploaded, total) => setProgress(Math.round((uploaded / total) * 100)),
      onSuccess: async () => {
        setMessage('Upload complete. Transcription starting...');
        await fetch('/api/uploads/create', { method: 'PUT', body: JSON.stringify({ projectId, assetId }) });
        location.reload();
      }
    });

    upload.start();
  };

  return (
    <section className="glass-card mx-auto mt-16 max-w-xl p-8">
      <h2 className="text-xl font-semibold tracking-tight">Upload source video</h2>
      <p className="muted mt-2">Resumable TUS upload with automatic transcription.</p>
      <input className="soft-input mt-6" type="file" accept="video/mp4,video/quicktime,video/webm" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      <div className="mt-4 h-2 rounded panel-soft">
        <div className="h-full rounded transition-all" style={{ width: `${progress}%`, background: "var(--primary)" }} />
      </div>
      <p className="muted mt-3">{message}</p>
    </section>
  );
}
