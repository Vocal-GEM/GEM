/**
 * ExportPanel.jsx
 * 
 * UI panel for exporting data in various formats.
 */

import { useState } from 'react';
import {
    Download, FileText, Database, CheckCircle,
    X, ChevronRight, Loader
} from 'lucide-react';
import DataExportService from '../../services/DataExportService';

const ExportPanel = ({ onClose }) => {
    const [exportOptions] = useState(DataExportService.getExportOptions());
    const [exporting, setExporting] = useState(null);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    const handleExport = async (option) => {
        setExporting(option.id);
        setSuccess(null);
        setError(null);

        try {
            const result = await option.action();
            if (result.success) {
                setSuccess(option.id);
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(result.error || 'Export failed');
            }
        } catch (err) {
            setError(err.message || 'Export failed');
        } finally {
            setExporting(null);
        }
    };

    const getFormatColor = (format) => {
        switch (format) {
            case 'CSV': return 'bg-emerald-500/20 text-emerald-400';
            case 'JSON': return 'bg-blue-500/20 text-blue-400';
            case 'PDF': return 'bg-red-500/20 text-red-400';
            case 'TXT': return 'bg-amber-500/20 text-amber-400';
            default: return 'bg-slate-500/20 text-slate-400';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                            <Download className="text-blue-400" size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-white">Export Data</h2>
                            <p className="text-xs text-slate-400">Download your progress</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Export Options */}
                <div className="p-4 space-y-3">
                    {exportOptions.map(option => (
                        <button
                            key={option.id}
                            onClick={() => handleExport(option)}
                            disabled={exporting === option.id}
                            className="w-full p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/50 rounded-xl text-left transition-all group disabled:opacity-50"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{option.icon}</span>
                                    <div>
                                        <div className="font-bold text-white flex items-center gap-2">
                                            {option.title}
                                            <span className={`px-2 py-0.5 rounded text-xs ${getFormatColor(option.format)}`}>
                                                {option.format}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-400">{option.description}</div>
                                    </div>
                                </div>
                                <div className="text-slate-500 group-hover:text-blue-400 transition-colors">
                                    {exporting === option.id ? (
                                        <Loader size={20} className="animate-spin" />
                                    ) : success === option.id ? (
                                        <CheckCircle size={20} className="text-emerald-400" />
                                    ) : (
                                        <ChevronRight size={20} />
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Error display */}
                {error && (
                    <div className="mx-4 mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
                        {error}
                    </div>
                )}

                {/* Footer */}
                <div className="p-4 border-t border-slate-800 text-center text-xs text-slate-500">
                    Your data is stored locally and never shared
                </div>
            </div>
        </div>
    );
};

export default ExportPanel;
