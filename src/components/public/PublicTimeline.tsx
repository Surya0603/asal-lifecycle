import { STAGE_LABELS, StageKey } from '@/lib/stages';

type Media = { id: string; type: 'IMAGE' | 'VIDEO'; url: string };
type Stage = {
  id: string;
  stage: StageKey;
  date: string | null;
  time: string | null;
  location: string | null;
  description: string | null;
  media: Media[];
};

export default function PublicTimeline({ stages }: { stages: Stage[] }) {
  return (
    <div className="relative">
      {stages.map((stage, i) => {
        const hasData = stage.date || stage.location || stage.description || stage.media.length > 0;
        const isComplete = stage.stage === 'COMPLETE';

        return (
          <div key={stage.id} className="relative flex gap-4 sm:gap-6">
            <div className="flex w-14 flex-shrink-0 flex-col items-center sm:w-16">
              <span
                className={`mt-1 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                  isComplete ? 'border-asal-accent bg-asal-accent' : 'border-asal bg-white'
                }`}
              />
              {i < stages.length - 1 && <span className="w-px flex-1 bg-slate-300" />}
            </div>

            <div className="flex-1 pb-8">
              <div className={`rounded-xl border bg-white p-4 shadow-sm sm:p-5 ${isComplete ? 'border-asal-accent ring-1 ring-asal-accent/40' : 'border-slate-200'}`}>
                <h3 className="mb-1 font-semibold text-slate-800">
                  {STAGE_LABELS[stage.stage]}
                  {isComplete && <span className="ml-2 text-xs font-normal text-asal-accent">✓ Refurbishment Complete</span>}
                </h3>

                {!hasData ? (
                  <p className="text-sm text-slate-400">No lifecycle information added yet.</p>
                ) : (
                  <>
                    <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                      {stage.date && (
                        <span>{new Date(stage.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      )}
                      {stage.time && <span>{stage.time}</span>}
                      {stage.location && <span>{stage.location}</span>}
                    </div>

                    {stage.media.length > 0 && (
                      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {stage.media.map((m) => (
                          <div key={m.id} className="overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                            {m.type === 'IMAGE' ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={m.url} alt="" className="h-28 w-full object-cover" />
                            ) : (
                              <video src={m.url} className="h-28 w-full object-cover" controls playsInline />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {stage.description && <p className="whitespace-pre-wrap text-sm text-slate-700">{stage.description}</p>}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
