import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import { Button } from './button';
import EmptyState from './EmptyState';
import { Ghost, Plus } from 'lucide-react';

export default function LoadingSpinnerTest() {
    return (
        <div className="p-10 space-y-10 bg-slate-900 min-h-screen text-slate-100">
            <h1 className="text-2xl text-white mb-4">Palette Verification</h1>

            <section className="space-y-4">
                <h2 className="text-xl text-slate-300">LoadingSpinner Sizes</h2>
                <div className="flex items-center gap-4">
                    <div className="border border-slate-700 p-4 rounded bg-slate-800">
                        <p className="text-slate-400 mb-2">XS</p>
                        <LoadingSpinner size="xs" />
                    </div>
                    <div className="border border-slate-700 p-4 rounded bg-slate-800">
                        <p className="text-slate-400 mb-2">Small</p>
                        <LoadingSpinner size="sm" />
                    </div>
                    <div className="border border-slate-700 p-4 rounded bg-slate-800">
                        <p className="text-slate-400 mb-2">Medium</p>
                        <LoadingSpinner size="md" />
                    </div>
                    <div className="border border-slate-700 p-4 rounded bg-slate-800">
                        <p className="text-slate-400 mb-2">Large</p>
                        <LoadingSpinner size="lg" />
                    </div>
                </div>
            </section>

             <section className="space-y-4">
                <h2 className="text-xl text-slate-300">Button States</h2>
                <div className="flex items-center gap-4 flex-wrap">
                    <Button>Default Button</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                </div>
                <div className="flex items-center gap-4 flex-wrap mt-4">
                    <Button isLoading>Loading Default</Button>
                    <Button variant="secondary" isLoading>Loading Secondary</Button>
                    <Button variant="destructive" isLoading>Loading Destructive</Button>
                    <Button variant="outline" isLoading>Loading Outline</Button>
                    <Button size="icon" isLoading><Plus /></Button>
                </div>
                <div className="flex items-center gap-4 flex-wrap mt-4">
                     <Button disabled>Disabled</Button>
                     <Button variant="secondary" disabled>Disabled Secondary</Button>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl text-slate-300">Empty State</h2>
                <div className="border border-slate-700 rounded-xl overflow-hidden h-[400px] bg-slate-800">
                    <EmptyState
                        icon={Ghost}
                        title="No ghosts found"
                        description="It seems we are completely ghost-free at the moment. Try summoning one?"
                        actionLabel="Summon Ghost"
                        onAction={() => alert('Boo!')}
                    />
                </div>
            </section>
        </div>
    );
}
