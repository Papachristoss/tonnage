import { Link } from 'react-router';

// Route: * (also rendered by pages when their URL points at something that doesn't exist)
export default function NotFoundPage() {
  return (
    <div className="text-center py-20">
      <div className="text-5xl font-black text-slate-700 mb-3">404</div>
      <h2 className="text-lg font-bold text-white mb-2">Page not found</h2>
      <p className="text-sm text-slate-400 mb-6">This page doesn't exist or may have been moved.</p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-on-accent text-xs font-bold px-4 py-2 rounded-xl transition"
      >
        Back to home
      </Link>
    </div>
  );
}
