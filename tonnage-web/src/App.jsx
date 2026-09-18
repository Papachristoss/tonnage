import React, { useState, useEffect } from 'react';
import { exerciseService, profileService } from './services/api';
import WorkoutModal from './components/WorkoutModal';
import ProgressChart from './components/ProgressChart';
import LandingPage from './components/LandingPage';
import ProfilePage from './components/ProfilePage';
import {
  Dumbbell,
  TrendingUp,
  Award,
  Flame,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Target,
  PlusCircle,
  User as UserIcon,
  LogOut
} from 'lucide-react';

// Category definitions: each maps to one or more muscleGroup values from the backend
const CATEGORIES = [
  { key: 'chest', label: 'Chest', match: ['Chest'] },
  { key: 'back', label: 'Back', match: ['Back'] },
  { key: 'arms-shoulders', label: 'Arms & Shoulders', match: ['Arms', 'Shoulders'] },
  { key: 'legs', label: 'Legs', match: ['Legs'] },
];

function App() {
  const [exercises, setExercises] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState(null);

  // Navigation: 'categories' -> 'list' -> 'detail'; profile is a separate overlay-style view
  const [view, setView] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const [selectedExercise, setSelectedExercise] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPresetExerciseId, setModalPresetExerciseId] = useState(null);

  // Authenticated user state (auth-gating only - display info lives in headerProfile)
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('tonnage_user');
    const token = localStorage.getItem('tonnage_token');
    return token && savedUser ? { email: savedUser } : null;
  });

  // Lightweight profile info just for the header (username + avatar), kept in sync
  // by ProfilePage whenever the user edits their profile
  const [headerProfile, setHeaderProfile] = useState({ username: null, profilePicture: null });

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
      loadHeaderProfile();
    }
  }, [currentUser]);

  const loadExercises = async () => {
    try {
      setLoadingList(true);
      setError(null);
      const data = await exerciseService.getAll();
      setExercises(data);
    } catch (err) {
      setError('Failed to load exercises. Ensure Spring Boot is running on port 8080.');
    } finally {
      setLoadingList(false);
    }
  };

  const loadHeaderProfile = async () => {
    try {
      const data = await profileService.get();
      setHeaderProfile({ username: data.username, profilePicture: data.profilePicture });
    } catch (err) {
      // Non-critical for header display - silently ignore, ProfilePage will surface any real error
    }
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setView('list');
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setView('categories');
  };

  const handleBackToList = () => {
    setSelectedExercise(null);
    setProgress(null);
    setView('list');
  };

  const handleSelectExercise = async (exercise) => {
    setSelectedExercise(exercise);
    setView('detail');
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

  const refreshCurrentExerciseProgress = () => {
    if (selectedExercise) {
      handleSelectExercise(selectedExercise);
    }
  };

  const handleWorkoutSaved = () => {
    refreshCurrentExerciseProgress();
  };

  const handleAuthSuccess = (userData) => {
    setCurrentUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('tonnage_token');
    localStorage.removeItem('tonnage_user');
    setCurrentUser(null);
    setShowProfile(false);
    setView('categories');
    setSelectedCategory(null);
    setSelectedExercise(null);
    setProgress(null);
    setHeaderProfile({ username: null, profilePicture: null });
  };

  // "Log Workout" in the header: full exercise list, no preset
  const handleOpenWorkoutModal = () => {
    setModalPresetExerciseId(null);
    setIsModalOpen(true);
  };

  // "+ Log this exercise" on the detail page: pre-fills the current exercise
  const handleOpenWorkoutModalForExercise = () => {
    if (selectedExercise) {
      setModalPresetExerciseId(selectedExercise.id);
    }
    setIsModalOpen(true);
  };

  // Called by ProfilePage whenever username/avatar change, so the header updates instantly
  const handleProfileUpdated = ({ username, profilePicture }) => {
    setHeaderProfile({ username, profilePicture });
  };

  // Called by ProfilePage after a successful email change - the JWT subject is the
  // email, so the backend issues a fresh token that we need to store immediately
  const handleEmailChanged = (newToken, newEmail) => {
    localStorage.setItem('tonnage_token', newToken);
    localStorage.setItem('tonnage_user', newEmail);
    setCurrentUser({ email: newEmail });
  };

  const exercisesInCategory = selectedCategory
    ? exercises.filter((ex) => selectedCategory.match.includes(ex.muscleGroup))
    : [];

  return (
    !currentUser ? (
      <LandingPage onAuthSuccess={handleAuthSuccess} />
    ) : (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-10 px-4 sm:px-6 py-4">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Tonnage</h1>
                <p className="text-xs text-slate-400">Progressive Overload Analytics</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-end">
              {/* Profile Button */}
              <button
                onClick={() => setShowProfile(true)}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl px-3 py-1.5 text-xs transition cursor-pointer"
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
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>

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
        <main className="max-w-6xl mx-auto p-4 sm:p-6">
          {showProfile ? (
            <ProfilePage
              onBack={() => setShowProfile(false)}
              onLogout={handleLogout}
              onProfileUpdated={handleProfileUpdated}
              onEmailChanged={handleEmailChanged}
            />
          ) : (
            <>
              {error && (
                <div className="p-4 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
                  {error}
                </div>
              )}

              {loadingList ? (
                <div className="flex items-center justify-center h-64 text-slate-500 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Loading exercises...
                </div>
              ) : (
                <>
                  {/* STEP 1: Category grid */}
                  {view === 'categories' && (
                    <div>
                      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
                        Choose a body part
                      </h2>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {CATEGORIES.map((cat) => {
                          const count = exercises.filter((ex) => cat.match.includes(ex.muscleGroup)).length;
                          return (
                            <button
                              key={cat.key}
                              onClick={() => handleSelectCategory(cat)}
                              className="bg-slate-900/40 border border-slate-800 hover:border-blue-500/40 hover:bg-slate-900/70 rounded-2xl p-6 text-center transition-all"
                            >
                              <div className="text-base font-bold text-white">{cat.label}</div>
                              <div className="text-xs text-slate-500 mt-1">{count} exercises</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Exercise list for the chosen category */}
                  {view === 'list' && selectedCategory && (
                    <div>
                      <button
                        onClick={handleBackToCategories}
                        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition mb-4"
                      >
                        <ChevronLeft className="w-4 h-4" /> Body parts
                      </button>

                      <h2 className="text-lg font-bold text-white mb-4">{selectedCategory.label}</h2>

                      <div className="space-y-2">
                        {exercisesInCategory.length === 0 ? (
                          <div className="text-center py-10 bg-slate-900/40 border border-dashed border-slate-800 rounded-xl text-slate-500 text-sm">
                            No exercises in this category yet.
                          </div>
                        ) : (
                          exercisesInCategory.map((ex) => (
                            <button
                              key={ex.id}
                              onClick={() => handleSelectExercise(ex)}
                              className="w-full text-left p-3.5 rounded-xl border bg-slate-900/80 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50 transition-all flex items-center justify-between"
                            >
                              <div>
                                <div className="font-semibold text-sm leading-snug text-white">{ex.name}</div>
                                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                                  <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                                    {ex.muscleGroup}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-600" />
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Exercise detail page */}
                  {view === 'detail' && selectedExercise && (
                    <div>
                      <button
                        onClick={handleBackToList}
                        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition mb-4"
                      >
                        <ChevronLeft className="w-4 h-4" /> {selectedCategory ? selectedCategory.label : 'Exercises'}
                      </button>

                      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 sm:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-5 mb-6">
                          <div>
                            <h2 className="text-2xl font-bold tracking-tight text-white">
                              {selectedExercise.name}
                            </h2>
                            <p className="text-sm text-slate-400 mt-1">
                              Primary Target: <span className="text-slate-200 font-medium">{selectedExercise.muscleGroup}</span>
                            </p>
                          </div>
                          <button
                            onClick={handleOpenWorkoutModalForExercise}
                            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                          >
                            <PlusCircle className="w-4 h-4" />
                            Log this exercise
                          </button>
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
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </main>

        {/* Workout Logger Modal */}
        <WorkoutModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          exercises={exercises}
          onWorkoutSaved={handleWorkoutSaved}
          presetExerciseId={modalPresetExerciseId}
        />
      </div>
    )
  );
}

export default App;