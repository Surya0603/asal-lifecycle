'use client';

import { useRef, useState } from 'react';

export type MediaItem = {
  id: string;
  type: 'IMAGE' | 'VIDEO';
  url: string;
};

export default function MediaGallery({
  stageId,
  media,
  onChange
}: {
  stageId: string;
  media: MediaItem[];
  onChange: (media: MediaItem[]) => void;
}) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);

    const form = new FormData();
    form.append('stageId', stageId);
    form.append('file', file);

    const res = await fetch('/api/admin/media/upload', { method: 'POST', body: form });
    const data = await res.json();
    setUploading(false);

    if (!res.ok) {
      setError(data.error || 'Upload failed.');
      return;
    }

    onChange([...media, data.media]);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this media file?')) return;
    const res = await fetch(`/api/admin/media/${id}`, { method: 'DELETE' });
    if (res.ok) {
      onChange(media.filter((m) => m.id !== id));
    }
  }

  return (
    <div>
      {media.length === 0 ? (
        <div className="mb-3 flex h-32 items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
          No media added yet
        </div>
      ) : (
        <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {media.map((m) => (
            <div key={m.id} className="group relative overflow-hidden rounded-md border border-slate-200 bg-slate-50">
              {m.type === 'IMAGE' ? (
                <img src={m.url} alt="" className="h-28 w-full object-cover" />
              ) : (
                <video src={m.url} className="h-28 w-full object-cover" controls />
              )}
              <button
                onClick={() => handleDelete(m.id)}
                className="absolute right-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/mp4,video/webm"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => imageInputRef.current?.click()}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          + Add Image
        </button>
        <button
          type="button"
          disabled={uploading}
          onClick={() => videoInputRef.current?.click()}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          + Add Video
        </button>
        {uploading && <span className="self-center text-xs text-slate-400">Uploading…</span>}
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
