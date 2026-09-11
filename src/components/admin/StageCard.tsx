'use client';

import { useState } from 'react';
import MediaGallery, { MediaItem } from './MediaGallery';
import { STAGE_LABELS, StageKey } from '@/lib/stages';

export type StageData = {
  id: string;
  stage: StageKey;
  order: number;
  date: string | null;
  time: string | null;
  location: string | null;
  description: string | null;
  media: MediaItem[];
};

function toDateInputValue(iso: string | null) {
  if (!iso) return '';
  return iso.slice(0, 10);
}

export default function StageCard({
  stage,
  index,
  onSaved
}: {
  stage: StageData;
  index: number;
  onSaved: (stage: StageData) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(toDateInputValue(stage.date));
  const [time, setTime] = useState(stage.time || '');
  const [location, setLocation] = useState(stage.location || '');
  const [description, setDescription] = useState(stage.description || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isComplete = stage.stage === 'COMPLETE';
  const hasData = stage.date || stage.location || stage.description || stage.media.length > 0;

  async function handleSave() {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/lifecycle/stage/${stage.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: date || null, time: time || null, location: location || null, description: description || null })
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || 'Failed to save.');
      return;
    }
    onSaved({ ...stage, ...data.stage });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className={`rounded-xl border bg-white p-5 shadow-sm ${isComplete ? 'border-asal-accent ring-1 ring-asal-accent/40' : 'border-slate-200'}`}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-asal text-xs font-semibold text-white">
            {index + 1}
          </span>
          <h3 className="font-semibold text-slate-800">
            {STAGE_LABELS[stage.stage]}
            {isComplete && <span className="ml-2 text-xs font-normal text-asal-accent">✓ Refurbishment Complete</span>}
          </h3>
        </div>
        {saved && <span className="text-xs text-green-600">Saved ✓</span>}
      </div>

      {editing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Coimbatore" className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              placeholder={`Describe what happened during ${STAGE_LABELS[stage.stage]}…`}
            />
          </div>

          <MediaGallery
            stageId={stage.id}
            media={stage.media}
            onChange={(media) => onSaved({ ...stage, media })}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} disabled={saving} className="rounded-md bg-asal px-4 py-1.5 text-sm text-white hover:bg-slate-800 disabled:opacity-60">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => setEditing(false)} className="rounded-md border border-slate-300 px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          {!hasData ? (
            <p className="mb-3 text-sm text-slate-400">No lifecycle information added yet.</p>
          ) : (
            <>
              <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                {stage.date && <span>{new Date(stage.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>}
                {stage.time && <span>{stage.time}</span>}
                {stage.location && <span>{stage.location}</span>}
              </div>
              {stage.media.length > 0 && (
                <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {stage.media.slice(0, 4).map((m) => (
                    <div key={m.id} className="overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                      {m.type === 'IMAGE' ? (
                        <img src={m.url} alt="" className="h-20 w-full object-cover" />
                      ) : (
                        <video src={m.url} className="h-20 w-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              )}
              {stage.description && <p className="mb-3 whitespace-pre-wrap text-sm text-slate-700">{stage.description}</p>}
            </>
          )}
          <button onClick={() => setEditing(true)} className="rounded-md border border-slate-300 px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
            {hasData ? 'Edit' : 'Add Stage Details'}
          </button>
        </div>
      )}
    </div>
  );
}
