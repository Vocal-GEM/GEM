import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { Button } from './button';
import Toast from './Toast';
import { CheckCircle, AlertTriangle, Info, Ghost } from 'lucide-react';

export default function LoadingSpinnerTest() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const simulateAction = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setToast({ message: 'Action completed!', type: 'success' });
    }, 2000);
  };

  return (
    <div className="p-10 space-y-10 bg-slate-900 min-h-screen text-slate-100">
      <h1 className="text-3xl font-bold text-white mb-8">
        Palette 🎨 UX Verification
      </h1>

      <section className="space-y-4">
        <h2 className="text-xl text-slate-300 border-b border-slate-700 pb-2">
          LoadingSpinner Sizes
        </h2>
        <div className="flex flex-wrap items-end gap-8">
          <div className="border border-slate-700 p-4 rounded bg-slate-800">
            <p className="text-slate-400 mb-2 text-sm">XS</p>
            <LoadingSpinner size="xs" />
          </div>
          <div className="border border-slate-700 p-4 rounded bg-slate-800">
            <p className="text-slate-400 mb-2 text-sm">SM</p>
            <LoadingSpinner size="sm" />
          </div>
          <div className="border border-slate-700 p-4 rounded bg-slate-800">
            <p className="text-slate-400 mb-2 text-sm">MD</p>
            <LoadingSpinner size="md" />
          </div>
          <div className="border border-slate-700 p-4 rounded bg-slate-800">
            <p className="text-slate-400 mb-2 text-sm">LG</p>
            <LoadingSpinner size="lg" />
          </div>
          <div className="border border-slate-700 p-4 rounded bg-slate-800">
            <p className="text-slate-400 mb-2 text-sm">XL</p>
            <LoadingSpinner size="xl" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl text-slate-300 border-b border-slate-700 pb-2">
          LoadingSpinner Variants
        </h2>
        <div className="flex items-center gap-8">
          <div className="border border-slate-700 p-4 rounded bg-slate-800">
            <p className="text-slate-400 mb-2 text-sm">Default (Slate/Blue)</p>
            <LoadingSpinner />
          </div>
          <div className="border border-slate-700 p-4 rounded bg-slate-800 text-pink-500">
            <p className="text-slate-400 mb-2 text-sm">Current (Pink Text)</p>
            <LoadingSpinner variant="current" />
          </div>
          <div className="border border-slate-700 p-4 rounded bg-slate-800 text-green-500">
            <p className="text-slate-400 mb-2 text-sm">Current (Green Text)</p>
            <LoadingSpinner variant="current" />
          </div>
          <div className="border border-slate-700 p-4 rounded bg-slate-800 bg-blue-500">
            <p className="text-white mb-2 text-sm">White</p>
            <LoadingSpinner variant="white" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl text-slate-300 border-b border-slate-700 pb-2">
          Button Integration
        </h2>
        <div className="flex flex-wrap gap-4">
          <Button onClick={simulateAction}>Default Button</Button>
          <Button isLoading>Loading Default</Button>
          <Button variant="secondary" isLoading>
            Loading Secondary
          </Button>
          <Button variant="destructive" isLoading>
            Loading Destructive
          </Button>
          <Button variant="outline" isLoading>
            Loading Outline
          </Button>
          <Button variant="ghost" isLoading>
            Loading Ghost
          </Button>
          <Button size="icon" isLoading>
            <Ghost />
          </Button>
          <Button onClick={simulateAction} isLoading={loading}>
             Click to Load
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl text-slate-300 border-b border-slate-700 pb-2">
          Toast Verification
        </h2>
        <div className="flex flex-wrap gap-4">
            <Button onClick={() => setToast({ message: 'Success Toast', type: 'success' })}>Success</Button>
            <Button onClick={() => setToast({ message: 'Error Toast', type: 'error' })} variant="destructive">Error</Button>
            <Button onClick={() => setToast({ message: 'Warning Toast', type: 'warning' })} variant="secondary">Warning</Button>
            <Button onClick={() => setToast({ message: 'Info Toast', type: 'info' })} variant="outline">Info</Button>
        </div>
      </section>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
