import { useState, useEffect } from 'react';
import { indexedDB } from '../../services/IndexedDBManager';
import { Database, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const MigrationModal = ({ onComplete }) => {
    const [status, setStatus] = useState('checking'); // checking, migrating, complete, error
    const [message, setMessage] = useState('Checking for data...');

    useEffect(() => {
        const checkAndMigrate = async () => {
            // Safety timeout to ensure modal doesn't stick forever
            const timeoutId = setTimeout(() => {
                console.warn('Migration check timed out, forcing completion');
                setStatus('complete');
                setMessage('Taking too long? Skipping check.');
                setTimeout(onComplete, 1000);
            }, 5000); // 5 seconds max

            try {
                const needsMigration = await indexedDB.needsMigration();
                clearTimeout(timeoutId);

                if (!needsMigration) {
                    setStatus('complete');
                    setMessage('No migration needed');
                    setTimeout(onComplete, 1000);
                    return;
                }

                setStatus('migrating');
                setMessage('Migrating your data to improved storage...');

                const success = await indexedDB.migrateFromLocalStorage();

                if (success) {
                    setStatus('complete');
                    setMessage('Migration complete! Your data is now stored more efficiently.');
                    setTimeout(onComplete, 2000);
                } else {
                    setStatus('error');
                    setMessage('Migration failed. Your data is safe in the old storage.');
                }
            } catch (error) {
                clearTimeout(timeoutId);
                console.error('Migration error:', error);
                setStatus('error');
                setMessage('An error occurred during migration.');
            }
        };

        checkAndMigrate();
    }, [onComplete]);

    if (status === 'complete' && message === 'No migration needed') {
        return null; // Don't show modal if no migration needed
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-700 shadow-2xl">
                <div className="flex flex-col items-center text-center gap-4">
                    {/* Icon */}
                    {status === 'checking' && <Loader className="w-12 h-12 text-blue-400 animate-spin" />}
                    {status === 'migrating' && <Database className="w-12 h-12 text-blue-400 animate-pulse" />}
                    {status === 'complete' && <CheckCircle className="w-12 h-12 text-emerald-400" />}
                    {status === 'error' && <AlertCircle className="w-12 h-12 text-red-400" />}

                    {/* Title */}
                    <h2 className="text-xl font-bold text-white">
                        {status === 'checking' && 'Checking Data'}
                        {status === 'migrating' && 'Upgrading Storage'}
                        {status === 'complete' && 'Success!'}
                        {status === 'error' && 'Migration Error'}
                    </h2>

                    {/* Message */}
                    <p className="text-slate-300 text-sm">
                        {message}
                    </p>

                    {/* Progress indicator for migrating */}
                    {status === 'migrating' && (
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
                        </div>
                    )}

                    {/* Error action */}
                    {status === 'error' && (
                        <button
                            onClick={onComplete}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                        >
                            Continue Anyway
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MigrationModal;
// Verified mobile fixes
