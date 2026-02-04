/**
 * Shared AudioContext for non-realtime audio processing (e.g. decoding buffers).
 * reusing a single AudioContext prevents hitting browser limits (usually 6-10)
 * when rendering lists of audio components that need to analyze audio.
 */

let sharedAudioContext = null;

export const getSharedAudioContext = () => {
    if (!sharedAudioContext) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        sharedAudioContext = new AudioContextClass();
    }
    // Ensure context is running if it was suspended (though for decodeAudioData it typically doesn't matter)
    if (sharedAudioContext.state === 'suspended') {
        sharedAudioContext.resume().catch(() => {});
    }
    return sharedAudioContext;
};
