import { Link } from 'react-router';
import { Loader2, ChevronLeft } from 'lucide-react';

// Small shared building blocks used across pages

export function LoadingState({ children }) {
  return (
    <div className="flex items-center justify-center h-64 text-slate-500 gap-2">
      <Loader2 className="w-5 h-5 animate-spin" /> {children}
    </div>
  );
}

export function ErrorBanner({ children }) {
  return (
    <div className="p-4 mb-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
      {children}
    </div>
  );
}

export function BackLink({ to, children }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition mb-4">
      <ChevronLeft className="w-4 h-4" /> {children}
    </Link>
  );
}
