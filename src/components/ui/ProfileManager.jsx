import { useState } from 'react';
import { User, Plus, Check, X } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';

const ProfileManager = ({ onClose }) => {
    const { profiles, activeProfileId, createProfile, switchProfile, deleteProfile } = useProfile();
    const [isCreating, setIsCreating] = useState(false);
    const [newProfileName, setNewProfileName] = useState('');

    const handleCreate = (e) => {
        e.preventDefault();
        if (newProfileName.trim()) {
            createProfile(newProfileName.trim());
            setNewProfileName('');
            setIsCreating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <User className="text-blue-400" />
                        Select Profile
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
                    {profiles.map(profile => (
                        <div
                            key={profile.id}
                            onClick={() => switchProfile(profile.id)}
                            className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${activeProfileId === profile.id
                                ? 'bg-blue-600/20 border-blue-500/50 border'
                                : 'bg-slate-800/50 border-transparent border hover:bg-slate-800'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${activeProfileId === profile.id ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
                                    }`}>
                                    {profile.name[0].toUpperCase()}
                                </div>
                                <div>
                                    <div className={`font-bold ${activeProfileId === profile.id ? 'text-white' : 'text-slate-300'}`}>
                                        {profile.name}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {activeProfileId === profile.id ? 'Active Now' : 'Last active recently'}
                                    </div>
                                </div>
                            </div>

                            {activeProfileId === profile.id && <Check className="text-blue-400" size={20} />}
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                    {isCreating ? (
                        <form onSubmit={handleCreate} className="flex gap-2">
                            <input
                                autoFocus
                                type="text"
                                value={newProfileName}
                                onChange={(e) => setNewProfileName(e.target.value)}
                                placeholder="Profile Name"
                                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            />
                            <button
                                type="submit"
                                disabled={!newProfileName.trim()}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold disabled:opacity-50"
                            >
                                Add
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="text-slate-400 hover:text-white px-2"
                            >
                                <X size={20} />
                            </button>
                        </form>
                    ) : (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="w-full py-3 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800/50 transition-all flex items-center justify-center gap-2 font-bold"
                        >
                            <Plus size={20} />
                            Create New Profile
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileManager;
