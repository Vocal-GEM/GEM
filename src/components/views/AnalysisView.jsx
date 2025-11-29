onClick = {() => {
    setActiveTab(tab.id);
    if (tab.id === 'coach' && !coachFeedback) {
        generateCoachFeedback();
    }
}}
className = {`px-4 py-3 font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id
    ? 'text-blue-400 border-b-2 border-blue-400'
    : 'text-slate-400 hover:text-slate-300'
    }`}
                                >
    <tab.icon className="w-4 h-4" />
{ tab.label }
                                </button >
                            ))}
                        </div >

    {/* Tab Content */ }
    < div className = "bg-slate-900 rounded-2xl p-6 border border-slate-800 min-h-[300px]" >
        { activeTab === 'transcript' && (
            <div className="space-y-4 animate-in fade-in duration-300">
                <h3 className="font-bold text-lg mb-4">Color-Coded Transcript</h3>
                {analysisResults.words.length > 0 ? (
                    <>
                        <div className="text-lg leading-relaxed">
                            {analysisResults.words.map((word, i) => (
                                <span
                                    key={i}
                                    onClick={() => handleWordClick(word)}
                                    className={`${getWordColor(word.deviations)} cursor-pointer hover:underline transition-colors mr-2 ${currentPlayTime >= word.start && currentPlayTime <= word.end
                                        ? 'font-bold underline'
                                        : ''
                                        }`}
                                    title={`Pitch: ${word.metrics.pitch?.mean?.toFixed(1) || 'N/A'} Hz`}
                                >
                                    {word.text}
                                </span>
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="mt-6 pt-4 border-t border-slate-800">
                            <div className="text-sm text-slate-400 mb-2">Color Legend:</div>
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-green-400 rounded"></div>
                                    <span>Within target (±5%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                                    <span>Minor deviation (5-15%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-orange-400 rounded"></div>
                                    <span>Moderate deviation (15-25%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-red-400 rounded"></div>
                                    <span>Significant deviation ({'>'} 25%)</span>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-slate-400 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                        <p className="mb-2">
                            <strong>Transcript:</strong> {analysisResults.transcript}
                        </p>
                        <p className="text-sm text-slate-500 mt-4">
                            Word-level analysis is unavailable. The transcription model could not be loaded.
                            You can still view overall voice metrics in the other tabs.
                        </p>
                    </div>
                )}
            </div>
        )}

{
    activeTab === 'metrics' && (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Analysis Summary */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 shadow-lg">
                <h3 className="flex items-center gap-2 font-bold text-lg mb-3 text-white">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    Analysis Summary
                </h3>
                <p className="text-slate-300 leading-relaxed">
                    {generateAnalysisSummary(analysisResults, targetRange)}
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Pitch Metrics */}
                <MetricCard
                    label="Average Pitch"
                    value={analysisResults.overall.pitch?.mean?.toFixed(1) || 'N/A'}
                    unit="Hz"
                    status={
                        !analysisResults.overall.pitch?.mean ? 'neutral' :
                            targetRange && (analysisResults.overall.pitch.mean < targetRange.min || analysisResults.overall.pitch.mean > targetRange.max)
                                ? 'warning'
                                : 'good'
                    }
                    description="How high or low your voice sounds. Higher values are more feminine, lower values are more masculine."
                    details={targetRange ? `Target: ${targetRange.min}-${targetRange.max} Hz` : null}
                />

                {/* Formants */}
                <MetricCard
                    label="Resonance (F1/F2)"
                    value={`${analysisResults.overall.formants?.f1?.toFixed(0) || 'N/A'} / ${analysisResults.overall.formants?.f2?.toFixed(0) || 'N/A'}`}
                    unit="Hz"
                    status="neutral"
                    description="The 'brightness' or 'darkness' of your voice. Higher resonance typically sounds brighter and more feminine."
                    details="F1: Throat size / F2: Tongue position"
                />

                {/* Jitter */}
                <MetricCard
                    label="Pitch Stability (Jitter)"
                    value={analysisResults.overall.jitter?.toFixed(2) || 'N/A'}
                    unit="%"
                    status={
                        !analysisResults.overall.jitter ? 'neutral' :
                            analysisResults.overall.jitter > 1.5 ? 'bad' :
                                analysisResults.overall.jitter > 1.0 ? 'warning' : 'good'
                    }
                    description="Measures how steady your pitch is. Lower values mean a clearer voice."
                    details="Target: < 1.0%"
                />

                {/* HNR */}
                <MetricCard
                    label="Voice Quality (HNR)"
                    value={analysisResults.overall.hnr?.toFixed(1) || 'N/A'}
                    unit="dB"
                    status={
                        !analysisResults.overall.hnr ? 'neutral' :
                            analysisResults.overall.hnr < 15 ? 'warning' : 'good'
                    }
                    description="Harmonics-to-Noise Ratio. Higher values mean a clearer voice with less breathiness or hoarseness."
                    details="Target: > 15 dB"
                />

                {/* Shimmer */}
                <MetricCard
                    label="Amplitude Stability (Shimmer)"
                    value={analysisResults.overall.shimmer?.toFixed(2) || 'N/A'}
                    unit="%"
                    status={
                        !analysisResults.overall.shimmer ? 'neutral' :
                            analysisResults.overall.shimmer > 3.8 ? 'warning' : 'good'
                    }
                    description="Measures how steady your volume is. Lower values mean a more stable voice."
                    details="Target: < 3.8%"
                />

                {/* CPPS */}
                <MetricCard
                    label="Breathiness (CPPS)"
                    value={analysisResults.overall.cpps?.toFixed(1) || 'N/A'}
                    unit="dB"
                    status="neutral"
                    description="Cepstral Peak Prominence. Higher values indicate a clearer, more resonant voice."
                />

                {/* Speech Rate */}
                <MetricCard
                    label="Speech Rate"
                    value={analysisResults.overall.speechRate?.toFixed(1) || 'N/A'}
                    unit="syl/s"
                    status="neutral"
                    description="How fast you are speaking. Normal conversation is usually 3-5 syllables per second."
                />

                {/* Avg Formant */}
                <MetricCard
                    label="Avg Resonance"
                    value={analysisResults.overall.avgFormantFreq?.toFixed(0) || 'N/A'}
                    unit="Hz"
                    status="neutral"
                    description="Average of your formant frequencies. Higher average correlates with feminine perception."
                />

                {/* SPI */}
                <MetricCard
                    label="Soft Phonation (SPI)"
                    value={analysisResults.overall.spi?.toFixed(2) || 'N/A'}
                    unit=""
                    status="neutral"
                    description="Soft Phonation Index. Higher values indicate a softer, breathier voice quality."
                />

                {/* Spectral Slope */}
                <MetricCard
                    label="Spectral Slope"
                    value={analysisResults.overall.spectralSlope?.toFixed(1) || 'N/A'}
                    unit="dB/dec"
                    status="neutral"
                    description="How quickly energy drops off at higher frequencies. Steeper slope (more negative) sounds softer/flutier."
                />

                {/* Formant Mismatch Alert */}
                {analysisResults.overall.formantMismatch && (
                    <div className="col-span-full bg-yellow-500/10 border border-yellow-500/50 rounded-xl p-4 flex items-start gap-3">
                        <Info className="w-5 h-5 text-yellow-400 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-yellow-400">Resonance Mismatch Detected</h4>
                            <p className="text-sm text-yellow-200/80">
                                Your pitch is high, but your resonance (formants) is relatively low. This can sometimes sound "hollow" or unnatural. Try brightening your resonance by smiling slightly or raising your tongue.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}


{
    activeTab === 'viz' && (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Visualization Sub-Navigation */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {[
                    { id: 'pitch', label: 'Pitch & Stability' },
                    { id: 'resonance', label: 'Resonance & Vowels' },
                    { id: 'range', label: 'Voice Range' },
                    { id: 'spectrogram', label: 'Spectrogram' }
                ].map(sub => (
                    <button
                        key={sub.id}
                        onClick={() => setVizSubTab(sub.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${vizSubTab === sub.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                            }`}
                    >
                        {sub.label}
                    </button>
                ))}
            </div>

            {vizSubTab === 'pitch' && (
                <div>
                    <h3 className="font-bold text-lg mb-4">Pitch Contour</h3>
                    <PitchTrace
                        data={analysisResults.pitchSeries || []}
                        targetRange={targetRange}
                        currentTime={currentPlayTime}
                        duration={analysisResults.duration}
                    />
                </div>
            )}

            {vizSubTab === 'resonance' && (
                <div>
                    <h3 className="font-bold text-lg mb-4">Vowel Space (Resonance)</h3>
                    <VowelSpacePlot
                        f1={analysisResults.overall.formants?.f1}
                        f2={analysisResults.overall.formants?.f2}
                    />
                    <p className="text-xs text-slate-500 mt-2">
                        Shows your average resonance position relative to standard vowel targets.
                    </p>
                </div>
            )}

            {vizSubTab === 'range' && (
                <div>
                    <VoiceRangeProfile
                        isActive={isPlaying}
                        dataRef={analyzerRef} // Pass analyzer ref for live updates if needed, though we are in results mode
                        staticData={analysisResults.pitchSeries} // Pass full session data
                    />
                    <p className="text-xs text-slate-500 mt-2">
                        Phonetogram showing your pitch vs volume range. Brighter areas indicate more frequent usage.
                    </p>
                </div>
            )}

            {vizSubTab === 'spectrogram' && (
                <div>
                    <h3 className="font-bold text-lg mb-4">Spectrogram</h3>
                    <Spectrogram
                        audioRef={audioRef}
                        dataRef={analyzerRef}
                    />
                    <p className="text-xs text-slate-500 mt-2">
                        Visualizes frequency intensity over time. Play the audio to see the spectrogram scroll.
                    </p>
                </div>
            )}
        </div>
    )
}

{
    activeTab === 'coach' && (
        <div className="animate-in fade-in duration-300">
            {coachFeedback ? (
                <AssessmentView
                    feedback={coachFeedback}
                    onClose={() => setActiveTab('transcript')}
                    onPractice={(exercise) => {
                        const exerciseDetails = CoachEngine.getExerciseDetails(exercise);
                        if (exerciseDetails) {
                            showToast(`Navigate to ${exerciseDetails.route} to practice ${exercise}`, 'success');
                        } else {
                            showToast(`Starting ${exercise}...`, 'success');
                        }
                    }}
                />
            ) : (
                <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">Consulting the coach...</p>
                </div>
            )}
        </div>
    )
}
                        </div >
                    </div >
                )}
            </div >
    { toast && (
        <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
        />
    )}
        </div >
    );
};

export default AnalysisView;
