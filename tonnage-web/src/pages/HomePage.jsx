import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router';
import { Flame, Check, Trophy, PlusCircle, Dumbbell } from 'lucide-react';
import { workoutService, profileService } from '../services/api';
import { useAuth } from '../auth/AuthContext';
import { useUnits } from '../settings/SettingsContext';
import { CATEGORIES, exercisesInCategory } from '../constants/categories';
import { useExercises } from '../components/useExercises';
import { LoadingState, ErrorBanner } from '../components/PageStatus';
import { workoutModalLink } from '../components/workoutModalLink';
import { buildDashboard, daysBetween, formatDayDate } from '../dashboard/stats';
import { useNow } from '../dashboard/useNow';
import ActivityHeatmap from '../dashboard/ActivityHeatmap';
import WeeklyVolumeChart from '../dashboard/WeeklyVolumeChart';

const NEGLECTED_AFTER_DAYS = 8; // body parts not trained for this long are highlighted

const greetingFor = (date) => {
  const hour = date.getHours();
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
};

const lastTrainedLabel = (date, now) => {
  if (!date) return 'Not trained yet';
  const days = daysBetween(date, now);
  return days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago`;
};

// value [unit] [/ target]  e.g. "2 / 3", "3,468 kg", "3,468 / 6,000 kg"
function StatCard({ label, value, unit, target, progress, footer, footerTone = 'muted' }) {
  const footerClass = { muted: 'text-slate-500', good: 'text-emerald-400', bad: 'text-rose-400' }[footerTone];
  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">{label}</div>
      <div className="text-2xl font-black text-white">
        {value}
        {(target != null || unit) && (
          <span className="text-sm font-normal text-slate-400">
            {target != null && ` / ${target}`}
            {unit && ` ${unit}`}
          </span>
        )}
      </div>
      {progress != null && (
        <div className="h-1.5 mt-3 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full ${progress >= 1 ? 'bg-emerald-500' : 'bg-blue-500'}`}
            style={{ width: `${Math.min(progress, 1) * 100}%` }}
          />
        </div>
      )}
      {footer && <div className={`text-xs mt-2 ${footerClass}`}>{footer}</div>}
    </div>
  );
}

// Route: /
export default function HomePage() {
  const location = useLocation();
  const { currentUser, headerProfile } = useAuth();
  const { exercises, loadingExercises, workoutsVersion } = useExercises();
  const { formatTotal: format, fromKg, label: unitLabel } = useUnits();

  const [data, setData] = useState({ sessions: null, goals: null, error: null });

  // Live clock: the greeting, "today" and "N days ago" follow it while the page stays open
  const now = useNow();
  const today = now.toDateString();

  // Reloads after a workout is logged from the modal (workoutsVersion changes), and when
  // the date changes, in case workouts were logged elsewhere (e.g. on your phone) overnight
  useEffect(() => {
    let cancelled = false;
    Promise.all([workoutService.getAll(), profileService.get()])
      .then(([sessions, profile]) => {
        if (cancelled) return;
        setData({
          sessions,
          goals: { weeklyWorkoutGoal: profile.weeklyWorkoutGoal, weeklyVolumeGoalKg: profile.weeklyVolumeGoalKg },
          error: null,
        });
      })
      .catch(() => !cancelled && setData((d) => ({ ...d, error: 'Failed to load your training data.' })));
    return () => {
      cancelled = true;
    };
  }, [workoutsVersion, today]);

  // Recomputed each clock tick (cheap - it's plain arithmetic over the loaded sessions)
  const dashboard = useMemo(
    () => (data.sessions ? buildDashboard(data.sessions, data.goals, now) : null),
    [data, now]
  );

  if (data.error) return <ErrorBanner>{data.error}</ErrorBanner>;
  if (!dashboard || loadingExercises) return <LoadingState>Loading your dashboard...</LoadingState>;

  const { thisWeek, goals } = dashboard;
  const name = headerProfile.username || currentUser.email.split('@')[0];
  const workoutGoal = goals.weeklyWorkoutGoal;
  const volumeGoal = goals.weeklyVolumeGoalKg;

  const workoutsFooter = workoutGoal ? (
    thisWeek.workouts >= workoutGoal ? (
      <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Goal hit</span>
    ) : (
      `${workoutGoal - thisWeek.workouts} more to hit your goal`
    )
  ) : (
    <Link to="/profile" className="text-blue-400 hover:text-blue-300">Set a weekly goal</Link>
  );

  const change = dashboard.volumeChangePct;
  const changeText = change == null ? null : `${change >= 0 ? '+' : ''}${change}% vs this time last week`;
  const volumeFooter =
    volumeGoal && thisWeek.volumeKg >= volumeGoal ? (
      <span className="flex items-center gap-1">
        <Check className="w-3.5 h-3.5" /> Goal hit{changeText && ` · ${changeText}`}
      </span>
    ) : (
      changeText
    );

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">
            {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {greetingFor(now)}, {name}
          </h2>
        </div>
        {dashboard.streak > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-slate-300">
            <Flame className="w-4 h-4 text-orange-400" />
            {dashboard.streakIsGoalBased
              ? `Goal hit ${dashboard.streak} week${dashboard.streak > 1 ? 's' : ''} in a row`
              : `${dashboard.streak}-week streak`}
          </div>
        )}
      </div>

      {dashboard.hasWorkouts ? (
        <>
          {/* This week */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              label="Workouts this week"
              value={thisWeek.workouts}
              target={workoutGoal}
              progress={workoutGoal ? thisWeek.workouts / workoutGoal : null}
              footer={workoutsFooter}
              footerTone={workoutGoal && thisWeek.workouts >= workoutGoal ? 'good' : 'muted'}
            />
            <StatCard
              label="Volume this week"
              value={Math.round(fromKg(thisWeek.volumeKg)).toLocaleString()}
              unit={unitLabel}
              target={volumeGoal ? Math.round(fromKg(volumeGoal)).toLocaleString() : null}
              progress={volumeGoal ? thisWeek.volumeKg / volumeGoal : null}
              footer={volumeFooter}
              footerTone={volumeGoal && thisWeek.volumeKg >= volumeGoal ? 'good' : change != null && change < 0 ? 'bad' : change > 0 ? 'good' : 'muted'}
            />
            <StatCard label="Sets logged" value={thisWeek.sets} footer="this week" />
            <StatCard label="New PRs" value={dashboard.recentPrCount} footer="last 30 days" />
          </div>

          <ActivityHeatmap weeks={dashboard.heatWeeks} hasWorkoutGoal={!!workoutGoal} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <WeeklyVolumeChart weeks={dashboard.volumeWeeks} goalKg={volumeGoal} />

            {/* Recent workouts */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 sm:p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">Recent workouts</h3>
              <ul className="divide-y divide-slate-800">
                {dashboard.recentWorkouts.map((w) => (
                  <li key={w.id} className="flex items-start justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-semibold text-white">
                        {formatDayDate(w.date)}
                        {w.hasPr && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
                            <Trophy className="w-3 h-3" /> PR
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 truncate">{w.exercises.join(', ')}</div>
                    </div>
                    <div className="text-sm text-slate-300 whitespace-nowrap">{format(w.volumeKg)}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : (
        /* First visit: invite instead of empty charts */
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-10 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
            <Dumbbell className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Log your first workout</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Your weekly stats, training activity and progress charts will appear here once you've logged a session.
          </p>
          <Link
            {...workoutModalLink(location.pathname)}
            className="inline-flex items-center gap-2 mt-5 bg-blue-600 hover:bg-blue-500 text-on-accent text-sm font-bold px-5 py-2.5 rounded-xl transition"
          >
            <PlusCircle className="w-4 h-4" /> Log workout
          </Link>
        </div>
      )}

      {/* Today's workout: pick a body part */}
      <section className="pt-4">
        <h2 className="text-2xl font-bold tracking-tight text-white">Today's workout</h2>
        <p className="text-sm text-slate-400 mt-1 mb-4">Choose a body part</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {CATEGORIES.map((cat) => {
            const lastTrained = cat.match
              .map((group) => dashboard.lastTrainedByMuscleGroup.get(group))
              .filter(Boolean)
              .sort((a, b) => b - a)[0];
            const neglected = lastTrained && daysBetween(lastTrained, now) >= NEGLECTED_AFTER_DAYS;
            return (
              <Link
                key={cat.key}
                to={`/body-parts/${cat.key}`}
                className="bg-slate-900/40 border border-slate-800 hover:border-blue-500/40 hover:bg-slate-900/70 rounded-2xl p-5 sm:p-6 text-center transition-all"
              >
                <div className="text-base font-bold text-white">{cat.label}</div>
                <div className="text-xs text-slate-500 mt-1">{exercisesInCategory(exercises, cat).length} exercises</div>
                <div className={`text-xs mt-1 ${neglected ? 'text-amber-400 font-medium' : 'text-slate-500'}`}>
                  {lastTrainedLabel(lastTrained, now)}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
