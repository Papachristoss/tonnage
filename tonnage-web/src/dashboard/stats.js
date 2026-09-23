// Everything the home page shows is derived here from GET /api/workouts
// (sessions with their sets) plus the user's weekly goals. Weeks run Monday-Sunday
// in the browser's local time; lists are ordered newest first, as the UI shows them.

export const HEATMAP_WEEKS = 10;
export const VOLUME_WEEKS = 8;
export const RECENT_WORKOUTS = 4;
const PR_WINDOW_DAYS = 30;

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days); // calendar days, so DST changes don't shift anything
  return d;
};

// Monday 00:00 of the week containing `date`
export const startOfWeek = (date) => {
  const d = startOfDay(date);
  return addDays(d, -((d.getDay() + 6) % 7));
};

const dayKey = (date) => date.toLocaleDateString('en-CA'); // YYYY-MM-DD, local

// Fixed short names rather than toLocaleDateString: locales disagree ("Sep" vs "Sept")
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const formatShortDate = (date) => `${date.getDate()} ${MONTHS[date.getMonth()]}`; // "14 Sep"
export const formatDayDate = (date) => `${WEEKDAYS[date.getDay()]} ${formatShortDate(date)}`; // "Tue 22 Sep"

export const daysBetween =(from, to) => Math.round((startOfDay(to) - startOfDay(from)) / 86_400_000);

export function buildDashboard(sessions, goals, now = new Date()) {
  const { weeklyWorkoutGoal, weeklyVolumeGoalKg } = goals;

  // The API sends LocalDateTime without a zone ("2026-09-24T18:30:00"), which Date parses as local time
  const chronological = sessions
    .map((s) => ({ ...s, date: new Date(s.startedAt) }))
    .sort((a, b) => a.date - b.date);

  // Per-day totals
  const days = new Map();
  for (const s of chronological) {
    const key = dayKey(s.date);
    const day = days.get(key) || { workouts: 0, volumeKg: 0, sets: 0 };
    day.workouts += 1;
    day.volumeKg += s.totalTonnageKg || 0;
    day.sets += s.totalSets ?? s.sets.length;
    days.set(key, day);
  }
  const dayStats = (date) => days.get(dayKey(date)) || { workouts: 0, volumeKg: 0, sets: 0 };

  const weekStats = (weekStart) => {
    const total = { weekStart, workouts: 0, volumeKg: 0, sets: 0 };
    for (let i = 0; i < 7; i++) {
      const day = dayStats(addDays(weekStart, i));
      total.workouts += day.workouts;
      total.volumeKg += day.volumeKg;
      total.sets += day.sets;
    }
    return total;
  };

  const today = startOfDay(now);
  const thisWeekStart = startOfWeek(now);
  const weekStartAgo = (n) => addDays(thisWeekStart, -7 * n);

  // With a workout goal a week "counts" when the goal is met; without one, any workout counts
  const weekCounts = (week) => (weeklyWorkoutGoal ? week.workouts >= weeklyWorkoutGoal : week.workouts > 0);

  // --- This week vs the same point last week (Mon..today's weekday), so a half-finished
  // week isn't compared against a whole one ---
  const thisWeek = weekStats(thisWeekStart);
  const daysIntoWeek = daysBetween(thisWeekStart, today) + 1;
  let lastWeekToDateKg = 0;
  for (let i = 0; i < daysIntoWeek; i++) lastWeekToDateKg += dayStats(addDays(weekStartAgo(1), i)).volumeKg;
  const volumeChangePct =
    lastWeekToDateKg > 0 ? Math.round(((thisWeek.volumeKg - lastWeekToDateKg) / lastWeekToDateKg) * 100) : null;

  // --- Streak: consecutive weeks that count, back from this week. An unfinished
  // current week that doesn't count yet doesn't break the streak.
  let streak = weekCounts(thisWeek) ? 1 : 0;
  for (let n = 1; n < 520; n++) {
    if (!weekCounts(weekStats(weekStartAgo(n)))) break;
    streak += 1;
  }

  // --- Activity heatmap: newest week first, each week Monday..Sunday ---
  const heatWeeks = Array.from({ length: HEATMAP_WEEKS }, (_, n) => {
    const weekStart = weekStartAgo(n);
    const dayCells = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i);
      return { date, ...dayStats(date), isToday: +date === +today, isFuture: date > today };
    });
    const week = weekStats(weekStart);
    return {
      weekStart,
      days: dayCells,
      isCurrent: n === 0,
      goalHit: weeklyWorkoutGoal ? week.workouts >= weeklyWorkoutGoal : null,
    };
  });
  // Shade each day relative to the busiest day on the grid (levels 1-4; 0 = rest day).
  // Thresholds are skewed high because most training days land at 50-100% of the max,
  // and an even 25/50/75 split would paint nearly all of them the darkest shade.
  const maxDayVolume = Math.max(0, ...heatWeeks.flatMap((w) => w.days.map((d) => d.volumeKg)));
  const levelFor = (volumeKg) => {
    const ratio = maxDayVolume > 0 ? volumeKg / maxDayVolume : 0;
    return ratio >= 0.9 ? 4 : ratio >= 0.7 ? 3 : ratio >= 0.45 ? 2 : 1;
  };
  for (const week of heatWeeks) {
    for (const day of week.days) {
      day.level = day.workouts === 0 ? 0 : levelFor(day.volumeKg);
    }
  }

  // --- Weekly volume: newest first ---
  const volumeWeeks = Array.from({ length: VOLUME_WEEKS }, (_, n) => ({
    ...weekStats(weekStartAgo(n)),
    label: n === 0 ? 'This week' : formatShortDate(weekStartAgo(n)),
    isCurrent: n === 0,
  }));

  // --- Personal records: a set whose estimated 1RM beats every earlier set of that
  // exercise. The first time an exercise is logged isn't a PR (nothing to beat).
  const bestE1rm = new Map();
  const prSessionIds = new Set();
  const prDates = [];
  for (const s of chronological) {
    const prExercisesThisSession = new Set();
    for (const set of s.sets) {
      const previous = bestE1rm.get(set.exerciseId);
      const e1rm = set.estimatedOneRepMaxKg ?? 0;
      if (previous != null && e1rm > previous && !prExercisesThisSession.has(set.exerciseId)) {
        prExercisesThisSession.add(set.exerciseId);
        prSessionIds.add(s.id);
        prDates.push(s.date);
      }
      if (previous == null || e1rm > previous) bestE1rm.set(set.exerciseId, e1rm);
    }
  }
  const recentPrCount = prDates.filter((d) => daysBetween(d, now) < PR_WINDOW_DAYS).length;

  // --- Recent workouts: newest first ---
  const recentWorkouts = chronological
    .slice(-RECENT_WORKOUTS)
    .reverse()
    .map((s) => ({
      id: s.id,
      date: s.date,
      exercises: [...new Set(s.sets.map((set) => set.exerciseName))],
      volumeKg: s.totalTonnageKg || 0,
      hasPr: prSessionIds.has(s.id),
    }));

  // --- Last time each muscle group was trained ---
  const lastTrainedByMuscleGroup = new Map();
  for (const s of chronological) {
    for (const set of s.sets) lastTrainedByMuscleGroup.set(set.muscleGroup, s.date);
  }

  return {
    hasWorkouts: chronological.length > 0,
    goals: { weeklyWorkoutGoal, weeklyVolumeGoalKg },
    thisWeek,
    volumeChangePct,
    streak,
    streakIsGoalBased: !!weeklyWorkoutGoal,
    heatWeeks,
    volumeWeeks,
    recentPrCount,
    recentWorkouts,
    lastTrainedByMuscleGroup,
  };
}
