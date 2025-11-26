import React, { useState } from 'react';
import { useClient } from '../../context/ClientContext';
import { Users, Plus, Trash2, User, ChevronDown, X } from 'lucide-react';

const ClientSelector = () => {
    const { clients, activeClient, setActiveClient, addClient, deleteClient } = useClient();
    const [isOpen, setIsOpen] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newClientName, setNewClientName] = useState('');
    const [newClientGoals, setNewClientGoals] = useState('');

    const handleAddClient = async (e) => {
        e.preventDefault();
        if (!newClientName.trim()) return;

        const newClient = await addClient({
            name: newClientName,
            goals: newClientGoals,
            notes: '',
            sessionCount: 0
        });

        setActiveClient(newClient);
        setNewClientName('');
        setNewClientGoals('');
        setShowAddModal(false);
        setIsOpen(false);
    };

    const handleDeleteClient = (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this client? This cannot be undone.')) {
            deleteClient(id);
        }
    };

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
            >
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <User size={16} />
                </div>
                <div className="text-left mr-2">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Current Client</div>
                    <div className="text-sm font-bold text-white truncate max-w-[120px]">
                        {activeClient ? activeClient.name : 'Select Client...'}
                    </div>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute top-full left-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-2 max-h-64 overflow-y-auto space-y-1">
                            {clients.length === 0 && (
                                <div className="text-center py-4 text-slate-500 text-sm">No clients yet</div>
                            )}
                            {clients.map(client => (
                                <div
                                    key={client.id}
                                    onClick={() => { setActiveClient(client); setIsOpen(false); }}
                                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer group transition-colors ${activeClient?.id === client.id ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-slate-800'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${activeClient?.id === client.id ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                                            {client.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className={`font-bold ${activeClient?.id === client.id ? 'text-blue-400' : 'text-slate-200'}`}>{client.name}</div>
                                            <div className="text-[10px] text-slate-500">{new Date(client.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => handleDeleteClient(e, client.id)}
                                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="p-2 border-t border-slate-800 bg-slate-900/50">
                            <button
                                onClick={() => { setShowAddModal(true); setIsOpen(false); }}
                                className="w-full py-2 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-colors"
                            >
                                <Plus size={16} />
                                Add New Client
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Add Client Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Users className="text-blue-400" />
                                Add New Client
                            </h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleAddClient} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-1">Client Name / ID</label>
                                <input
                                    type="text"
                                    value={newClientName}
                                    onChange={(e) => setNewClientName(e.target.value)}
                                    placeholder="e.g. Alex M."
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-1">Primary Goals</label>
                                <textarea
                                    value={newClientGoals}
                                    onChange={(e) => setNewClientGoals(e.target.value)}
                                    placeholder="e.g. Raise pitch floor, reduce vocal weight..."
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-colors h-24 resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newClientName.trim()}
                                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
                                >
                                    Create Profile
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientSelector;
