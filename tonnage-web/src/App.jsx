import React, { useState, useEffect } from 'react';
import { exerciseService } from './services/api';
import WorkoutModal from './components/WorkoutModal';
import AuthModal from './components/AuthModal';
import ProgressChart from './components/ProgressChart';
import LandingPage from './components/LandingPage';
import { 
  Dumbbell, 
  TrendingUp, 
  Award, 
  Flame, 
  ChevronRight, 
  Loader2, 
  Target, 
  PlusCircle, 
  User as UserIcon, 
  LogOut 
} from 'lucide-react';

function App() {
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Authenticated user state
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('tonnage_user');
    const token = localStorage.getItem('tonnage_token');
    return token && savedUser ? { email: savedUser } : null;
  });

  useEffect(() => {
    // Listen for 401 unauthenticated signals from api.js interceptor
    const handleAuthChange = () => {
      setCurrentUser(null);
    };
    window.addEventListener('tonnage_auth_changed', handleAuthChange);

    return () => {
      window.removeEventListener('tonnage_auth_changed', handleAuthChange);
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadExercises();
    }
  }, [currentUser]);

  const loadExercises = async () => {
    try {
      setLoadingList(true);
      setError(null);
      const data = await exerciseService.getAll();
      setExercises(data);
      if (data.length > 0) {
        handleSelectExercise(data[0]);
      }
    } catch (err) {
      setError('Failed to load exercises. Ensure Spring Boot is running on port 8080.');
    } finally {
      setLoadingList(false);
    }
  };

  const handleSelectExercise = async (exercise) => {
    setSelectedExercise(exercise);
    try {
      setLoadingProgress(true);
      const progressData = await exerciseService.getProgress(exercise.id);
      setProgress(progressData);
    } catch (err) {
      console.error('Error fetching progress:', err);
    } finally {
      setLoadingProgress(false);
    }
  };

  const handleWorkoutSaved = () => {
    if (selectedExercise) {
      handleSelectExercise(selectedExercise);
    }
  };

  const handleAuthSuccess = (userData) => {
    setCurrentUser(userData);
    if (selectedExercise) {
      handleSelectExercise(selectedExercise);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tonnage_token');
    localStorage.removeItem('tonnage_user');
    setCurrentUser(null);
    if (selectedExercise) {
      handleSelectExercise(selectedExercise);
    }
  };

  const handleOpenWorkoutModal = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsModalOpen(true);
  };

  return (
  !currentUser ? (
    <LandingPage onAuthSuccess={handleAuthSuccess} />
  ) : (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Tonnage</h1>
              <p className="text-xs text-slate-400">Progressive Overload Analytics</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* User Session Bar */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
                <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-slate-300 font-medium max-w-[150px] truncate">
                  {currentUser.email}
                </span>
                <button
                  onClick={handleLogout}
                  title="Log Out"
                  className="ml-1 text-slate-400 hover:text-rose-400 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              >
                Sign In
              </button>
            )}

            {/* Log Workout Button */}
            <button
              onClick={handleOpenWorkoutModal}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-blue-600/20 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Log Workout
            </button>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Neon DB Live
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto p-6">
        {error && (
          <div className="p-4 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Exercises List */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col h-[750px]">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Master Exercises ({exercises.length})
              </h2>
            </div>

            <div className="overflow-y-auto space-y-2 pr-1 flex-1">
              {loadingList ? (
                <div className="flex items-center justify-center h-48 text-slate-500 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Loading exercises...
                </div>
              ) : (
                exercises.map((ex) => {
                  const isSelected = selectedExercise?.id === ex.id;
                  return (
                    <button
                      key={ex.id}
                      onClick={() => handleSelectExercise(ex)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-600/10 border-blue-500/40 text-white shadow-sm'
                          : 'bg-slate-900/80 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-sm leading-snug">{ex.name}</div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                            {ex.muscleGroup}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-600'}`} />
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Analytics & Progression Advice */}
          <div className="lg:col-span-2 space-y-6">
            {selectedExercise && (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-start justify-between border-b border-slate-800 pb-5 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">
                      {selectedExercise.name}
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                      Primary Target: <span className="text-slate-200 font-medium">{selectedExercise.muscleGroup}</span>
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-lg text-xs bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                    ID: #{selectedExercise.id}
                  </span>
                </div>

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
                          {progress.currentEstimatedOneRepMax} <span className="text-sm font-normal text-slate-400">kg</span>
                        </div>
                      </div>

                      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                          <TrendingUp className="w-4 h-4 text-blue-400" />
                          Peak Load
                        </div>
                        <div className="text-2xl font-black text-white">
                          {progress.allTimeRecordWeight} <span className="text-sm font-normal text-slate-400">kg</span>
                        </div>
                      </div>

                      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                          <Flame className="w-4 h-4 text-orange-400" />
                          Cumulative Tonnage
                        </div>
                        <div className="text-2xl font-black text-white">
                          {progress.totalVolumeHistoricalKg} <span className="text-sm font-normal text-slate-400">kg</span>
                        </div>
                      </div>
                    </div>

                    {/* Progression Chart */}
                    <ProgressChart history={progress.history} />

                    {/* AI / Overload Advice Card */}
                    <div className="p-5 rounded-xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/30">
                      <div className="flex items-center gap-2 text-blue-400 text-sm font-bold mb-2">
                        <Target className="w-4 h-4" />
                        Next Session Overload Recommendation
                      </div>
                      <p className="text-slate-200 text-sm leading-relaxed">
                        {progress.progressionAdvice}
                      </p>
                    </div>

                    {/* Recent Set History Table */}
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
                        Set Log History
                      </h3>
                      {progress.history.length === 0 ? (
                        <div className="text-center py-10 bg-slate-900/40 border border-dashed border-slate-800 rounded-xl text-slate-500 text-sm">
                          {currentUser 
                            ? 'No sets recorded for this movement yet. Log a workout to start tracking!' 
                            : 'Sign in to record your sets and view your personalized progression curve.'}
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
                                  <td className="py-3 px-4 font-semibold text-white">{pt.weightKg} kg</td>
                                  <td className="py-3 px-4 text-slate-300">{pt.reps}</td>
                                  <td className="py-3 px-4 text-amber-300 font-medium">@{pt.rpe ?? '-'}</td>
                                  <td className="py-3 px-4 text-blue-400 font-mono font-medium">{pt.estimatedOneRepMaxKg} kg</td>
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
            )}
          </div>
        </div>
      </main>

      {/* Workout Logger Modal */}
      <WorkoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        exercises={exercises}
        onWorkoutSaved={handleWorkoutSaved}
      />

        </div>
  )
  );
}

export default App;