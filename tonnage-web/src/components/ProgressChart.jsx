import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl shadow-xl text-xs space-y-1">
        <p className="font-semibold text-slate-300">{label}</p>
        <p className="text-blue-400 font-medium">
          Est. 1RM: <span className="font-bold text-white">{data.estimatedOneRepMaxKg} kg</span>
        </p>
        <p className="text-emerald-400 font-medium">
          Load: <span className="font-bold text-white">{data.weightKg} kg</span> × {data.reps} reps
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
  if (!history || history.length === 0) {
    return null;
  }

  // Ensure points are displayed chronologically
  const chartData = [...history].reverse().map((pt, idx) => ({
    ...pt,
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
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Est. 1RM (kg)
          </span>
        </div>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="color1RM" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="displayLabel"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 10', 'dataMax + 10']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="estimatedOneRepMaxKg"
              stroke="#3b82f6"
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