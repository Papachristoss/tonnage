import React, { useState } from 'react';
import { workoutService } from '../services/api';
import { X, Plus, Trash2, Dumbbell, Loader2, Save } from 'lucide-react';

export default function WorkoutModal({ isOpen, onClose, exercises, onWorkoutSaved }) {
  const [title, setTitle] = useState('Push Day');
  const [sets, setSets] = useState([
    { exerciseId: exercises[0]?.id || 1, weightKg: 80, reps: 8, rpe: 8.0 }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  if (!isOpen) return null;

  const handleAddSet = () => {
    const lastSet = sets[sets.length - 1];
    setSets([
      ...sets,
      {
        exerciseId: lastSet ? lastSet.exerciseId : (exercises[0]?.id || 1),
        weightKg: lastSet ? lastSet.weightKg : 60,
        reps: lastSet ? lastSet.reps : 8,
        rpe: 8.0
      }
    ]);
  };

  const handleRemoveSet = (index) => {
    if (sets.length === 1) return;
    setSets(sets.filter((_, i) => i !== index));
  };

  const handleSetChange = (index, field, value) => {
    const updated = [...sets];
    updated[index][field] = value;
    setSets(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (sets.length === 0) {
      setFormError('Add at least one set.');
      return;
    }

    // Format sets matching Spring Boot CreateWorkoutSessionRequest DTO
    const payload = {
      title,
      sets: sets.map((s, idx) => ({
        exerciseId: Number(s.exerciseId),
        setNumber: idx + 1,
        weightKg: parseFloat(s.weightKg),
        reps: parseInt(s.reps, 10),
        rpe: s.rpe ? parseFloat(s.rpe) : null
      }))
    };

    try {
      setSubmitting(true);
      await workoutService.create(payload);
      onWorkoutSaved();
      onClose();
    } catch (err) {
      console.error('Error logging session:', err);
      setFormError('Failed to record session. Check terminal/API logs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Dumbbell className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">Log Workout Session</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm rounded-xl">
                {formError}
              </div>
            )}

            {/* Session Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Session Routine Name
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Heavy Leg Day, Push Hypertrophy"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Dynamic Sets List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Recorded Sets ({sets.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddSet}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Another Set
                </button>
              </div>

              <div className="space-y-2.5">
                {sets.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 p-3 rounded-xl"
                  >
                    <span className="text-xs font-bold text-slate-500 w-5 text-center">
                      #{idx + 1}
                    </span>

                    {/* Exercise Select */}
                    <select
                      value={item.exerciseId}
                      onChange={(e) => handleSetChange(idx, 'exerciseId', e.target.value)}
                      className="flex-1 min-w-[140px] px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      {exercises.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.name}
                        </option>
                      ))}
                    </select>

                    {/* Weight Input */}
                    <div className="w-20">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        placeholder="kg"
                        value={item.weightKg}
                        onChange={(e) => handleSetChange(idx, 'weightKg', e.target.value)}
                        required
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white text-center focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Reps Input */}
                    <div className="w-16">
                      <input
                        type="number"
                        min="1"
                        placeholder="reps"
                        value={item.reps}
                        onChange={(e) => handleSetChange(idx, 'reps', e.target.value)}
                        required
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white text-center focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* RPE Input */}
                    <div className="w-16">
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        max="10"
                        placeholder="RPE"
                        value={item.rpe}
                        onChange={(e) => handleSetChange(idx, 'rpe', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-amber-300 text-center focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Delete Set */}
                    <button
                      type="button"
                      disabled={sets.length === 1}
                      onClick={() => handleRemoveSet(idx)}
                      className={`p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition ${
                        sets.length === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-800'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-900/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/20 transition disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Session...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Record Session
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}