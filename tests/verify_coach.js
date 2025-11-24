import { CoachEngine } from '../src/utils/coachEngine.js';

// Mock Analysis Results
const mockResults = {
    overall: {
        pitch: { mean: 150 },
        formants: { f1: 320, f2: 1500 },
        jitter: 0.5,
        shimmer: 0.2
    }
};

// Test Case 1: Feminine Goal, Low Pitch (Should fail pitch)
const test1 = CoachEngine.generateFeedback(mockResults, {
    targetPitch: { min: 180, max: 220 },
    gender: 'feminine'
});

console.log("--- Test 1: Fem Goal, Low Pitch ---");
console.log("Summary:", test1.summary);
console.log("Focus:", test1.focusArea.title);
console.log("Pitch Status:", test1.details.pitch.status);

// Test Case 2: Masculine Goal, Bright Resonance (Should fail resonance)
const mockResults2 = {
    overall: {
        pitch: { mean: 110 },
        formants: { f1: 450, f2: 1800 }, // Bright
        jitter: 0.5
    }
};

const test2 = CoachEngine.generateFeedback(mockResults2, {
    targetPitch: { min: 80, max: 130 },
    gender: 'masculine'
});

console.log("\n--- Test 2: Masc Goal, Bright Resonance ---");
console.log("Summary:", test2.summary);
console.log("Focus:", test2.focusArea.title);
console.log("Resonance Status:", test2.details.resonance.status);

// Test Case 3: Perfect Match
const mockResults3 = {
    overall: {
        pitch: { mean: 200 },
        formants: { f1: 450, f2: 2000 },
        jitter: 0.2
    }
};

const test3 = CoachEngine.generateFeedback(mockResults3, {
    targetPitch: { min: 180, max: 220 },
    gender: 'feminine'
});

console.log("\n--- Test 3: Perfect Match ---");
console.log("Summary:", test3.summary);
console.log("Focus:", test3.focusArea.title);
