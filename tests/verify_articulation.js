
// Verification Script for Articulation Feature Logic
// Run with node

import { convertToIPA, isSibilantWord } from '../src/utils/ipaConverter.js';

// Mock VoiceAnalyzer for testing logic (since we can't easily import the class with DOM dependencies in Node)
// We'll just test the logic we added if possible, or just test the IPA converter which is pure JS.

console.log("=== Testing IPA Converter ===");

const testCases = [
    { input: "see", expected: "siː", isSibilant: true },
    { input: "she", expected: "ʃiː", isSibilant: true },
    { input: "hello", expected: "həˈləʊ", isSibilant: false },
    { input: "fish", expected: "fɪʃ", isSibilant: true },
    { input: "missing", expected: "[missing]", isSibilant: true } // "missing" not in dict, should use fallback or brackets
];

let passed = 0;
let failed = 0;

testCases.forEach(test => {
    const ipa = convertToIPA(test.input);
    const isSib = isSibilantWord(test.input);

    console.log(`Input: "${test.input}"`);
    console.log(`  IPA: ${ipa}`);
    console.log(`  Is Sibilant: ${isSib}`);

    // Simple checks
    if (isSib === test.isSibilant) {
        console.log("  [PASS] Sibilant detection");
        passed++;
    } else {
        console.log(`  [FAIL] Sibilant detection (Expected ${test.isSibilant})`);
        failed++;
    }
});

console.log(`\nResults: ${passed} Passed, ${failed} Failed`);

// Note: VoiceAnalyzer logic relies on Web Audio API which isn't available in Node environment easily.
// We will rely on manual testing for the audio analysis part.
