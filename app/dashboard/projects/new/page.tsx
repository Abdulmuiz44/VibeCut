import { NewProjectForm } from '@/components/dashboard/new-project-form';

export default function NewProjectPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <div className="glass-card p-6">
        <h1 className="text-3xl font-semibold tracking-tight">Create project</h1>
        <p className="muted mt-1">Start with an upload and edit by transcript.</p>
        <NewProjectForm />
      </div>
    </main>
  );
}
