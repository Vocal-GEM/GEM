import React, { useState } from 'react';
import { Download, Upload, Trash2, AlertTriangle, Check, FileJson, Eye } from 'lucide-react';
import { indexedDB } from '../../services/IndexedDBManager';
import { useSettings } from '../../context/SettingsContext';

const SettingsView = () => {
    const { settings, updateSettings } = useSettings();
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isResetting, setIsResetting] = useState(false);

    const handleExport = async () => {
        try {
            setStatus({ type: 'loading', message: 'Preparing backup...' });
            const data = await indexedDB.exportAllData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `gem_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setStatus({ type: 'success', message: 'Backup downloaded successfully!' });
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } catch (error) {
            console.error('Export failed:', error);
            setStatus({ type: 'error', message: 'Failed to export data.' });
        }
    };

    const handleImport = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!confirm('WARNING: This will overwrite your current data with the backup. Are you sure?')) {
            event.target.value = ''; // Reset input
            return;
        }

        try {
            setStatus({ type: 'loading', message: 'Restoring data...' });
            const text = await file.text();
            const data = JSON.parse(text);

            await indexedDB.importData(data);

            setStatus({ type: 'success', message: 'Data restored successfully! Reloading...' });
            setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
            console.error('Import failed:', error);
            setStatus({ type: 'error', message: 'Failed to restore data. Invalid file format.' });
        }
        event.target.value = ''; // Reset input
    };

    const handleReset = async () => {
        if (isResetting) {
            try {
                await indexedDB.factoryReset();
                window.location.reload();
            } catch (error) {
                console.error('Reset failed:', error);
                setStatus({ type: 'error', message: 'Factory reset failed.' });
            }
        } else {
            setIsResetting(true);
            setTimeout(() => setIsResetting(false), 3000); // Reset timeout
        }
    };

    return (
        <div className="w-full min-h-screen bg-slate-950 p-6 lg:p-12">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">Settings & Data</h1>

                {/* Status Message */}
                {status.message && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${status.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        status.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                        {status.type === 'success' ? <Check size={20} /> : <AlertTriangle size={20} />}
                        <span>{status.message}</span>
                    </div>
                )}

                {/* Visualization Settings */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden mb-8">
                    <div className="p-6 border-b border-slate-800">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Eye className="text-blue-400" size={24} />
                            Visualizations
                        </h2>
                        <p className="text-slate-400 mt-1">Configure how data is displayed on charts and graphs.</p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Show Norms Toggle */}
                        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                            <div>
                                <h3 className="font-bold text-white">Show Standardized Norms</h3>
                                <p className="text-sm text-slate-400">Display gender-based target zones (Masculine/Feminine/Androgynous) on charts.</p>
                            </div>
                            <button
                                onClick={() => updateSettings({ ...settings, showNorms: !settings.showNorms })}
                                className={`w-14 h-8 rounded-full transition-colors relative ${settings.showNorms ? 'bg-blue-500' : 'bg-slate-700'}`}
                                aria-label="Toggle Standardized Norms"
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${settings.showNorms ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Accessibility Section */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden mb-8">
                    <div className="p-6 border-b border-slate-800">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Eye className="text-purple-400" size={24} />
                            Accessibility
                        </h2>
                        <p className="text-slate-400 mt-1">Customize the interface for better visibility and readability.</p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* High Contrast */}
                        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                            <div>
                                <h3 className="font-bold text-white">High Contrast Mode</h3>
                                <p className="text-sm text-slate-400">Increase contrast for better visibility.</p>
                            </div>
                            <button
                                onClick={() => updateSettings({
                                    ...settings,
                                    accessibility: { ...settings.accessibility, highContrast: !settings.accessibility?.highContrast }
                                })}
                                className={`w-14 h-8 rounded-full transition-colors relative ${settings.accessibility?.highContrast ? 'bg-purple-500' : 'bg-slate-700'}`}
                                aria-label="Toggle High Contrast Mode"
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${settings.accessibility?.highContrast ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        {/* Font Size */}
                        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                            <div>
                                <h3 className="font-bold text-white">Font Size</h3>
                                <p className="text-sm text-slate-400">Adjust the text size of the application.</p>
                            </div>
                            <div className="flex gap-2">
                                {['normal', 'large', 'xl'].map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => updateSettings({
                                            ...settings,
                                            accessibility: { ...settings.accessibility, fontSize: size }
                                        })}
                                        className={`px-4 py-2 rounded-lg border transition-all ${settings.accessibility?.fontSize === size
                                            ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                            }`}
                                        aria-label={`Set font size to ${size}`}
                                    >
                                        {size === 'normal' ? 'A' : size === 'large' ? 'A+' : 'A++'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Management Section */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-800">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FileJson className="text-teal-400" size={24} />
                            Data Management
                        </h2>
                        <p className="text-slate-400 mt-1">Manage your local data, create backups, or reset the application.</p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Export */}
                        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                            <div>
                                <h3 className="font-bold text-white">Export Backup</h3>
                                <p className="text-sm text-slate-400">Download all your progress and settings as a JSON file.</p>
                            </div>
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                            >
                                <Download size={18} />
                                Export
                            </button>
                        </div>

                        {/* Import */}
                        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                            <div>
                                <h3 className="font-bold text-white">Import Backup</h3>
                                <p className="text-sm text-slate-400">Restore data from a previously exported JSON file.</p>
                            </div>
                            <label className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors cursor-pointer">
                                <Upload size={18} />
                                Import
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleImport}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {/* Factory Reset */}
                        <div className="flex items-center justify-between p-4 bg-red-500/5 rounded-xl border border-red-500/20">
                            <div>
                                <h3 className="font-bold text-red-400">Factory Reset</h3>
                                <p className="text-sm text-red-300/70">Permanently delete all data and reset the application.</p>
                            </div>
                            <button
                                onClick={handleReset}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isResetting
                                    ? 'bg-red-600 text-white animate-pulse'
                                    : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                    }`}
                            >
                                <Trash2 size={18} />
                                {isResetting ? 'Click again to confirm' : 'Reset Data'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
