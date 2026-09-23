// The "Log Workout" modal is opened by adding ?logWorkout to the current page's URL
// (?logWorkout=3 pre-selects exercise 3). The page stays underneath, the browser's
// Back button closes the modal, and refreshing keeps it open.
export const WORKOUT_MODAL_PARAM = 'logWorkout';

// Link props that open the modal on top of the current page
export const workoutModalLink = (pathname, exerciseId) => ({
  to: { pathname, search: exerciseId ? `?${WORKOUT_MODAL_PARAM}=${exerciseId}` : `?${WORKOUT_MODAL_PARAM}` },
  // Lets the modal know it was opened in-app, so closing can simply go "back"
  state: { openedWorkoutModal: true },
});
