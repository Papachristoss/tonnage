import { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router';
import { TrendingUp, Award, Flame, Loader2, Target, PlusCircle } from 'lucide-react';
import { exerciseService } from '../services/api';
import { findCategoryForMuscleGroup } from '../constants/categories';
import { useUnits } from '../settings/SettingsContext';
import { useExercises } from '../components/useExercises';
import { LoadingState, ErrorBanner, BackLink } from '../components/PageStatus';
import ProgressChart from '../components/ProgressChart';
import NotFoundPage from './NotFoundPage';
import { workoutModalLink } from '../components/workoutModalLink';

// Route: /exercises/:exerciseId
export default function ExercisePage() {
  const { exerciseId } = useParams();
  const { exercises, loadingExercises, workoutsVersion } = useExercises();
  const { unit, label: unitLabel, fromKg } = useUnits();
  const location = useLocation();

  // Result of the last progress request, tagged with the exercise it belongs to.
  // While it's for a different exercise than the URL, we're still loading.
  const [result, setResult] = useState({ exerciseId: null, progress: null, error: null });
  const loadingProgress = result.exerciseId !== exerciseId;
  const { progress, error: progressError } = loadingProgress ? {} : result;

  // Fetched on every visit, and again whenever a workout is logged (the modal sits on top of this page)
  useEffect(() => {
    let cancelled = false;
    exerciseService
      .getProgress(exerciseId, unit)
      .then((data) => !cancelled && setResult({ exerciseId, progress: data, error: null }))
      .catch((err) => {
        console.error('Error fetching progress:', err);
        if (!cancelled) {
          setResult({ exerciseId, progress: null, error: 'Failed to load progress for this exercise.' });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [exerciseId, workoutsVersion, unit]); // re-fetch after a workout is logged, or the unit changes (advice text)

  if (loadingExercises) return <LoadingState>Loading exercises...</LoadingState>;

  const exercise = exercises.find((ex) => String(ex.id) === exerciseId);
  if (!exercise) return <NotFoundPage />;

  const category = findCategoryForMuscleGroup(exercise.muscleGroup);

  return (
    <div>
      {category ? (
        <BackLink to={`/body-parts/${category.key}`}>{category.label}</BackLink>
      ) : (
        <BackLink to="/">Body parts</BackLink>
      )}

      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-5 mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">{exercise.name}</h2>
            <p className="text-sm text-slate-400 mt-1">
              Primary Target: <span className="text-slate-200 font-medium">{exercise.muscleGroup}</span>
            </p>
          </div>
          <Link
            {...workoutModalLink(location.pathname, exercise.id)}
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
          >
            <PlusCircle className="w-4 h-4" />
            Log this exercise
          </Link>
        </div>

        {progressError && <ErrorBanner>{progressError}</ErrorBanner>}

        {loadingProgress ? (
          <div className="flex items-center justify-center py-20 text-slate-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Calculating volume & 1RM models...
          </div>
        ) : progress ? (
          <div className="space-y-6">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  Est. 1RM (Brzycki)
                </div>
                <div className="text-2xl font-black text-white">
                  {fromKg(progress.currentEstimatedOneRepMax)} <span className="text-sm font-normal text-slate-400">{unitLabel}</span>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  Peak Load
                </div>
                <div className="text-2xl font-black text-white">
                  {fromKg(progress.allTimeRecordWeight)} <span className="text-sm font-normal text-slate-400">{unitLabel}</span>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  Cumulative Tonnage
                </div>
                <div className="text-2xl font-black text-white">
                  {fromKg(progress.totalVolumeHistoricalKg).toLocaleString()} <span className="text-sm font-normal text-slate-400">{unitLabel}</span>
                </div>
              </div>
            </div>

            {/* AI / Overload Advice Card */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/30">
              <div className="flex items-center gap-2 text-blue-400 text-sm font-bold mb-2">
                <Target className="w-4 h-4" />
                Next Session Overload Recommendation
              </div>
              <p className="text-slate-200 text-sm leading-relaxed">{progress.progressionAdvice}</p>
            </div>

            {/* Progression Chart */}
            <ProgressChart history={progress.history} />

            {/* Recent Set History Table */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Set Log History
              </h3>
              {progress.history.length === 0 ? (
                <div className="text-center py-10 bg-slate-900/40 border border-dashed border-slate-800 rounded-xl text-slate-500 text-sm">
                  No sets recorded for this movement yet. Log a workout to start tracking!
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-xs uppercase font-semibold">
                      <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Weight</th>
                        <th className="py-3 px-4">Reps</th>
                        <th className="py-3 px-4">RPE</th>
                        <th className="py-3 px-4">Est. 1RM</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                      {progress.history.map((pt, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 text-slate-300 font-mono text-xs">{pt.sessionDate}</td>
                          <td className="py-3 px-4 font-semibold text-white">{fromKg(pt.weightKg)} {unitLabel}</td>
                          <td className="py-3 px-4 text-slate-300">{pt.reps}</td>
                          <td className="py-3 px-4 text-amber-300 font-medium">@{pt.rpe ?? '-'}</td>
                          <td className="py-3 px-4 text-blue-400 font-mono font-medium">{fromKg(pt.estimatedOneRepMaxKg)} {unitLabel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
