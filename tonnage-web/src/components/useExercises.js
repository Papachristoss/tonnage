import { useOutletContext } from 'react-router';

// Exercise list loaded once by AppLayout and shared with every page inside it:
// { exercises, loadingExercises, exercisesError, workoutsVersion }
export const useExercises = () => useOutletContext();
