import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { profileService } from '../services/api';
import { useAuth } from '../auth/AuthContext';
import { useSignOut } from '../auth/useSignOut';
import { useUnits } from '../settings/SettingsContext';
import {
  ChevronLeft,
  User as UserIcon,
  Camera,
  Trash2,
  Loader2,
  Save,
  Award,
  Flame,
  Calendar,
  Dumbbell,
  LogOut,
  Check
} from 'lucide-react';

const MAX_AVATAR_DIMENSION = 300;

function resizeImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not read image.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > height) {
          if (width > MAX_AVATAR_DIMENSION) {
            height = Math.round((height * MAX_AVATAR_DIMENSION) / width);
            width = MAX_AVATAR_DIMENSION;
          }
        } else {
          if (height > MAX_AVATAR_DIMENSION) {
            width = Math.round((width * MAX_AVATAR_DIMENSION) / height);
            height = MAX_AVATAR_DIMENSION;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Route: /profile
export default function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, updateHeaderProfile } = useAuth();
  const signOutAndRedirect = useSignOut();
  const { label: unitLabel, fromKg, toKg } = useUnits();

  // Go back where the user came from; if they opened /profile directly, go home
  const onBack = () => (location.key !== 'default' ? navigate(-1) : navigate('/'));
  const onLogout = () => signOutAndRedirect();
  // Keep the header's username/avatar in sync with edits made here
  const onProfileUpdated = updateHeaderProfile;
  // The JWT subject is the email, so an email change comes with a fresh token to store
  const onEmailChanged = signIn;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const fileInputRef = useRef(null);

  // Basic info form
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [bodyweight, setBodyweight] = useState(''); // in the user's display unit (kg or lb)
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoError, setInfoError] = useState('');
  const [infoSuccess, setInfoSuccess] = useState(false);

  // Avatar
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  // Email form
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    profileService
      .get()
      .then((data) => {
        setProfile(data);
        setUsername(data.username || '');
        setAge(data.age ?? '');
        setBodyweight(fromKg(data.weightKg) ?? '');
        setNewEmail(data.email || '');
      })
      .catch(() => setLoadError('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, [fromKg]);

  // Bodyweight to send in kg. If the field wasn't edited, send the stored value as-is,
  // so a kg -> lb -> kg round trip doesn't nudge it (82 kg -> 180.8 lb -> 82.01 kg).
  const bodyweightKgForSave = () => {
    if (bodyweight === '') return null;
    if (String(bodyweight) === String(fromKg(profile.weightKg))) return profile.weightKg;
    return toKg(bodyweight);
  };

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setInfoError('');
    setInfoSuccess(false);
    setSavingInfo(true);
    try {
      const updated = await profileService.update({
        username: username.trim() || null,
        age: age === '' ? null : parseInt(age, 10),
        weightKg: bodyweightKgForSave(),
      });
      setProfile(updated);
      setInfoSuccess(true);
      onProfileUpdated({ username: updated.username, profilePicture: updated.profilePicture });
      setTimeout(() => setInfoSuccess(false), 2500);
    } catch (err) {
      setInfoError(err.response?.data || 'Failed to update profile.');
    } finally {
      setSavingInfo(false);
    }
  };

  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError('');
    setAvatarUploading(true);
    try {
      const base64 = await resizeImageToBase64(file);
      const updated = await profileService.updateAvatar(base64);
      setProfile(updated);
      onProfileUpdated({ username: updated.username, profilePicture: updated.profilePicture });
    } catch (err) {
      setAvatarError(err.response?.data || 'Failed to upload image.');
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarError('');
    setAvatarUploading(true);
    try {
      const updated = await profileService.removeAvatar();
      setProfile(updated);
      onProfileUpdated({ username: updated.username, profilePicture: null });
    } catch {
      setAvatarError('Failed to remove image.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess(false);

    if (!newEmail.trim() || !emailPassword) {
      setEmailError('Please fill in both fields.');
      return;
    }

    setSavingEmail(true);
    try {
      const response = await profileService.changeEmail(newEmail.trim(), emailPassword);
      setProfile((prev) => ({ ...prev, email: response.email }));
      setEmailPassword('');
      setEmailSuccess(true);
      onEmailChanged(response.token, response.email);
      setTimeout(() => setEmailSuccess(false), 2500);
    } catch (err) {
      setEmailError(err.response?.data || 'Failed to update email.');
    } finally {
      setSavingEmail(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword || !newPassword) {
      setPasswordError('Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      await profileService.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 2500);
    } catch (err) {
      setPasswordError(err.response?.data || 'Failed to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading profile...
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
        {loadError || 'Something went wrong.'}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition mb-4"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div className="space-y-6">
        {profile.demo && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
            This is a shared demo account, so profile changes are disabled here. Register your own account to edit your profile.
          </div>
        )}

        {/* Avatar + Identity Card */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden">
                {profile.profilePicture ? (
                  <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-10 h-10 text-slate-500" />
                )}
                {avatarUploading && (
                  <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading || profile.demo}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Camera className="w-3.5 h-3.5" /> Change
                </button>
                {profile.profilePicture && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={avatarUploading || profile.demo}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-400 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarSelect}
                disabled={profile.demo}
                className="hidden"
              />
              {avatarError && <p className="text-xs text-rose-400 text-center">{avatarError}</p>}
            </div>

            <form onSubmit={handleSaveInfo} className="flex-1 w-full space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Pick a display name"
                    disabled={profile.demo}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 28"
                    disabled={profile.demo}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Weight ({unitLabel})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={bodyweight}
                    onChange={(e) => setBodyweight(e.target.value)}
                    placeholder={unitLabel === 'lb' ? 'e.g. 180' : 'e.g. 82'}
                    disabled={profile.demo}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {infoError && <p className="text-xs text-rose-400">{infoError}</p>}

              <button
                type="submit"
                disabled={savingInfo || profile.demo}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-on-accent text-xs font-bold rounded-xl transition"
              >
                {savingInfo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : infoSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                {infoSuccess ? 'Saved' : 'Save changes'}
              </button>
            </form>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 sm:p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
            Your Stats
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                Member For
              </div>
              <div className="text-xl font-black text-white">
                {profile.memberDays} <span className="text-sm font-normal text-slate-400">days</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <Flame className="w-4 h-4 text-orange-400" />
                Total Tonnage
              </div>
              <div className="text-xl font-black text-white">
                {Math.round(fromKg(profile.totalTonnageKg)).toLocaleString()} <span className="text-sm font-normal text-slate-400">{unitLabel}</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <Dumbbell className="w-4 h-4 text-emerald-400" />
                Workouts Logged
              </div>
              <div className="text-xl font-black text-white">
                {profile.totalWorkouts}
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <Award className="w-4 h-4 text-amber-400" />
                Bodyweight Lifted
              </div>
              <div className="text-xl font-black text-white">
                {profile.bodyweightMultiple != null ? (
                  <>x{profile.bodyweightMultiple.toFixed(1)}</>
                ) : (
                  <span className="text-sm font-normal text-slate-500">Set weight</span>
                )}
              </div>
            </div>
          </div>

          {profile.mostTrainedMuscleGroup && (
            <p className="text-sm text-slate-400 mt-4">
              You've trained <span className="text-white font-semibold">{profile.mostTrainedMuscleGroup}</span> the most.
            </p>
          )}
        </div>

        {/* Change Email Card */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 sm:p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
            Change Email
          </h3>
          <form onSubmit={handleChangeEmail} className="space-y-3 max-w-sm">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                New Email
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={profile.demo}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                placeholder="Confirm with your current password"
                disabled={profile.demo}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            {emailError && <p className="text-xs text-rose-400">{emailError}</p>}
            <button
              type="submit"
              disabled={savingEmail || profile.demo}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition"
            >
              {savingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : emailSuccess ? <Check className="w-3.5 h-3.5" /> : null}
              {emailSuccess ? 'Email updated' : 'Update email'}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 sm:p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
            Change Password
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-3 max-w-sm">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={profile.demo}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                disabled={profile.demo}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={profile.demo}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            {passwordError && <p className="text-xs text-rose-400">{passwordError}</p>}
            <button
              type="submit"
              disabled={savingPassword || profile.demo}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition"
            >
              {savingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : passwordSuccess ? <Check className="w-3.5 h-3.5" /> : null}
              {passwordSuccess ? 'Password updated' : 'Update password'}
            </button>
          </form>
        </div>

        {/* Logout */}
        <div className="flex justify-end">
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-rose-400 transition"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </div>
    </div>
  );
}