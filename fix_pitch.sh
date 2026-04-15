sed -i 's/currentTime/globalThis.currentTime/g' src/audio/PitchWorklet.js
echo "/* global currentTime */" | cat - src/audio/PitchWorklet.js > temp && mv temp src/audio/PitchWorklet.js
