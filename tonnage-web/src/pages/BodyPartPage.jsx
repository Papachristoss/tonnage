import { Link, useParams } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { findCategoryByKey, exercisesInCategory } from '../constants/categories';
import { useExercises } from '../components/useExercises';
import { LoadingState, ErrorBanner, BackLink } from '../components/PageStatus';
import NotFoundPage from './NotFoundPage';

// Route: /body-parts/:categoryKey
export default function BodyPartPage() {
  const { categoryKey } = useParams();
  const { exercises, loadingExercises, exercisesError } = useExercises();
  const category = findCategoryByKey(categoryKey);

  if (!category) return <NotFoundPage />;
  if (loadingExercises) return <LoadingState>Loading exercises...</LoadingState>;

  const categoryExercises = exercisesInCategory(exercises, category);

  return (
    <div>
      <BackLink to="/">Home</BackLink>
      {exercisesError && <ErrorBanner>{exercisesError}</ErrorBanner>}

      <h2 className="text-lg font-bold text-white mb-4">{category.label}</h2>

      <div className="space-y-2">
        {categoryExercises.length === 0 ? (
          <div className="text-center py-10 bg-slate-900/40 border border-dashed border-slate-800 rounded-xl text-slate-500 text-sm">
            No exercises in this category yet.
          </div>
        ) : (
          categoryExercises.map((ex) => (
            <Link
              key={ex.id}
              to={`/exercises/${ex.id}`}
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
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
