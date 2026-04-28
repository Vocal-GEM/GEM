#!/bin/bash
sed -i 's/\/\* global sampleRate, currentTime \*\//\/\* global sampleRate \*\//g' src/audio/PitchWorklet.js
sed -i '6i \/\* global currentTime, sampleRate \*\/' src/audio/PitchWorklet.js

npm run lint:ci | grep -n "error "
