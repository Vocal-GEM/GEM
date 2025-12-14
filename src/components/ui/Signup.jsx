import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Signup = ({ onSwitchToLogin, onClose }) => {
    const { signup } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirm) {
            setError("Passwords don't match");
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await signup(username, password);
            if (result.success) {
                onClose();
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Signup failed. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Create Account</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X /></button>
                </div>

                {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none transition-colors"
                            placeholder="Choose a username"
                            required
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            3-30 characters: letters, numbers, and underscores only
                        </p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none transition-colors"
                            placeholder="••••••••"
                            required
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Min 8 characters with at least one letter and one number
                        </p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Confirm Password</label>
                        <input
                            type="password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none transition-colors"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-400">
                    Already have an account? <button onClick={onSwitchToLogin} className="text-blue-400 hover:text-blue-300 font-bold">Log In</button>
                </div>
            </div>
        </div>
    );
};

export default Signup;
