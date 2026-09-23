import { Routes, Route } from 'react-router';
import { RequireAuth, GuestOnly } from './components/RouteGuards';
import AppLayout from './components/AppLayout';
import AuthPage from './pages/AuthPage';
import BodyPartsPage from './pages/BodyPartsPage';
import BodyPartPage from './pages/BodyPartPage';
import ExercisePage from './pages/ExercisePage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

// Every page has its own URL, so pages can be bookmarked, refreshed,
// and navigated with the browser's back/forward buttons.
function App() {
  return (
    <Routes>
      {/* Guests only: signed-in users are redirected into the app */}
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
      </Route>

      {/* Signed-in only: guests are redirected to /login */}
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<BodyPartsPage />} />
          <Route path="/body-parts/:categoryKey" element={<BodyPartPage />} />
          <Route path="/exercises/:exerciseId" element={<ExercisePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
