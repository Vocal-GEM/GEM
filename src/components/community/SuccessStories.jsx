import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Heart, MessageCircle, Mic, Star } from 'lucide-react';
import CommunityService from '../../services/CommunityService';
import ModerationService from '../../services/ModerationService';

const AudioPlayerResult = ({ src, label }) => {
    const [playing, setPlaying] = useState(false);
    const audio = React.useRef(new Audio(src));

    useEffect(() => {
        const aud = audio.current;
        aud.onended = () => setPlaying(false);
        return () => aud.pause();
    }, [src]);

    const toggle = () => {
        if (playing) {
            audio.current.pause();
        } else {
            audio.current.play();
        }
        setPlaying(!playing);
    };

    return (
        <button
            onClick={toggle}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 rounded-full px-3 py-1.5 text-xs transition-colors"
        >
            {playing ? <Pause size={12} className="text-purple-400" /> : <Play size={12} className="text-purple-400" />}
            <span className="text-slate-300">{label}</span>
        </button>
    );
};

const SuccessStories = () => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [formData, setFormData] = useState({ title: '', story: '', voice_goal: 'feminine', timeline_months: 6 });

    useEffect(() => {
        loadStories();
    }, []);

    const loadStories = async () => {
        setLoading(true);
        try {
            const data = await CommunityService.getSuccessStories();
            // If empty (e.g. backend not fully populated), add specific mock data for demo
            if (!data.stories || data.stories.length === 0) {
                setStories(getMockStories());
            } else {
                setStories(data.stories);
            }
        } catch (e) {
            setStories(getMockStories());
        } finally {
            setLoading(false);
        }
    };

    const getMockStories = () => [
        {
            id: 1,
            title: "Finally found my authentic voice",
            story: "After 8 months of daily practice, I can finally speak on the phone without anxiety. The pitch monitor was a game changer for me.",
            voice_goal: "feminine",
            timeline_months: 8,
            upvotes: 42,
            before_audio: "mock_url",
            after_audio: "mock_url",
            created_at: new Date().toISOString()
        },
        {
            id: 2,
            title: "Consistency is key!",
            story: "I struggled with resonance for the longest time. Using the 'brightness' exercises really helped me unlock a cleaner sound.",
            voice_goal: "masculine",
            timeline_months: 5,
            upvotes: 28,
            created_at: new Date().toISOString()
        }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        const check = ModerationService.preCheckContent(formData.title + ' ' + formData.story);
        if (!check.safe) {
            alert('Your story contains flagged words. Please revise.');
            return;
        }

        try {
            await CommunityService.submitSuccessStory({
                ...formData,
                consent_public: true
            });
            setShowForm(false);
            alert('Story submitted for review!');
            loadStories();
        } catch (error) {
            alert('Failed to submit story');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Community Success Stories</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    {showForm ? 'Cancel' : 'Share Your Story'}
                </button>
            </div>

            {showForm && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6"
                >
                    <h3 className="text-lg font-medium text-white mb-4">Share Your Journey</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Title</label>
                            <input
                                type="text"
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500"
                                placeholder="e.g., My 6-month progress update"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Your Story</label>
                            <textarea
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white h-32 focus:ring-2 focus:ring-purple-500"
                                placeholder="Share your experience, tips, and encouragement..."
                                value={formData.story}
                                onChange={e => setFormData({ ...formData, story: e.target.value })}
                                required
                            />
                        </div>
                        <div className="flex gap-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Timeline (Months)</label>
                                <input
                                    type="number"
                                    className="w-24 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                                    value={formData.timeline_months}
                                    onChange={e => setFormData({ ...formData, timeline_months: parseInt(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Goal</label>
                                <select
                                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                                    value={formData.voice_goal}
                                    onChange={e => setFormData({ ...formData, voice_goal: e.target.value })}
                                >
                                    <option value="feminine">Feminine</option>
                                    <option value="masculine">Masculine</option>
                                    <option value="androgynous">Androgynous</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button type="submit" className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-medium">
                                Submit Story
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stories.map(story => (
                    <div key={story.id} className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-purple-500/30 transition-all">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-white font-medium text-lg leading-tight">{story.title}</h3>
                            <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full whitespace-nowrap">
                                {story.timeline_months} months
                            </span>
                        </div>

                        <p className="text-slate-400 text-sm mb-4 line-clamp-3 leading-relaxed">
                            "{story.story}"
                        </p>

                        <div className="flex items-center gap-3 mb-4">
                            {story.before_audio && <AudioPlayerResult src={story.before_audio} label="Before" />}
                            {story.after_audio && <AudioPlayerResult src={story.after_audio} label="After" />}
                        </div>

                        <div className="flex justify-between items-center text-xs text-slate-500 border-t border-slate-700/50 pt-3">
                            <span>Goal: {story.voice_goal}</span>
                            <button className="flex items-center gap-1 hover:text-pink-400 transition-colors">
                                <Heart size={14} />
                                {story.upvotes}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {stories.length === 0 && !loading && (
                <div className="text-center py-12 text-slate-500">
                    <p>No stories found yet. Be the first to share!</p>
                </div>
            )}
        </div>
    );
};

export default SuccessStories;
