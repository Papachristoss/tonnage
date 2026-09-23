import { Check } from 'lucide-react';
import { formatDayDate, formatShortDate } from './stats';
import { useUnits } from '../settings/SettingsContext';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// Horizontal space between week columns (shared by the cells and the labels under them)
const WEEK_GAP = 'gap-x-2.5 sm:gap-x-4';

// Shade per activity level (0 = rest day). blue-500 is the same in both themes;
// slate-800 flips with the theme, so empty cells stay subtle in light and dark.
const LEVEL_CLASSES = [
  'bg-slate-800/60',
  'bg-blue-500/25',
  'bg-blue-500/50',
  'bg-blue-500/75',
  'bg-blue-500',
];

// Grid of the last weeks, newest week on the left, Monday at the top
export default function ActivityHeatmap({ weeks, hasWorkoutGoal }) {
  const { formatTotal: format } = useUnits();

  const describe = (day) =>
    day.isFuture
      ? `${formatDayDate(day.date)} - coming up`
      : day.workouts === 0
        ? `${formatDayDate(day.date)} - rest day`
        : `${formatDayDate(day.date)} - ${day.workouts} workout${day.workouts > 1 ? 's' : ''}, ${format(day.volumeKg)}`;

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Training activity</h3>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm border border-dashed border-slate-600" /> Not yet
          </span>
          {hasWorkoutGoal && (
            <span className="flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-400" /> Goal hit
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 sm:gap-x-3">
        {/* Day labels */}
        <div className="grid grid-rows-7 gap-y-1 sm:gap-y-1.5" aria-hidden="true">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="h-5 sm:h-6 flex items-center text-[11px] font-medium text-slate-500">
              {label}
            </div>
          ))}
        </div>

        {/* Cells: fill column by column (one column per week), newest week first */}
        <div
          role="img"
          aria-label={`Training activity for the last ${weeks.length} weeks`}
          className={`grid grid-flow-col grid-rows-7 gap-y-1 sm:gap-y-1.5 ${WEEK_GAP}`}
          style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
        >
          {weeks.flatMap((week) =>
            week.days.map((day) => (
              <div
                key={+day.date}
                title={describe(day)}
                className={`h-5 sm:h-6 rounded ${
                  day.isFuture ? 'border border-dashed border-slate-700' : LEVEL_CLASSES[day.level]
                } ${day.isToday ? 'ring-2 ring-blue-500 ring-offset-1 ring-offset-slate-900' : ''}`}
              />
            ))
          )}
        </div>

        {/* Under each week: the Monday it started ("this week" for the current one),
            then a tick if the workout goal was hit */}
        <div />
        <div
          className={`grid mt-2 ${WEEK_GAP}`}
          style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
        >
          {weeks.map((week) => (
            <div key={+week.weekStart} className="flex flex-col items-center gap-1">
              <span
                className={`text-[10px] sm:text-[11px] whitespace-nowrap ${
                  week.isCurrent ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                {week.isCurrent ? 'this week' : formatShortDate(week.weekStart)}
              </span>
              {hasWorkoutGoal && (
                <span className="h-4">
                  {week.goalHit && <Check className="w-4 h-4 text-emerald-400" aria-label="Goal hit" />}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
