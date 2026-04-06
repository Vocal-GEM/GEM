import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import { Button } from './button';
import EmptyState from './EmptyState';
import { Ghost, Search, Plus } from 'lucide-react';

export default function LoadingSpinnerTest() {
  return (
    <div className="p-10 space-y-10 bg-slate-900 min-h-screen">
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
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl text-slate-300 border-b border-slate-700 pb-2">
          Button Integration
        </h2>
        <div className="flex flex-wrap gap-4">
          <Button>Default Button</Button>
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
            <span className="sr-only">Icon Button</span>
          </Button>
            <section className="space-y-4">
                <h2 className="text-xl text-slate-300">LoadingSpinner Sizes</h2>
                <div className="flex items-center gap-4">
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
      </section>
    </div>
  );
}
