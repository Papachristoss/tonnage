import { useState, useEffect, useCallback } from 'react';
import { Link, Outlet, useNavigate, useLocation, useSearchParams } from 'react-router';
import { exerciseService } from '../services/api';
import { useAuth } from '../auth/AuthContext';
import { useSignOut } from '../auth/useSignOut';
import { Dumbbell, PlusCircle, User as UserIcon, LogOut, Settings } from 'lucide-react';
import WorkoutModal from './WorkoutModal';
import { WORKOUT_MODAL_PARAM, workoutModalLink } from './workoutModalLink';

// Shell for every signed-in page: header on top, the current page below,
// and the "Log Workout" modal over it whenever the URL has ?logWorkout
export default function AppLayout() {
  const { currentUser, headerProfile } = useAuth();
  const signOutAndRedirect = useSignOut();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Bumped after every saved workout so pages showing workout data re-fetch it
  const [workoutsVersion, setWorkoutsVersion] = useState(0);

  const isWorkoutModalOpen = searchParams.has(WORKOUT_MODAL_PARAM);
  const presetExerciseId = Number(searchParams.get(WORKOUT_MODAL_PARAM)) || null;

  // Opened via an in-app link: step back in history. Opened from a pasted/refreshed
  // URL: just drop the ?logWorkout param from the current page.
  const closeWorkoutModal = useCallback(() => {
    if (location.state?.openedWorkoutModal) navigate(-1);
    else navigate({ pathname: location.pathname }, { replace: true });
  }, [location, navigate]);

  const handleWorkoutSaved = () => {
    setWorkoutsVersion((v) => v + 1);
    closeWorkoutModal();
  };

  const [exercises, setExercises] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [exercisesError, setExercisesError] = useState(null);

  useEffect(() => {
    exerciseService
      .getAll()
      .then(setExercises)
      .catch(() => setExercisesError('Failed to load exercises. Ensure Spring Boot is running on port 8080.'))
      .finally(() => setLoadingExercises(false));
  }, []);

  const handleLogout = () => signOutAndRedirect();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-10 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Tonnage</h1>
              <p className="text-xs text-slate-400">Progressive Overload Analytics</p>
            </div>
          </Link>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Profile Link */}
            <Link
              to="/profile"
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl px-3 py-1.5 text-xs transition"
            >
              <div className="w-5 h-5 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                {headerProfile.profilePicture ? (
                  <img src={headerProfile.profilePicture} alt="" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                )}
              </div>
              <span className="text-slate-300 font-medium max-w-[150px] truncate">
                {headerProfile.username || currentUser.email}
              </span>
            </Link>

            {/* Settings Link */}
            <Link
              to="/settings"
              title="Settings"
              aria-label="Settings"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
            >
              <Settings className="w-3.5 h-3.5" />
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              title="Log Out"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>

            {/* Log Workout Link */}
            <Link
              {...workoutModalLink(location.pathname)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-on-accent text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-blue-600/20 transition"
            >
              <PlusCircle className="w-4 h-4" />
              Log Workout
            </Link>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Neon DB Live
            </span>
          </div>
        </div>
      </header>

      {/* Current page */}
      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        <Outlet context={{ exercises, loadingExercises, exercisesError, workoutsVersion }} />
      </main>

      {/* Workout Logger Modal */}
      {isWorkoutModalOpen && exercises.length > 0 && (
        <WorkoutModal
          exercises={exercises}
          presetExerciseId={exercises.some((ex) => ex.id === presetExerciseId) ? presetExerciseId : null}
          onClose={closeWorkoutModal}
          onWorkoutSaved={handleWorkoutSaved}
        />
      )}
    </div>
  );
}
