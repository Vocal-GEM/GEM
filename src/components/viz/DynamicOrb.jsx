/* eslint-disable react/no-unknown-property */
import { useRef, useMemo, useState, useEffect, Suspense, lazy, memo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Diamond, Flame, Bug, Box, Activity, Sliders, Gauge } from 'lucide-react';
import { useGLTF, OrbitControls } from '@react-three/drei';
import { useSettings } from '../../context/SettingsContext';
import OrbLegend from './OrbLegend';


const MixingBoardView = lazy(() => import('../views/MixingBoardView'));

// Shared Noise Function
const noiseChunk = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0);
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

// GEM SHADER
const gemVertex = `
${noiseChunk}
uniform float u_time;
uniform float u_amplitude;
uniform float u_roughness;
varying vec2 vUv;
varying float vDisplacement;
varying vec3 vNormal;
varying float vNoise;
varying vec3 vViewPosition;

void main() {
  vUv = uv;
  vNormal = normal;
  
  // DRAMATIC Texture Change
  // Low weight (Light) = Smooth, Glassy (Low roughness)
  // High weight (Heavy) = Rough, Matte (High roughness)
  float noiseFreq = 1.5 + u_roughness * 10.0; 
  
  // Speed
  float time = u_time * (0.1 + u_amplitude * 0.3);
  
  float n1 = snoise(position * noiseFreq + time);
  float n2 = snoise(position * (noiseFreq * 1.5) - time);
  
  // Mix noise: 
  float finalNoise = mix(n1, abs(n2) * 2.0 - 1.0, u_roughness);
  vNoise = finalNoise;
  
  // Breathing (Volume affects Scale)
  float breathe = 1.0 + u_amplitude * 0.4;
  
  // Displacement
  // KEEP IT SUBTLE! Too much displacement ruins the gem shape.
  // Only displace when "Rough" (Heavy weight)
  float displacementStrength = u_roughness * 0.2; 
  float displacement = finalNoise * displacementStrength;
  
  // Apply breathing to position, and displacement along normal
  vec3 newPosition = position * breathe + normal * displacement;
  
  vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
  vViewPosition = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
  vDisplacement = displacement;
}
`;

const gemFragment = `
uniform float u_pitch_norm;
uniform float u_weight;
uniform float u_intensity;
uniform float u_resonance_norm;
uniform float u_resonance_confidence;
uniform float u_roughness;
uniform float u_time;
uniform float u_in_target; // New Uniform: 0.0 or 1.0
varying float vDisplacement;
varying vec3 vNormal;
varying float vNoise;
varying vec3 vViewPosition;

void main() {
  // Color Palette - Intuitive Pitch Mapping
  // Low (Masc) = Blue/Cyan
  // Mid (Andro) = Purple
  // High (Fem) = Pink/Magenta
  vec3 colorLow = vec3(0.0, 0.6, 0.9);   // Cyan/Blue
  vec3 colorMid = vec3(0.6, 0.2, 0.8);   // Purple
  vec3 colorHigh = vec3(1.0, 0.2, 0.6);  // Magenta/Pink
  
  vec3 baseColor;
  if (u_pitch_norm < 0.5) {
      baseColor = mix(colorLow, colorMid, u_pitch_norm * 2.0);
  } else {
      baseColor = mix(colorMid, colorHigh, (u_pitch_norm - 0.5) * 2.0);
  }

  // Faceting
  vec3 fdx = dFdx(vViewPosition);
  vec3 fdy = dFdy(vViewPosition);
  vec3 faceNormal = normalize(cross(fdx, fdy));
  vec3 finalNormal = faceNormal;

  vec3 viewDir = normalize(cameraPosition - vViewPosition);
  
  // Fresnel
  float fresnel = pow(1.0 - abs(dot(finalNormal, viewDir)), 2.0);
  
  // Lighting
  vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
  vec3 reflectDir = reflect(-lightDir, finalNormal);
  
  // Specular
  float specSharp = pow(max(dot(viewDir, reflectDir), 0.0), 80.0 * (1.0 - u_roughness * 0.8));
  float specSoft = pow(max(dot(viewDir, reflectDir), 0.0), 20.0) * 0.5;
  float spec = specSharp + specSoft;
  
  // Refraction
  float aberration = 0.05 + u_intensity * 0.1;
  vec3 refractColor;
  refractColor.r = pow(max(dot(finalNormal, viewDir + vec3(aberration, 0.0, 0.0)), 0.0), 3.0);
  refractColor.g = pow(max(dot(finalNormal, viewDir), 0.0), 3.0);
  refractColor.b = pow(max(dot(finalNormal, viewDir - vec3(aberration, 0.0, 0.0)), 0.0), 3.0);
  
  // Resonance Glow
  vec3 resonanceColor = vec3(0.0);
  if (u_resonance_norm < 0.35) {
      resonanceColor = vec3(0.0, 0.3, 1.0); // Blue glow (Dark)
  } else if (u_resonance_norm > 0.65) {
      resonanceColor = vec3(1.0, 0.0, 0.8); // Pink glow (Bright)
  } else {
      resonanceColor = vec3(0.5, 1.0, 0.5); // Green/Teal glow (Balanced)
  }
  float resIntensity = abs(u_resonance_norm - 0.5) * 2.0;
  
  // Composition
  vec3 finalColor = baseColor;
  finalColor += refractColor * 1.2 * (1.0 - u_roughness * 0.5);
  
  float resBrightness = 0.5 + u_resonance_norm;
  finalColor += vec3(1.0) * spec * (1.5 + u_intensity) * resBrightness;
  finalColor += baseColor * fresnel * 4.0 * resBrightness;
  
  float pulse = 0.5 + 0.5 * sin(u_time * 2.0);
  finalColor = mix(finalColor, resonanceColor, resIntensity * 0.6 * pulse);
  
  finalColor += finalColor * u_intensity * (0.5 + u_resonance_norm);
  finalColor += vec3(0.15);

  // --- TARGET ZONE INDICATOR ---
  // If in target zone, add a golden rim/glow
  if (u_in_target > 0.5) {
      vec3 gold = vec3(1.0, 0.8, 0.2);
      float rim = pow(1.0 - abs(dot(finalNormal, viewDir)), 4.0);
      finalColor += gold * rim * 2.0 * (0.5 + 0.5 * sin(u_time * 5.0)); // Pulsing gold rim
  }

  float alpha = 0.92 + u_roughness * 0.08;
  
  float confidence = clamp(u_resonance_confidence, 0.0, 1.0);
  finalColor *= (0.3 + 0.7 * confidence);
  alpha *= (0.5 + 0.5 * confidence);
  
  gl_FragColor = vec4(finalColor, alpha);
}
`;

const VisualizerMesh = ({ mode, setMode, dataRef, externalDataRef, calibration, targetRange }) => {
  const mesh = useRef();
  const material = useRef();
  const { gl } = useThree();

  // Handle Context Loss Gracefully
  useEffect(() => {
    const handleContextLost = (e) => {
      e.preventDefault();
      console.warn("WebGL Context Lost! Switching to Safe Mode.");
      setMode('safe');
    };

    const canvas = gl.domElement;
    canvas.addEventListener('webglcontextlost', handleContextLost);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
    };
  }, [gl, setMode]);

  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    u_amplitude: { value: 0 },
    u_roughness: { value: 0 },
    u_pitch_norm: { value: 0 },
    u_weight: { value: 0.5 },
    u_intensity: { value: 0 },
    u_resonance_norm: { value: 0.5 },
    u_resonance_confidence: { value: 1.0 },
    u_in_target: { value: 0.0 } // New Uniform
  }), []);

  const shaders = useMemo(() => {
    switch (mode) {

      case 'gem':
      default: return { v: gemVertex, f: gemFragment };
    }
  }, [mode]);

  useFrame((state, delta) => {
    if (!mesh.current || !material.current || !dataRef.current) return;

    const { pitch, resonance, weight, volume, resonanceConfidence } = dataRef.current;
    const extVol = externalDataRef?.current?.volume || 0;
    const vol = Math.max(volume || 0, extVol);

    const damping = 4.0 * delta;

    // Smooth volume
    const currentVol = uniforms.u_amplitude.value;
    const targetVol = vol;
    const smoothedVol = THREE.MathUtils.lerp(currentVol, targetVol, damping);

    // Smooth Pitch
    const pitchVal = pitch || 0;
    let targetPitchNorm = uniforms.u_pitch_norm.value;
    if (pitchVal > 0) {
      const pitchNorm = (Math.max(85, Math.min(255, pitchVal)) - 85) / 170;
      targetPitchNorm = pitchNorm;
    }
    const smoothedPitch = THREE.MathUtils.lerp(uniforms.u_pitch_norm.value, targetPitchNorm, damping * 0.5);

    // Target Zone Logic
    let inTarget = 0.0;
    if (targetRange && pitchVal >= targetRange.min && pitchVal <= targetRange.max) {
      inTarget = 1.0;
    }
    // Smooth transition for target indicator? No, instant is better feedback.
    uniforms.u_in_target.value = inTarget;

    // Smooth Resonance
    let resonanceNorm = 0.5;
    if (resonance && calibration) {
      const { dark, bright } = calibration;
      resonanceNorm = Math.max(0, Math.min(1, (resonance - dark) / (bright - dark)));
    }
    const smoothedResonanceNorm = THREE.MathUtils.lerp(uniforms.u_resonance_norm.value, resonanceNorm, damping * 0.5);

    // Smooth Weight
    const weightVal = weight !== undefined ? weight : 0.5;
    const smoothedWeight = THREE.MathUtils.lerp(uniforms.u_weight.value, weightVal, damping);

    // Smooth Confidence
    const confVal = resonanceConfidence !== undefined ? resonanceConfidence : 1.0;
    const smoothedConf = THREE.MathUtils.lerp(uniforms.u_resonance_confidence.value, confVal, damping * 2.0);

    uniforms.u_time.value = state.clock.elapsedTime;
    uniforms.u_amplitude.value = smoothedVol;
    uniforms.u_pitch_norm.value = smoothedPitch;
    uniforms.u_weight.value = smoothedWeight;
    uniforms.u_intensity.value = smoothedVol;
    uniforms.u_resonance_norm.value = smoothedResonanceNorm;
    uniforms.u_resonance_confidence.value = smoothedConf;

    const weightNorm = Math.max(0, Math.min(1, weightVal / 100));
    uniforms.u_roughness.value = weightNorm;

    // --- ORGANIC ANIMATION ---
    const time = state.clock.elapsedTime;

    // 1. Spinning Logic (Active vs Idle)
    // Base idle spin + Active spin based on volume
    // Louder = Faster spin
    const idleSpeed = 0.2;
    const activeSpeed = 8.0; // Much faster when loud
    const spinSpeed = THREE.MathUtils.lerp(idleSpeed, activeSpeed, smoothedVol);

    // Multi-axis rotation drift (Zero-gravity feel)
    // Using different prime frequencies for non-repetitive motion
    mesh.current.rotation.y += spinSpeed * delta;
    mesh.current.rotation.x = 0.3; // Slight fixed tilt
    mesh.current.rotation.z = 0;

    // 2. Floating/Bobbing (Composed Sine Waves)
    // Layer 1: Slow, large wave
    const bob1 = Math.sin(time * 0.5) * 0.1;
    // Layer 2: Faster, small wave (breathing)
    const bob2 = Math.cos(time * 1.3) * 0.05;

    mesh.current.position.y = bob1 + bob2;

  });

  return (
    <mesh ref={mesh}>
      {mode === 'gem' && (
        <octahedronGeometry args={[2.0, 0]} /> // Classic 8-sided Gem shape
      )}

      <shaderMaterial
        ref={material}
        vertexShader={shaders.v}
        fragmentShader={shaders.f}
        uniforms={uniforms}
        transparent={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        extensions={{ derivatives: true }}
      />
    </mesh>
  );
};

// Simple Intersection Observer Hook
const useIntersectionObserver = (ref) => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { threshold: 0.1 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return isVisible;
};

const DynamicOrb = memo(({ dataRef, calibration, externalDataRef, audioEngine, targetRange }) => {
  const { settings } = useSettings();
  const beginnerMode = settings?.beginnerMode;
  const [mode, setMode] = useState('gem');
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [genderPerception, setGenderPerception] = useState({ label: '—', color: 'text-slate-500' });
  const [metricClassifications, setMetricClassifications] = useState({
    pitch: { label: '—', color: 'text-slate-500' },
    resonance: { label: '—', color: 'text-slate-500' },
    weight: { label: '—', color: 'text-slate-500' }
  });
  const [pitchDisplay, setPitchDisplay] = useState(null);

  const containerRef = useRef(null);
  const isVisible = useIntersectionObserver(containerRef);

  const modes = [
    { id: 'gem', icon: Diamond, label: 'Gem' },

    { id: 'mixer', icon: Sliders, label: 'Mixer' },
    { id: 'gauges', icon: Gauge, label: 'Gauges' },
    { id: 'safe', icon: Activity, label: '2D Safe Mode' },
  ];

  // Keyboard shortcut: D to toggle debug
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'd' || e.key === 'D') {
        setShowDebug(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Update debug info periodically
  useEffect(() => {
    if (!showDebug) return;

    const interval = setInterval(() => {
      if (dataRef.current) {
        const { pitch, resonance, volume, weight } = dataRef.current;
        const pitchVal = pitch || 0;

        // Calculate resonance score for slider (Dark/Balanced/Bright)
        let resScore = 0.5;
        if (resonance && calibration) {
          const { dark, bright } = calibration;
          resScore = Math.max(0, Math.min(1, (resonance - dark) / (bright - dark)));
        }

        // Weight Score
        const weightVal = weight !== undefined ? weight : 50;
        const weightScore = 1.0 - Math.max(0, Math.min(1, weightVal / 100));

        // Pitch Score (Approx)
        let pitchScore = 0.5;
        if (pitchVal > 0) {
          if (pitchVal < 85) pitchScore = 0.0;
          else if (pitchVal < 165) pitchScore = ((pitchVal - 85) / 80) * 0.4;
          else if (pitchVal < 185) pitchScore = 0.4 + ((pitchVal - 165) / 20) * 0.2;
          else if (pitchVal < 255) pitchScore = 0.6 + ((pitchVal - 185) / 70) * 0.4;
          else pitchScore = 1.0;
        }

        const currentScore = (pitchScore * 2 + resScore + weightScore) / 4;

        setDebugInfo({
          centroid: resonance?.toFixed(0) || '—',
          pitch: pitchVal > 0 ? pitchVal.toFixed(0) : '—',
          resScore: (resScore * 100).toFixed(0),
          volume: ((volume || 0) * 100).toFixed(1),
          // Add raw scores for debugging
          pScore: pitchScore.toFixed(2),
          rScore: resScore.toFixed(2),
          wScore: weightScore.toFixed(2),
          tScore: currentScore.toFixed(2)
        });
      }
    }, 200);
    return () => clearInterval(interval);
  }, [dataRef, calibration, showDebug]);

  // Gender Perception Logic
  const scoreBuffer = useRef([]);
  const silenceStart = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (dataRef.current) {
        const { pitch, resonance, weight } = dataRef.current;

        // Handle Silence / Invalid Pitch with Debounce
        if (!pitch || pitch <= 0) {
          if (!silenceStart.current) {
            silenceStart.current = Date.now();
          }

          // If silence persists for > 1.5 seconds, reset
          if (Date.now() - silenceStart.current > 1500) {
            setGenderPerception({ label: '—', color: 'text-slate-500' });
            scoreBuffer.current = []; // Clear buffer
          }
          return;
        }

        // Voice detected - reset silence timer
        silenceStart.current = null;

        // 1. Pitch Score (0 = Masc, 1 = Fem)
        let pitchScore = 0.5;
        if (pitch < 85) pitchScore = 0.0;
        else if (pitch < 165) pitchScore = ((pitch - 85) / 80) * 0.4; // 0.0 - 0.4 (Masc)
        else if (pitch < 185) pitchScore = 0.4 + ((pitch - 165) / 20) * 0.2; // 0.4 - 0.6 (Andro)
        else if (pitch < 255) pitchScore = 0.6 + ((pitch - 185) / 70) * 0.4; // 0.6 - 1.0 (Fem)
        else pitchScore = 1.0;

        // 2. Resonance Score (0 = Masc, 1 = Fem)
        let resScore = 0.5;
        if (resonance && calibration) {
          const { dark, bright } = calibration;
          resScore = Math.max(0, Math.min(1, (resonance - dark) / (bright - dark)));
        }

        // 3. Weight Score (0 = Masc, 1 = Fem)
        const weightVal = weight !== undefined ? weight : 50;
        const weightScore = 1.0 - Math.max(0, Math.min(1, weightVal / 100));

        // Average for this frame (Weighted: Pitch 50%, Res 25%, Weight 25%)
        const currentScore = (pitchScore * 2 + resScore + weightScore) / 4;

        // Add to buffer (Keep last 10 frames = ~2 seconds at 200ms interval)
        scoreBuffer.current.push(currentScore);
        if (scoreBuffer.current.length > 10) scoreBuffer.current.shift();

        // Calculate smoothed score
        const smoothedScore = scoreBuffer.current.reduce((a, b) => a + b, 0) / scoreBuffer.current.length;

        let label = 'Androgynous';
        let color = 'text-purple-400';

        if (mode === 'fire') {
          // Binary logic for Fire mode (No Androgynous)
          if (smoothedScore < 0.5) {
            label = 'Masculine';
            color = 'text-blue-400';
          } else {
            label = 'Feminine';
            color = 'text-pink-400';
          }
        } else {
          // Ternary logic for Gem mode
          if (smoothedScore < 0.40) {
            label = 'Masculine';
            color = 'text-blue-400';
          } else if (smoothedScore > 0.60) {
            label = 'Feminine';
            color = 'text-pink-400';
          }
        }

        setGenderPerception({ label, color });
        setPitchDisplay(pitch > 0 ? Math.round(pitch) : null);

        // Set individual metric classifications
        const getClassification = (score) => {
          if (score < 0.40) return { label: 'Masculine', color: 'text-blue-400' };
          if (score > 0.60) return { label: 'Feminine', color: 'text-pink-400' };
          return { label: 'Androgynous', color: 'text-purple-400' };
        };

        setMetricClassifications({
          pitch: getClassification(pitchScore),
          resonance: getClassification(resScore),
          weight: getClassification(weightScore)
        });
      }
    }, 200);
    return () => clearInterval(interval);
  }, [dataRef, calibration, mode]);

  return (
    <div ref={containerRef} className="w-full h-full relative group flex flex-col items-center justify-center">
      {/* Accessibility Live Region */}
      <div className="sr-only" aria-live="polite">
        {genderPerception.label !== '—' ? `Voice detected: ${genderPerception.label}. Pitch: ${metricClassifications.pitch.label}, Resonance: ${metricClassifications.resonance.label}.` : 'Listening...'}
      </div>

      <div className="absolute top-2 text-xs font-bold text-slate-300 uppercase tracking-widest z-10 w-full text-center">
        Dynamic Orb - Pitch, Resonance, Weight, & Volume
      </div>

      {/* Live Hz Overlay */}
      {pitchDisplay && (
        <div className="absolute top-[20%] left-0 right-0 text-center pointer-events-none z-0 animate-in fade-in duration-300">
          <div className="text-5xl font-black text-white/10 tracking-tighter select-none">
            {pitchDisplay} Hz
          </div>
        </div>
      )}

      <OrbLegend mode={mode} />

      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 flex gap-2 p-2 rounded-full bg-slate-900/50 backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`p-2 rounded-full transition-all ${isActive ? 'bg-teal-500 text-white shadow-[0_0_10px_rgba(20,184,166,0.5)]' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
              title={m.label}
            >
              <Icon size={18} />
            </button>
          );
        })}
        <div className="w-px bg-white/10 mx-1"></div>
        {!beginnerMode && (
          <button
            onClick={() => setShowDebug(!showDebug)}
            className={`p-2 rounded-full transition-all ${showDebug ? 'bg-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
            title="Toggle Debug Panel"
          >
            <Bug size={18} />
          </button>
        )}
      </div>

      {/* 2D Fallback (Safe Mode) */}
      {(mode === 'safe' || calibration?.disable3D) && mode !== 'mixer' && mode !== 'gauges' ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Pulsing Circles */}
            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
            <div className="absolute inset-4 bg-purple-500/20 rounded-full animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.5s' }}></div>

            {/* Core Circle */}
            <div className="relative w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-[0_0_40px_rgba(59,130,246,0.5)] flex items-center justify-center transition-transform duration-100"
              style={{
                transform: `scale(${1 + (debugInfo?.volume || 0) / 100})`
              }}
            >
              <div className="text-white font-bold text-xl">
                {debugInfo?.pitch > 0 ? Math.round(debugInfo.pitch) + ' Hz' : '...'}
              </div>
            </div>
          </div>

          <div className="absolute bottom-20 text-slate-400 text-xs font-mono">
            Safe Mode (2D Fallback)
          </div>
        </div>
      ) : mode === 'mixer' || mode === 'gauges' ? (
        <div className="w-full h-full flex flex-col">
          <div className="flex-1 min-h-0 p-4 pt-16">
            <Suspense fallback={<div className="text-white">Loading...</div>}>
              <MixingBoardView
                dataRef={dataRef}
                audioEngine={audioEngine}
                calibration={calibration}
                compact={true}
                viewMode={mode === 'mixer' ? 'sliders' : 'gauges'}
              />
            </Suspense>
          </div>

          {/* Metrics Below Mixer */}
          {!beginnerMode && (
            <div className="flex-shrink-0 py-4 bg-slate-900/30 border-t border-white/5">
              <div className="flex justify-center gap-4 text-xs mb-2">
                <div className="text-center">
                  <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">Pitch</div>
                  <div className={`font-bold ${metricClassifications.pitch.color} transition-colors duration-300`}>
                    {metricClassifications.pitch.label}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">Resonance</div>
                  <div className={`font-bold ${metricClassifications.resonance.color} transition-colors duration-300`}>
                    {metricClassifications.resonance.label}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">Weight</div>
                  <div className={`font-bold ${metricClassifications.weight.color} transition-colors duration-300`}>
                    {metricClassifications.weight.label}
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Gender Perception</div>
                <div className={`text-lg font-bold ${genderPerception.color} transition-colors duration-300`}>
                  {genderPerception.label}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Canvas
          className="w-full h-full"
          camera={{ position: [0, 0, 6], fov: 50 }}
          gl={{ antialias: true, powerPreference: "high-performance", alpha: true, preserveDrawingBuffer: false }}
          dpr={1}
          frameloop={isVisible ? "always" : "never"} // Pause when hidden
          onCreated={(state) => {
            state.gl.setClearColor('#020617', 0);
          }}
        >
          <ambientLight intensity={0.5} />
          <VisualizerMesh key={mode} mode={mode} setMode={setMode} dataRef={dataRef} externalDataRef={externalDataRef} calibration={calibration} targetRange={targetRange} />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
        </Canvas>
      )}

      {/* Debug Panel Overlay */}
      {showDebug && debugInfo && (
        <div className="absolute top-4 right-4 p-4 bg-slate-900/90 backdrop-blur-md rounded-lg border border-white/10 w-64 z-20 shadow-xl">
          <div className="text-xs font-mono text-slate-400 mb-3 uppercase tracking-wider flex justify-between items-center">
            <span>Diagnostics</span>
            <span className="text-amber-500 animate-pulse">●</span>
          </div>

          <div className="grid grid-cols-2 gap-y-2 text-xs font-mono mb-4">
            <div className="text-slate-500">Pitch</div>
            <div className="text-white text-right">{debugInfo.pitch} Hz</div>

            <div className="text-slate-500">Resonance</div>
            <div className="text-cyan-400 text-right">{debugInfo.centroid} Hz</div>

            <div className="text-slate-500">Volume</div>
            <div className="text-emerald-400 text-right">{debugInfo.volume}%</div>

            <div className="col-span-2 border-t border-white/10 my-1"></div>

            <div className="text-slate-500 text-[10px]">P/R/W Score</div>
            <div className="text-white text-right text-[10px]">
              {debugInfo.pScore} / {debugInfo.rScore} / {debugInfo.wScore}
            </div>
            <div className="text-slate-500 text-[10px]">Total</div>
            <div className="text-white text-right text-[10px] font-bold">{debugInfo.tScore}</div>
          </div>

          <div className="pt-3 border-t border-white/10">
            <div className="flex justify-between text-[10px] text-slate-300 mb-1 uppercase tracking-wider">
              <span>Dark</span>
              <span>Balanced</span>
              <span>Bright</span>
            </div>
            <div className="relative h-3 w-full rounded-full bg-slate-800 overflow-hidden ring-1 ring-white/10">
              <div className="absolute inset-0 opacity-80" style={{
                background: 'linear-gradient(to right, #312e81 0%, #3b82f6 35%, #3b82f6 65%, #facc15 100%)'
              }}></div>
              <div className="absolute top-0 bottom-0 w-px bg-white/30 left-[35%]"></div>
              <div className="absolute top-0 bottom-0 w-px bg-white/30 left-[65%]"></div>
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_rgba(255,255,255,1)] transition-all duration-100 ease-out z-10"
                style={{ left: `${debugInfo.resScore}%`, transform: 'translateX(-50%)' }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Metric Classifications Row - ONLY FOR ORB MODES */}
      {!beginnerMode && mode !== 'mixer' && mode !== 'gauges' && (
        <div className="absolute bottom-12 left-0 right-0 px-4 pointer-events-none">
          <div className="flex justify-center gap-4 text-xs">
            <div className="text-center">
              <div className="text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">Pitch</div>
              <div className={`font-bold ${metricClassifications.pitch.color} transition-colors duration-300`}>
                {metricClassifications.pitch.label}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">Resonance</div>
              <div className={`font-bold ${metricClassifications.resonance.color} transition-colors duration-300`}>
                {metricClassifications.resonance.label}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">Weight</div>
              <div className={`font-bold ${metricClassifications.weight.color} transition-colors duration-300`}>
                {metricClassifications.weight.label}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gender Perception Label - ONLY FOR ORB MODES */}
      {mode !== 'mixer' && mode !== 'gauges' && (
        <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
          <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Gender Perception</div>
          <div className={`text-lg font-bold ${genderPerception.color} transition-colors duration-300`}>
            {genderPerception.label}
          </div>
        </div>
      )}

      {/* Resonance Target Zones Overlay */}
      {mode === 'gem' && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Circular Tick Marks or Labels positioned around the center */}
          {/* We can use absolute positioning with transforms to place them */}

          {/* Dark Zone (Left/Bottom-Left) */}
          <div className="absolute top-1/2 left-4 -translate-y-1/2 flex flex-col items-center gap-1 opacity-50">
            <div className="text-[9px] uppercase tracking-widest text-blue-400 font-bold rotate-[-90deg]">Dark</div>
            <div className="h-16 w-1 bg-gradient-to-b from-blue-900 to-blue-500 rounded-full"></div>
            <div className="text-[8px] text-slate-400">0.0 - 0.35</div>
          </div>

          {/* Balanced Zone (Center/Bottom) */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-50">
            <div className="text-[8px] text-slate-400">0.35 - 0.65</div>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 via-green-400 to-pink-500 rounded-full"></div>
            <div className="text-[9px] uppercase tracking-widest text-green-400 font-bold mt-1">Balanced</div>
          </div>

          {/* Bright Zone (Right/Bottom-Right) */}
          <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col items-center gap-1 opacity-50">
            <div className="text-[9px] uppercase tracking-widest text-pink-400 font-bold rotate-[90deg]">Bright</div>
            <div className="h-16 w-1 bg-gradient-to-t from-pink-900 to-pink-500 rounded-full"></div>
            <div className="text-[8px] text-slate-400">0.65 - 1.0</div>
          </div>
        </div>
      )}
    </div>
  );
});

DynamicOrb.displayName = 'DynamicOrb';

export default DynamicOrb;
