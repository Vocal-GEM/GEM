import { useState, useEffect, useRef } from 'react';
import { Shield, Download, Upload, Trash2, HardDrive, AlertTriangle, Check } from 'lucide-react';
import { exportAllData, importBackup, getDataSummary, clearAllData } from '../../services/DataBackupService';

const PrivacyDashboard = () => {
    const [dataSummary, setDataSummary] = useState(null);
    const [importStatus, setImportStatus] = useState(null);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        loadDataSummary();
    }, []);

    const loadDataSummary = () => {
        setDataSummary(getDataSummary());
    };

    const handleExport = () => {
        const result = exportAllData();
        if (result.success) {
            setImportStatus({ type: 'success', message: `Exported ${result.keysExported} data categories` });
            setTimeout(() => setImportStatus(null), 3000);
        }
    };

    const handleImport = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const result = await importBackup(file);
            setImportStatus({
                type: 'success',
                message: `Restored ${result.keysRestored} categories from ${new Date(result.backupDate).toLocaleDateString()}`
            });
            loadDataSummary();
        } catch (error) {
            setImportStatus({ type: 'error', message: error.message });
        }

        event.target.value = '';
        setTimeout(() => setImportStatus(null), 5000);
    };

    const handleClearData = () => {
        clearAllData();
        setShowClearConfirm(false);
        loadDataSummary();
        setImportStatus({ type: 'success', message: 'All data cleared successfully' });
        setTimeout(() => setImportStatus(null), 3000);
    };

    const formatBytes = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="max-w-2xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-emerald-500/20 rounded-xl">
                    <Shield className="text-emerald-400" size={28} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">Privacy & Data</h1>
                    <p className="text-slate-400">Your data is stored locally on this device</p>
                </div>
            </div>

            {/* Status Message */}
            {importStatus && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top ${importStatus.type === 'success'
                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/20 border border-red-500/30 text-red-400'
                    }`}>
                    <Check size={18} />
                    {importStatus.message}
                </div>
            )}

            {/* Data Summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
                <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                    <HardDrive size={18} className="text-slate-400" />
                    Storage Summary
                </h2>

                {dataSummary && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg">
                            <span className="text-slate-400">Total stored data</span>
                            <span className="font-bold text-white">{formatBytes(dataSummary.totalSizeBytes)}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(dataSummary.categories).map(([category, data]) => (
                                <div key={category} className="p-3 bg-slate-800/50 rounded-lg">
                                    <div className="text-sm text-white capitalize">{category}</div>
                                    <div className="text-xs text-slate-500">{formatBytes(data.sizeBytes)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Privacy Notice */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 mb-6">
                <h3 className="font-bold text-blue-400 mb-2">🔒 Your Privacy</h3>
                <ul className="text-slate-300 text-sm space-y-2">
                    <li>• All voice recordings are stored locally on your device</li>
                    <li>• No data is sent to external servers</li>
                    <li>• You have full control over your data</li>
                    <li>• Clearing browser data will remove all app data</li>
                </ul>
            </div>

            {/* Actions */}
            <div className="space-y-4">
                <button
                    onClick={handleExport}
                    className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-white font-bold flex items-center justify-center gap-2"
                >
                    <Download size={20} />
                    Export All Data
                </button>

                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-white font-bold flex items-center justify-center gap-2"
                >
                    <Upload size={20} />
                    Restore from Backup
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                />

                {!showClearConfirm ? (
                    <button
                        onClick={() => setShowClearConfirm(true)}
                        className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 font-bold flex items-center justify-center gap-2"
                    >
                        <Trash2 size={20} />
                        Clear All Data
                    </button>
                ) : (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-red-400 mb-3">
                            <AlertTriangle size={20} />
                            <span className="font-bold">Are you sure?</span>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">
                            This will permanently delete all your progress, recordings, and settings.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleClearData}
                                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg"
                            >
                                Yes, Delete Everything
                            </button>
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PrivacyDashboard;
