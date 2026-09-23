// Category definitions: each maps to one or more muscleGroup values from the backend.
// `key` is used in the URL: /body-parts/:key
export const CATEGORIES = [
  { key: 'chest', label: 'Chest', match: ['Chest'] },
  { key: 'back', label: 'Back', match: ['Back'] },
  { key: 'arms-shoulders', label: 'Arms & Shoulders', match: ['Arms', 'Shoulders'] },
  { key: 'legs', label: 'Legs', match: ['Legs'] },
];

export const findCategoryByKey = (key) => CATEGORIES.find((cat) => cat.key === key) || null;

export const findCategoryForMuscleGroup = (muscleGroup) =>
  CATEGORIES.find((cat) => cat.match.includes(muscleGroup)) || null;

export const exercisesInCategory = (exercises, category) =>
  exercises.filter((ex) => category.match.includes(ex.muscleGroup));
