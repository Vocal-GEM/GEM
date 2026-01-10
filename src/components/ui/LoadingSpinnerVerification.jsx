import React from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function LoadingSpinnerTest() {
    return (
        <div className="p-10 space-y-10 bg-slate-900 min-h-screen">
            <h1 className="text-2xl text-white mb-4">LoadingSpinner Verification</h1>

            <section className="space-y-4">
                <h2 className="text-xl text-slate-300">Sizes</h2>
                <div className="flex items-center gap-4">
                    <div className="border border-slate-700 p-4 rounded">
                        <p className="text-slate-400 mb-2">Small</p>
                        <LoadingSpinner size="sm" />
                    </div>
                    <div className="border border-slate-700 p-4 rounded">
                        <p className="text-slate-400 mb-2">Medium</p>
                        <LoadingSpinner size="md" />
                    </div>
                    <div className="border border-slate-700 p-4 rounded">
                        <p className="text-slate-400 mb-2">Large</p>
                        <LoadingSpinner size="lg" />
                    </div>
                    <div className="border border-slate-700 p-4 rounded">
                        <p className="text-slate-400 mb-2">X-Large</p>
                        <LoadingSpinner size="xl" />
                    </div>
                </div>
            </section>

             <section className="space-y-4">
                <h2 className="text-xl text-slate-300">Custom Class (Pink border)</h2>
                <div className="border border-slate-700 p-4 rounded">
                    <LoadingSpinner className="border-pink-500" />
                </div>
            </section>
        </div>
    );
}
