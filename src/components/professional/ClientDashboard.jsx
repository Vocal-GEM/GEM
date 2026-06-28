import React, { useState } from 'react';
import { Users, UserPlus, Search, FileText, Calendar, ChevronRight, MoreVertical } from 'lucide-react';

const ClientDashboard = () => {
    const [clients, setClients] = useState([
        { id: 1, name: 'Alice Smith', status: 'Active', nextSession: '2026-01-05', goal: 'Pitch elevation', avatar: 'AS' },
        { id: 2, name: 'Bob Jones', status: 'Paused', nextSession: 'TBD', goal: 'Resonance control', avatar: 'BJ' },
        { id: 3, name: 'Charlie Day', status: 'Active', nextSession: '2026-01-07', goal: 'Vocal weight reduction', avatar: 'CD' },
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddClient = () => {
        const name = prompt("Enter client name:");
        if (name) {
            setClients([...clients, {
                id: Date.now(),
                name,
                status: 'Pending',
                nextSession: 'TBD',
                goal: 'Assessment',
                avatar: name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
            }]);
        }
    };

    return (
        <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden">
            {/* Sidebar - Client List */}
            <div className="w-80 border-r border-slate-700 flex flex-col bg-slate-800/50">
                <div className="p-4 border-b border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Users size={20} className="text-pink-500" /> Clients
                        </h2>
                        <button
                            onClick={handleAddClient}
                            className="p-1.5 bg-pink-600 hover:bg-pink-500 rounded-lg transition-colors"
                            title="Add Client"
                        >
                            <UserPlus size={18} />
                        </button>
                    </div>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search clients..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-pink-500"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredClients.map(client => (
                        <div
                            key={client.id}
                            onClick={() => setSelectedClient(client)}
                            className={`p-4 border-b border-slate-700/50 cursor-pointer hover:bg-slate-700/50 transition-colors ${selectedClient?.id === client.id ? 'bg-slate-700/80 border-l-4 border-l-pink-500' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm">
                                    {client.avatar}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium truncate">{client.name}</h3>
                                    <p className="text-xs text-slate-400 truncate">{client.goal}</p>
                                </div>
                                {client.status === 'Active' && <div className="w-2 h-2 rounded-full bg-green-500" />}
                                {client.status === 'Paused' && <div className="w-2 h-2 rounded-full bg-yellow-500" />}
                                {client.status === 'Pending' && <div className="w-2 h-2 rounded-full bg-slate-500" />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content - Client Details */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {selectedClient ? (
                    <>
                        {/* Header */}
                        <div className="h-16 border-b border-slate-700 flex items-center justify-between px-6 bg-slate-800/30">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white">
                                    {selectedClient.avatar}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">{selectedClient.name}</h2>
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <span className={`px-2 py-0.5 rounded-full ${selectedClient.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-300'}`}>
                                            {selectedClient.status}
                                        </span>
                                        <span>•</span>
                                        <span>Started Jan 2026</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="px-4 py-2 bg-pink-600 hover:bg-pink-500 rounded-lg font-medium text-sm transition-colors">Start Session</button>
                                <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors"><MoreVertical size={20} /></button>
                            </div>
                        </div>

                        {/* Content stats */}
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/50">
                                <div className="flex items-center gap-2 text-slate-400 mb-2">
                                    <Calendar size={18} /> Next Session
                                </div>
                                <div className="text-xl font-bold text-white">{selectedClient.nextSession}</div>
                            </div>

                            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/50">
                                <div className="flex items-center gap-2 text-slate-400 mb-2">
                                    <FileText size={18} /> Last Assessment
                                </div>
                                <div className="text-xl font-bold text-white">CAPE-V (Pending)</div>
                            </div>

                            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/50">
                                <div className="flex items-center gap-2 text-slate-400 mb-2">
                                    <Activity size={18} /> Progress
                                </div>
                                <div className="text-xl font-bold text-green-400">+12% Pitch</div>
                            </div>
                        </div>

                        {/* Tabs / Sections */}
                        <div className="flex-1 px-6 pb-6 overflow-y-auto">
                            <div className="bg-slate-800 rounded-xl border border-slate-700 min-h-[400px]">
                                <div className="border-b border-slate-700 p-4 flex gap-4">
                                    <button className="text-pink-400 font-medium border-b-2 border-pink-400 pb-1">Notes</button>
                                    <button className="text-slate-400 hover:text-white transition-colors pb-1">History</button>
                                    <button className="text-slate-400 hover:text-white transition-colors pb-1">Assignments</button>
                                </div>
                                <div className="p-4">
                                    <div className="mb-4">
                                        <h4 className="text-sm font-semibold text-slate-300 mb-2">Private Notes</h4>
                                        <textarea
                                            className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-300 focus:outline-none focus:border-pink-500"
                                            placeholder="Type session notes here..."
                                        />
                                    </div>
                                    <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-white transition-colors">Save Note</button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                        <Users size={48} className="mb-4 opacity-50" />
                        <p>Select a client to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientDashboard;
