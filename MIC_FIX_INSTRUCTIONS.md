# Fix: Lower Noise Gate Threshold in resonance-processor.js

The issue is that the adaptive noise gate threshold is too high (0.005). 

## Manual Fix Required

Edit `public/resonance-processor.js` and find lines 117 and 122:

```javascript
this.threshold = 0.005; // Initial threshold, will adapt
...
this.adaptiveThreshold = 0.005;
```

Change both values to `0.0001`:

```javascript
this.threshold = 0.0001; // Initial threshold - LOWERED for better mic sensitivity
...
this.adaptiveThreshold = 0.0001; //  LOWEREDfor better mic sensitivity
```

This will make the processor much more sensitive to microphone input and should fix the "0% volume" issue you're seeing on Vercel.

After making this change,push to Vercel and test again.
