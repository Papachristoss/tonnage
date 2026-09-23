import { Link } from 'react-router';
import { CATEGORIES, exercisesInCategory } from '../constants/categories';
import { useExercises } from '../components/useExercises';
import { LoadingState, ErrorBanner } from '../components/PageStatus';

// Route: /
export default function BodyPartsPage() {
  const { exercises, loadingExercises, exercisesError } = useExercises();

  if (loadingExercises) return <LoadingState>Loading exercises...</LoadingState>;

  return (
    <div>
      {exercisesError && <ErrorBanner>{exercisesError}</ErrorBanner>}

      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
        Choose a body part
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.key}
            to={`/body-parts/${cat.key}`}
            className="bg-slate-900/40 border border-slate-800 hover:border-blue-500/40 hover:bg-slate-900/70 rounded-2xl p-6 text-center transition-all"
          >
            <div className="text-base font-bold text-white">{cat.label}</div>
            <div className="text-xs text-slate-500 mt-1">
              {exercisesInCategory(exercises, cat).length} exercises
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
