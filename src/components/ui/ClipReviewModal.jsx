import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Upload, Check, Share2, Download } from 'lucide-react';


const ClipReviewModal = ({ clip, onClose }) => {
    // const { user } = useAuth(); // unused
    const [isPlaying, setIsPlaying] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [shareUrl, setShareUrl] = useState(null);
    const audioRef = useRef(null);

    useEffect(() => {
        if (audioRef.current && clip) {
            audioRef.current.src = clip.url;
        }
    }, [clip]);

    const handlePlayToggle = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleEnded = () => setIsPlaying(false);

    const handleUpload = async () => {
        setUploading(true);
        try {
            const formData = new FormData();
            // Append the blob with a filename
            formData.append('file', clip.blob, `clip_${Date.now()}.ogg`);

            const token = localStorage.getItem('token');
            const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            const response = await fetch(`${BACKEND_URL}/api/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            setShareUrl(data.url);
        } catch (e) {
            console.error("Upload error:", e);
            alert("Failed to upload clip.");
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = () => {
        const a = document.createElement('a');
        a.href = clip.url;
        a.download = `gem_clip_${Date.now()}.ogg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    if (!clip) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4">Review Clip</h3>

                {/* Audio Player Visual */}
                <div className="bg-slate-800 rounded-xl p-6 mb-6 flex flex-col items-center justify-center gap-4 border border-slate-700/50">
                    <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 mb-2">
                        <Share2 size={32} />
                    </div>

                    <button
                        onClick={handlePlayToggle}
                        className="w-12 h-12 rounded-full bg-white text-slate-900 flex items-center justify-center hover:scale-105 transition-transform"
                    >
                        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                    </button>

                    <audio ref={audioRef} onEnded={handleEnded} className="hidden" />
                    <div className="text-xs text-slate-500 font-mono">
                        {Math.round(clip.blob.size / 1024)} KB • OGG/OPUS
                    </div>
                </div>

                {/* Metadata (Placeholder for now) */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Date</div>
                        <div className="text-sm font-mono text-slate-300">{new Date().toLocaleDateString()}</div>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Time</div>
                        <div className="text-sm font-mono text-slate-300">{new Date().toLocaleTimeString()}</div>
                    </div>
                </div>

                {/* Actions */}
                {shareUrl ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
                            <Check size={16} /> Upload Complete!
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={shareUrl}
                                readOnly
                                className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-slate-300 font-mono"
                            />
                            <button
                                onClick={() => navigator.clipboard.writeText(shareUrl)}
                                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs font-bold text-white transition-colors"
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-3">
                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? (
                                <>Uploading...</>
                            ) : (
                                <>
                                    <Upload size={18} /> Share Clip
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleDownload}
                            className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold flex items-center justify-center transition-colors border border-slate-700"
                            title="Download"
                        >
                            <Download size={18} />
                        </button>
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="w-full mt-3 py-3 text-slate-500 hover:text-slate-400 text-sm font-medium transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default ClipReviewModal;
