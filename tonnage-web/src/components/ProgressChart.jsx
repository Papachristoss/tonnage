import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useSettings, useUnits } from '../settings/SettingsContext';

// Recharts draws SVG with color props, so it can't use the Tailwind classes -
// these are the same palette values as index.css for each theme
const CHART_COLORS = {
  dark: { line: '#3b82f6', grid: '#1e293b', axis: '#334155', tick: '#64748b' },
  light: { line: '#2563eb', grid: '#e2e8f0', axis: '#cbd5e1', tick: '#64748b' },
};

// Points arrive already converted to the display unit (see chartData below)
function CustomTooltip({ active, payload, label, unitLabel }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl shadow-xl text-xs space-y-1">
        <p className="font-semibold text-slate-300">{label}</p>
        <p className="text-blue-400 font-medium">
          Est. 1RM: <span className="font-bold text-white">{data.estimatedOneRepMax} {unitLabel}</span>
        </p>
        <p className="text-emerald-400 font-medium">
          Load: <span className="font-bold text-white">{data.weight} {unitLabel}</span> × {data.reps} reps
        </p>
        {data.rpe && (
          <p className="text-amber-300 font-medium">
            Intensity: <span className="font-bold">@{data.rpe} RPE</span>
          </p>
        )}
      </div>
    );
  }
  return null;
}

export default function ProgressChart({ history }) {
  const { resolvedTheme } = useSettings();
  const { label: unitLabel, fromKg } = useUnits();
  const colors = CHART_COLORS[resolvedTheme];

  if (!history || history.length === 0) {
    return null;
  }

  // Ensure points are displayed chronologically
  const chartData = [...history].reverse().map((pt, idx) => ({
    ...pt,
    weight: fromKg(pt.weightKg),
    estimatedOneRepMax: fromKg(pt.estimatedOneRepMaxKg),
    displayLabel: pt.sessionDate ? pt.sessionDate.slice(5) : `#${idx + 1}`,
  }));

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Strength Progression Curve
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Estimated 1RM trendline across training history
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-blue-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Est. 1RM ({unitLabel})
          </span>
        </div>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="color1RM" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.line} stopOpacity={0.4} />
                <stop offset="95%" stopColor={colors.line} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
            <XAxis
              dataKey="displayLabel"
              stroke={colors.tick}
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: colors.axis }}
            />
            <YAxis
              stroke={colors.tick}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 10', 'dataMax + 10']}
            />
            <Tooltip content={<CustomTooltip unitLabel={unitLabel} />} />
            <Area
              type="monotone"
              dataKey="estimatedOneRepMax"
              stroke={colors.line}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#color1RM)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
