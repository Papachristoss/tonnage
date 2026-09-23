import { useState } from 'react';
import { Link } from 'react-router';
import {
  Sun,
  Moon,
  Monitor,
  Scale,
  Download,
  UserCog,
  LogOut,
  Trash2,
  ChevronRight,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { profileService } from '../services/api';
import { useAuth } from '../auth/AuthContext';
import { useSignOut } from '../auth/useSignOut';
import { useSettings, useUnits } from '../settings/SettingsContext';
import { exportWorkoutsCsv } from '../settings/exportWorkouts';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

const UNIT_OPTIONS = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'lb', label: 'Pounds (lb)' },
];

function Section({ title, description, children }) {
  return (
    <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 sm:p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">{title}</h3>
      {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

// Row of mutually exclusive buttons (a radio group)
function SegmentedControl({ label, options, value, onChange }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-flow-col auto-cols-fr gap-2">
      {options.map(({ value: optionValue, label: optionLabel, icon: Icon }) => {
        const selected = optionValue === value;
        return (
          <button
            key={optionValue}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(optionValue)}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition ${
              selected
                ? 'bg-blue-600/15 border-blue-500 text-blue-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {optionLabel}
          </button>
        );
      })}
    </div>
  );
}

// Route: /settings
export default function SettingsPage() {
  const { headerProfile } = useAuth();
  const signOutAndRedirect = useSignOut();
  const { theme, setTheme, unit, setUnit } = useSettings();
  const units = useUnits();

  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState(null); // { type: 'success' | 'error', text }

  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleExport = async () => {
    setExporting(true);
    setExportMessage(null);
    try {
      const count = await exportWorkoutsCsv(units);
      setExportMessage(
        count === 0
          ? { type: 'error', text: 'Nothing to export yet - log a workout first.' }
          : { type: 'success', text: `Exported ${count} set${count === 1 ? '' : 's'}.` }
      );
    } catch {
      setExportMessage({ type: 'error', text: 'Export failed. Please try again.' });
    } finally {
      setExporting(false);
    }
  };

  const handleLogout = () => signOutAndRedirect();

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteError('');
    setDeleting(true);
    try {
      await profileService.deleteAccount(deletePassword);
      signOutAndRedirect({ notice: 'Your account and all your workouts have been deleted.' });
    } catch (err) {
      setDeleteError(typeof err.response?.data === 'string' ? err.response.data : 'Failed to delete account.');
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-white">Settings</h2>

      <Section title="Appearance" description="System follows your device's light/dark setting.">
        <SegmentedControl label="Theme" options={THEME_OPTIONS} value={theme} onChange={setTheme} />
      </Section>

      <Section title="Units" description="Used for every weight in the app. Your data is always stored in kg, so you can switch any time.">
        <SegmentedControl
          label="Weight unit"
          options={UNIT_OPTIONS.map((o) => ({ ...o, icon: Scale }))}
          value={unit}
          onChange={setUnit}
        />
      </Section>

      <Section title="Your data" description={`Download every set you've logged as a CSV file (opens in Excel, Google Sheets, Numbers). Weights are in ${units.label}.`}>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
        >
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Export workouts (CSV)
        </button>
        {exportMessage && (
          <p className={`text-xs mt-3 ${exportMessage.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {exportMessage.text}
          </p>
        )}
      </Section>

      <Section title="Account">
        <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden">
          <Link
            to="/profile"
            className="flex items-center justify-between px-4 py-3 bg-slate-900/60 hover:bg-slate-800/50 transition"
          >
            <span className="flex items-center gap-3 text-sm text-white">
              <UserCog className="w-4 h-4 text-blue-400" />
              Profile, email & password
            </span>
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 bg-slate-900/60 hover:bg-slate-800/50 text-sm text-white transition"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            Sign out
          </button>
        </div>

        {/* Danger zone */}
        <div className="mt-6 p-4 rounded-xl border border-rose-500/30 bg-rose-500/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white">Delete account</h4>
              <p className="text-xs text-slate-400 mt-1">
                Permanently deletes your account and every workout you've logged. This can't be undone -
                export your data first if you want to keep it.
              </p>

              {headerProfile.isDemo ? (
                <p className="text-xs text-amber-300 mt-3">The shared demo account can't be deleted.</p>
              ) : !showDeleteForm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteForm(true)}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs font-bold rounded-xl transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete my account…
                </button>
              ) : (
                <form onSubmit={handleDeleteAccount} className="mt-3 space-y-3">
                  <div>
                    <label htmlFor="delete-password" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Confirm with your password
                    </label>
                    <input
                      id="delete-password"
                      type="password"
                      required
                      autoFocus
                      autoComplete="current-password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className="w-full sm:w-72 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  {deleteError && <p className="text-xs text-rose-400">{deleteError}</p>}
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={deleting || !deletePassword}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-on-accent text-xs font-bold rounded-xl transition disabled:opacity-50"
                    >
                      {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      Permanently delete
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteForm(false);
                        setDeletePassword('');
                        setDeleteError('');
                      }}
                      className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
