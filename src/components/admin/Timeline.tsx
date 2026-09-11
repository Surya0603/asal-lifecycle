'use client';

import StageCard, { StageData } from './StageCard';

export default function Timeline({
  stages,
  onStageSaved
}: {
  stages: StageData[];
  onStageSaved: (stage: StageData) => void;
}) {
  return (
    <div className="relative">
      {stages.map((stage, i) => (
        <div key={stage.id} className="relative flex gap-4 sm:gap-6">
          {/* Left rail: indicator + connecting line + date/time/location */}
          <div className="flex w-20 flex-shrink-0 flex-col items-center sm:w-40">
            <div className="flex flex-col items-center pt-2 text-center">
              {stage.date && (
                <span className="text-xs font-medium text-slate-600">
                  {new Date(stage.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </span>
              )}
              {stage.time && <span className="text-xs text-slate-400">{stage.time}</span>}
              {stage.location && <span className="hidden text-xs text-slate-400 sm:block">{stage.location}</span>}
            </div>
            <span
              className={`my-2 h-3.5 w-3.5 flex-shrink-0 rounded-full border-2 ${
                stage.stage === 'COMPLETE' ? 'border-asal-accent bg-asal-accent' : 'border-asal bg-white'
              }`}
            />
            {i < stages.length - 1 && <span className="w-px flex-1 bg-slate-300" />}
          </div>

          {/* Right side: stage card */}
          <div className="flex-1 pb-8">
            <StageCard stage={stage} index={i} onSaved={onStageSaved} />
          </div>
        </div>
      ))}
    </div>
  );
}
