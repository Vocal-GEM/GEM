import React, { useState, useEffect } from 'react';
import MentorMatcher from '../../services/MentorMatcher';
import { User, Star, Clock, MessageSquare, CheckCircle } from 'lucide-react';

const MentorFinder = () => {
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [connections, setConnections] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Mock profile request - in real app would come from context
            const profile = { goals: { voiceType: 'feminine' } };
            const [mentorList, connList] = await Promise.all([
                MentorMatcher.findMentors(profile),
                MentorMatcher.getConnections()
            ]);
            setMentors(mentorList);
            setConnections(connList.sent || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (mentorId) => {
        try {
            await MentorMatcher.requestConnection(mentorId, "Hi, I'd like to connect!");
            // Optimistic update
            setConnections([...connections, { connection_id: mentorId, status: 'pending' }]);
            alert('Request sent!');
        } catch (e) {
            alert('Failed to send request');
        }
    };

    const isPending = (id) => connections.some(c => c.connection_id === id && c.status === 'pending');
    const isConnected = (id) => connections.some(c => c.connection_id === id && c.status === 'accepted');

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-white">Find a Mentor</h2>
                <p className="text-sm text-slate-400">Connect with experienced users who have achieved similar goals.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mentors.map(mentor => (
                    <div key={mentor.id} className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-purple-900/50 rounded-full flex items-center justify-center text-purple-300 font-bold border border-purple-500/30">
                                    {mentor.displayName.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">{mentor.displayName}</h3>
                                    <div className="flex items-center gap-1 text-xs text-yellow-500">
                                        <Star size={12} fill="currentColor" />
                                        <span>{mentor.yearsExperience}y exp</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-xs px-2 py-1 rounded-full border ${mentor.matchScore > 0.9 ? 'border-green-500 text-green-400 bg-green-900/20' : 'border-blue-500 text-blue-400 bg-blue-900/20'
                                    }`}>
                                    {Math.round(mentor.matchScore * 100)}% Match
                                </span>
                            </div>
                        </div>

                        <p className="text-slate-400 text-sm">{mentor.bio}</p>

                        <div className="flex gap-2 text-xs text-slate-500 mt-1">
                            <span className="bg-slate-700 px-2 py-0.5 rounded">Range: {mentor.startingPitch}Hz → {mentor.currentPitch}Hz</span>
                            <span className="bg-slate-700 px-2 py-0.5 rounded">TimeZone: GMT{mentor.timezone > 0 ? '+' : ''}{mentor.timezone}</span>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-700/50 flex justify-end">
                            {isConnected(mentor.id) ? (
                                <button disabled className="flex items-center gap-2 text-green-400 text-sm px-4 py-2 bg-slate-900/50 rounded-lg opacity-80">
                                    <CheckCircle size={16} /> Connected
                                </button>
                            ) : isPending(mentor.id) ? (
                                <button disabled className="flex items-center gap-2 text-slate-400 text-sm px-4 py-2 bg-slate-900/50 rounded-lg">
                                    <Clock size={16} /> Pending
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleConnect(mentor.id)}
                                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm px-4 py-2 rounded-lg transition-all shadow-lg shadow-purple-900/20 font-medium"
                                >
                                    <MessageSquare size={16} /> Connect
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {mentors.length === 0 && !loading && (
                <div className="p-8 text-center text-slate-500">No mentors found matching your criteria.</div>
            )}
        </div>
    );
};

export default MentorFinder;
