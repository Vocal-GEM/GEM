import { useState } from 'react';
import { AlertTriangle, X, Info } from 'lucide-react';

/**
 * Content Warning Component 
 * Displays before potentially dysphoria-triggering content
 */
const ContentWarning = ({
    title = 'Content Notice',
    message = 'This feature may show information that could trigger dysphoria for some users.',
    onProceed,
    onCancel,
    proceedLabel = 'I understand, continue',
    cancelLabel = 'Go back'
}) => {
    const [dontShowAgain, setDontShowAgain] = useState(false);

    const handleProceed = () => {
        if (dontShowAgain) {
            // Store preference
            const dismissed = JSON.parse(localStorage.getItem('gem_content_warnings_dismissed') || '[]');
            dismissed.push(title);
            localStorage.setItem('gem_content_warnings_dismissed', JSON.stringify(dismissed));
        }
        onProceed?.();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in">
            <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-md w-full p-6 animate-in zoom-in-95">
                <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-amber-500/20 rounded-xl flex-shrink-0">
                        <AlertTriangle className="text-amber-400" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
                        <p className="text-slate-400 text-sm">{message}</p>
                    </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-2 text-sm text-amber-200/80">
                        <Info size={16} className="flex-shrink-0 mt-0.5" />
                        <p>
                            This app is a tool for exploration. Remember: there is no &quot;wrong&quot; voice.
                            Your comfort and wellbeing come first.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-6">
                    <input
                        type="checkbox"
                        id="dontShow"
                        checked={dontShowAgain}
                        onChange={(e) => setDontShowAgain(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500"
                    />
                    <label htmlFor="dontShow" className="text-sm text-slate-400">
                        Don&apos;t show this again
                    </label>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleProceed}
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl"
                    >
                        {proceedLabel}
                    </button>
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl"
                        >
                            {cancelLabel}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContentWarning;
