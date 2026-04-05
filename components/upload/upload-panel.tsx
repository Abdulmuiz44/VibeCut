'use client';

import { useState } from 'react';
import * as tus from 'tus-js-client';

const ACCEPTED = ['video/mp4', 'video/quicktime', 'video/webm'];

export function UploadPanel({ projectId }: { projectId: string }) {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Choose a source video');
  const [isUploading, setIsUploading] = useState(false);

  const onFile = async (file: File) => {
    if (!ACCEPTED.includes(file.type)) {
      setMessage('Unsupported format. Use mp4, mov, or webm.');
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setMessage('Preparing resumable upload...');

    try {
      const createRes = await fetch('/api/uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, fileName: file.name, mimeType: file.type, sizeBytes: file.size })
      });

      if (!createRes.ok) {
        const errorText = await createRes.text();
        setMessage(`Upload init failed: ${errorText}`);
        return;
      }

      const { uploadEndpoint, bucketName, objectName, assetId } = await createRes.json();
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!anonKey) {
        setMessage('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
        return;
      }

      const upload = new tus.Upload(file, {
        endpoint: uploadEndpoint,
        retryDelays: [0, 1000, 3000, 5000],
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        headers: {
          authorization: `Bearer ${anonKey}`,
          apikey: anonKey,
          'x-upsert': 'true'
        },
        metadata: {
          bucketName,
          objectName,
          contentType: file.type,
          cacheControl: '3600'
        },
        onError: (error) => {
          setMessage(`Upload failed: ${error.message}`);
          setIsUploading(false);
        },
        onProgress: (uploaded, total) => setProgress(Math.round((uploaded / total) * 100)),
        onSuccess: async () => {
          setMessage('Upload complete. Transcription starting...');
          await fetch('/api/uploads', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId, assetId })
          });
          location.reload();
        }
      });

      upload.start();
    } catch (error) {
      const messageText = error instanceof Error ? error.message : 'Upload failed';
      setMessage(messageText);
      setIsUploading(false);
    }
  };

  return (
    <section className="mt-8 grid gap-4 rounded-[1.75rem] border border-slate-800 bg-slate-950/50 p-5 lg:grid-cols-[1fr_280px] lg:p-6">
      <div>
        <h3 className="text-xl font-semibold tracking-tight text-white">Upload source video</h3>
        <p className="muted mt-2 max-w-xl leading-7">Resumable TUS upload with automatic transcription and editor prep.</p>
        <input className="soft-input mt-6" type="file" accept="video/mp4,video/quicktime,video/webm" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="muted mt-3">{message}</p>
      </div>

      <div className="surface-card p-4">
        <p className="section-label">Accepted files</p>
        <ul className="mt-4 space-y-2 text-sm text-slate-300">
          <li className="rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2">MP4</li>
          <li className="rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2">MOV</li>
          <li className="rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2">WebM</li>
        </ul>
        <p className="muted mt-4">Large files are uploaded with retry support. The editor refreshes when the file is ready.</p>
        {isUploading ? <p className="mt-4 text-xs uppercase tracking-[0.2em] text-emerald-300">Uploading</p> : null}
      </div>
    </section>
  );
}