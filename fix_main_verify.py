import re

with open('src/main.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# I will use git restore later to undo this.
# Let's insert the verification logic.

verification_component = """
import PitchOrb from './components/viz/PitchOrb.jsx';
import React, { useRef, useEffect } from 'react';

const PitchOrbVerification = () => {
  const dataRef = useRef({ pitch: 220 }); // A3, Feminine/Androgynous range

  useEffect(() => {
    let animationFrame;
    const animate = () => {
      // Modulate pitch slightly for the orb pulse effect
      dataRef.current.pitch = 220 + Math.sin(Date.now() / 500) * 10;
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <div style={{ padding: '50px', backgroundColor: '#0f172a', height: '100vh' }}>
      <h2 style={{ color: 'white', marginBottom: '20px' }}>PitchOrb Verification (ResizeObserver + RAF)</h2>
      <div style={{ width: '400px', height: '400px' }}>
        <PitchOrb dataRef={dataRef} settings={{}} />
      </div>
    </div>
  );
};
"""

# Replace the root.render part
render_pattern = r'root\.render\(\s*<React\.StrictMode>\s*<App />\s*</React\.StrictMode>\s*\);'

new_render = """
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('verify_pitch_orb') === 'true') {
  root.render(<PitchOrbVerification />);
} else {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
"""

content = verification_component + content
content = re.sub(render_pattern, new_render, content)

with open('src/main.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Injected PitchOrbVerification into main.jsx")
