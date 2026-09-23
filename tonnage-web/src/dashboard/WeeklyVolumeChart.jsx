import { useUnits } from '../settings/SettingsContext';

// Bar per week, newest on the left; dashed line at the weekly volume goal (if set)
export default function WeeklyVolumeChart({ weeks, goalKg }) {
  const { formatTotal: format } = useUnits();
  // Headroom above the tallest bar (or the goal line) so neither touches the top
  const scaleMax = Math.max(...weeks.map((w) => w.volumeKg), goalKg || 0) * 1.1 || 1;
  const toPercent = (kg) => `${Math.round((kg / scaleMax) * 100)}%`;

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Weekly volume</h3>
        {goalKg && (
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-4 border-t-2 border-dashed border-emerald-400" /> Goal {format(goalKg)}
          </span>
        )}
      </div>

      <div className="relative h-40 flex-1 min-h-40">
        {goalKg && (
          <div
            className="absolute inset-x-0 border-t-2 border-dashed border-emerald-400/70 z-10 pointer-events-none"
            style={{ bottom: toPercent(goalKg) }}
          />
        )}
        <div className="absolute inset-0 flex items-end gap-1.5 sm:gap-2">
          {weeks.map((week) => (
            <div
              key={+week.weekStart}
              title={`${week.label}: ${format(week.volumeKg)}`}
              className={`flex-1 rounded-t-md transition-all ${week.isCurrent ? 'bg-blue-500' : 'bg-blue-500/35'}`}
              style={{ height: week.volumeKg > 0 ? toPercent(week.volumeKg) : '2px' }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-1.5 sm:gap-2 mt-2">
        {weeks.map((week) => (
          <div
            key={+week.weekStart}
            className={`flex-1 text-center text-[10px] sm:text-[11px] leading-tight ${
              week.isCurrent ? 'text-white font-semibold' : 'text-slate-500'
            }`}
          >
            {week.label}
          </div>
        ))}
      </div>
    </div>
  );
}
