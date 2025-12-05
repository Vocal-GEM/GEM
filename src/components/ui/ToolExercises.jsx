import React from 'react';
import ForwardFocusDrill from './ForwardFocusDrill';
import PitchPipe from './PitchPipe';
import BreathPacer from './BreathPacer';
import WarmUpModule from './WarmUpModule';
import TwisterCard from './TwisterCard';
import PitchMatchingModule from '../modules/PitchMatchingModule';
import IntonationCurveModule from '../modules/IntonationCurveModule';

const ToolExercises = ({ tool, audioEngine }) => {
    const renderExercise = () => {
        switch (tool) {
            case 'resonance':
                return (
                    <div className="h-full">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Recommended Exercise</h3>
                        <ForwardFocusDrill onClose={() => { }} embedded={true} />
                    </div>
                );
            case 'pitch':
                return (
                    <div className="h-full">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Recommended Exercise</h3>
                        <PitchMatchingModule embedded={true} />
                    </div>
                );
            case 'contour':
                return (
                    <div className="h-full">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Recommended Exercise</h3>
                        <IntonationCurveModule embedded={true} />
                    </div>
                );
            case 'weight':
            case 'quality':
                return (
                    <div className="h-full">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Recommended Exercise</h3>
                        <BreathPacer embedded={true} />
                    </div>
                );
            case 'tilt':
                return (
                    <div className="h-full">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Recommended Exercise</h3>
                        <WarmUpModule embedded={true} />
                    </div>
                );
            case 'vowel':
            case 'articulation':
                return (
                    <div className="h-full">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Recommended Exercise</h3>
                        <TwisterCard
                            twister={{
                                title: 'Vowel Clarity',
                                difficulty: 'Medium',
                                text: 'The rain in Spain stays mainly in the plain.'
                            }}
                            onRecord={() => { }}
                            isRecording={false}
                            score={null}
                            embedded={true}
                        />
                    </div>
                );
            case 'spectrogram':
                return (
                    <div className="h-full">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Recommended Exercise</h3>
                        <PitchPipe audioEngine={audioEngine} embedded={true} />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="mt-6 pt-6 border-t border-white/5">
            {renderExercise()}
        </div>
    );
};

export default ToolExercises;
