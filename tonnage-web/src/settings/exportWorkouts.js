import { workoutService } from '../services/api';

// Quote a CSV field when needed. Cells starting with = + - @ are prefixed with ' so
// spreadsheet apps don't run them as formulas (exercise names are user-created).
function csvCell(value) {
  if (value == null) return '';
  let text = String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// Downloads every logged set as a CSV file, one row per set, oldest first.
// Returns the number of sets exported.
export async function exportWorkoutsCsv({ label, fromKg }) {
  const sessions = await workoutService.getAll();

  const header = ['Date', 'Time', 'Exercise', 'Muscle Group', 'Set', `Weight (${label})`, 'Reps', 'RPE', `Est. 1RM (${label})`];
  const rows = [...sessions]
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt))
    .flatMap((session) => {
      const [date, time = ''] = session.startedAt.split('T');
      return session.sets.map((set) => [
        date,
        time.slice(0, 5),
        set.exerciseName,
        set.muscleGroup,
        set.setNumber,
        fromKg(set.weightKg),
        set.reps,
        set.rpe,
        fromKg(set.estimatedOneRepMaxKg),
      ]);
    });

  if (rows.length === 0) return 0;

  const csv = [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
  // BOM so Excel opens it as UTF-8
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  // Local date (toISOString() would be UTC and can be off by a day)
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  link.download = `tonnage-workouts-${today}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  return rows.length;
}
