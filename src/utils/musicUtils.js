/**
 * Convert frequency (Hz) to musical note name
 * @param {number} frequency - Frequency in Hz
 * @returns {string} Note name (e.g., "C3", "A4", "F#5")
 */
export function frequencyToNote(frequency) {
    if (!frequency || frequency <= 0) return '—';

    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    // Calculate semitones from A4 (440 Hz)
    const semitones = 12 * Math.log2(frequency / 440);

    // A4 is note index 9 (A) in octave 4
    const noteIndex = Math.round(semitones) + 9; // 9 is A in the noteNames array
    const octave = Math.floor((noteIndex + 3) / 12) + 3; // +3 to adjust for C being start of octave
    const note = noteNames[(noteIndex % 12 + 12) % 12]; // Ensure positive modulo

    return `${note}${octave}`;
}

/**
 * Get cents deviation from nearest note
 * @param {number} frequency - Frequency in Hz
 * @returns {number} Cents deviation (-50 to +50)
 */
export function getCentsDeviation(frequency) {
    if (!frequency || frequency <= 0) return 0;

    const semitones = 12 * Math.log2(frequency / 440);
    const nearestSemitone = Math.round(semitones);
    const cents = (semitones - nearestSemitone) * 100;

    return Math.round(cents);
}
