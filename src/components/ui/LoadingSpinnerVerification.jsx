import React from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function LoadingSpinnerTest() {
  return (
    <div className="p-10 space-y-10 bg-slate-900 min-h-screen text-slate-100">
      <h1 className="text-3xl font-bold text-white mb-8">
        Palette UX Verification
      </h1>
      <LoadingSpinner size="xs" />
    </div>
  );
}
