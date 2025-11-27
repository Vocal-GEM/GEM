# Fix the resonance-processor.js file
$file = "public\resonance-processor.js"
$content = Get-Content $file -Raw

# Define the buggy section to replace
$buggySection = @"
            // F1: strongest peak in 200-1200Hz
            for (let candidate of formantCandidates) {
                if (candidate.freq >= 200 && candidate.freq <= 1200) {
                    p1 = candidate;
                    break;
                }
            }
            this.smoothedCentroid = (this.lastResonance * (1 - alpha)) + (medianResonance * alpha);
            this.lastResonance = this.smoothedCentroid;
"@

# Define the fixed section
$fixedSection = @"
            // F1: strongest peak in 200-1200Hz
            for (let candidate of formantCandidates) {
                if (candidate.freq >= 200 && candidate.freq <= 1200) {
                    p1 = candidate;
                    break;
                }
            }

            // F2: strongest peak in 1200-3500Hz (must be different from F1)
            for (let candidate of formantCandidates) {
                if (candidate.freq >= 1200 && candidate.freq <= 3500 && candidate !== p1) {
                    p2 = candidate;
                    break;
                }
            }

            // Calculate spectral centroid for resonance
            let weightedSum = 0;
            let totalMag = 0;
            for (let i = 0; i < spectrum.length; i++) {
                const freq = (i * TARGET_RATE) / (2 * spectrum.length);
                weightedSum += freq * spectrum[i];
                totalMag += spectrum[i];
            }
            const spectralCentroid = totalMag > 0 ? weightedSum / totalMag : 0;

            // Smooth resonance
            const resonanceAlpha = 0.2;
            this.smoothedCentroid = (this.lastResonance * (1 - resonanceAlpha)) + (spectralCentroid * resonanceAlpha);
            this.lastResonance = this.smoothedCentroid;
"@

# Replace the buggy section with the fixed section
$newContent = $content.Replace($buggySection, $fixedSection)

# Write the fixed content back to the file
$newContent | Set-Content $file -NoNewline

Write-Host "Fixed resonance-processor.js successfully!"
