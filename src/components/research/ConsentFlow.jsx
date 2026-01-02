
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ConsentFlow = ({ study, onComplete, onCancel }) => {
    const [step, setStep] = useState(0);
    const [signature, setSignature] = useState('');
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const [agreed, setAgreed] = useState(false);

    const sections = [
        {
            title: "Purpose of the Study",
            content: study.description || "This study aims to understand vocal development trends..."
        },
        {
            title: "Procedures",
            content: "If you agree to participate, we will collect anonymized audio features from your practice sessions. No raw audio recordings will be shared with researchers without explicit permission for each clip."
        },
        {
            title: "Risks and Benefits",
            content: "There are no known physical risks. Benefits include contributing to scientific understanding of voice training. You will not receive direct compensation."
        },
        {
            title: "Confidentiality",
            content: "Your data will be de-identified. Your name will not be linked to the data in the research database. We use strict encryption and access controls."
        },
        {
            title: "Voluntary Participation",
            content: "Participation is completely voluntary. You may withdraw at any time without penalty by going to Settings > Research Participation."
        }
    ];

    const handleScroll = (e) => {
        const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
        if (bottom) {
            setHasScrolledToBottom(true);
        }
    };

    const handleSign = () => {
        if (signature.length > 3 && agreed) {
            onComplete({
                fullName: signature,
                timestamp: new Date().toISOString(),
                UserAgent: navigator.userAgent
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-gray-800">
                    <h2 className="text-2xl font-bold text-white">Research Informed Consent</h2>
                    <p className="text-gray-400 text-sm mt-1">Study: {study.title}</p>
                </div>

                <div
                    className="flex-1 overflow-y-auto p-6 space-y-8 text-gray-300 custom-scrollbar"
                    onScroll={handleScroll}
                >
                    {sections.map((section, idx) => (
                        <section key={idx}>
                            <h3 className="text-lg font-semibold text-white mb-2">{section.title}</h3>
                            <p className="leading-relaxed">{section.content}</p>
                        </section>
                    ))}
                </div>

                <div className="p-6 border-t border-gray-800 bg-gray-900 bg-opacity-95">
                    <div className="space-y-4">
                        <label className="flex items-start space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                disabled={!hasScrolledToBottom}
                            />
                            <span className={`text-sm ${!hasScrolledToBottom ? 'text-gray-500' : 'text-gray-300'}`}>
                                I have read the entire consent document and understand my rights as a participant.
                                {!hasScrolledToBottom && " (Please scroll to bottom to enable)"}
                            </span>
                        </label>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                Electronic Signature (Type Full Name)
                            </label>
                            <input
                                type="text"
                                value={signature}
                                onChange={(e) => setSignature(e.target.value)}
                                placeholder="e.g. Jane Doe"
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-600"
                            />
                        </div>

                        <div className="flex space-x-4 pt-2">
                            <button
                                onClick={onCancel}
                                className="flex-1 py-3 px-6 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors"
                            >
                                Decline
                            </button>
                            <button
                                onClick={handleSign}
                                disabled={!agreed || signature.length < 3}
                                className={`flex-1 py-3 px-6 rounded-lg font-bold text-white transition-all
                  ${(!agreed || signature.length < 3)
                                        ? 'bg-gray-700 cursor-not-allowed opacity-50'
                                        : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg hover:shadow-indigo-500/25'}`}
                            >
                                Sign & Enroll
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConsentFlow;
