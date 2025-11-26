import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Diamond, Flame, Bug } from 'lucide-react';
import OrbLegend from './OrbLegend';

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
uniform float u_roughness;
uniform float u_time;
varying float vDisplacement;
varying vec3 vNormal;
varying float vNoise;
varying vec3 vViewPosition;

void main() {
  // Color Palette - Deep, Rich Gem Tones
  vec3 colorDeep = vec3(0.02, 0.05, 0.2); // Deep Sapphire
  vec3 colorMasc = vec3(0.0, 0.6, 0.8); // Blue Topaz
  vec3 colorFem = vec3(0.8, 0.0, 0.6); // Rubellite
  vec3 colorBright = vec3(0.9, 0.7, 0.9); // Pink Diamond

  vec3 baseColor;
  if (u_pitch_norm < 0.33) baseColor = mix(colorDeep, colorMasc, u_pitch_norm * 3.0);
  else if (u_pitch_norm < 0.66) baseColor = mix(colorMasc, colorFem, (u_pitch_norm - 0.33) * 3.0);
  else baseColor = mix(colorFem, colorBright, (u_pitch_norm - 0.66) * 3.0);

  // Faceting: ALWAYS use flat face normals for that "cut gem" look
  vec3 fdx = dFdx(vViewPosition);
  vec3 fdy = dFdy(vViewPosition);
  vec3 faceNormal = normalize(cross(fdx, fdy));
  vec3 finalNormal = faceNormal; // Hard facets

  vec3 viewDir = normalize(cameraPosition - vViewPosition);
  
  // Fresnel - Sharp and glass-like
  // Enhanced for "Frosted Glass" look - wider rim
  float fresnel = pow(1.0 - abs(dot(finalNormal, viewDir)), 2.5);
  
  // Lighting
  vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
  vec3 reflectDir = reflect(-lightDir, finalNormal);
  
  // Specular - Dual layer for "Bloom"
  // 1. Sharp, tight highlight (Core)
  // High roughness (Heavy) -> Less sharp specular
  float specSharp = pow(max(dot(viewDir, reflectDir), 0.0), 80.0 * (1.0 - u_roughness * 0.8));
  // 2. Broad, soft highlight (Bloom/Frost)
  float specSoft = pow(max(dot(viewDir, reflectDir), 0.0), 20.0) * 0.5;
  
  float spec = specSharp + specSoft;
  
  // Internal Reflection / Refraction simulation (Fake Dispersion)
  // We offset the view direction slightly for R, G, B channels
  float aberration = 0.05 + u_intensity * 0.1;
  vec3 refractColor;
  refractColor.r = pow(max(dot(finalNormal, viewDir + vec3(aberration, 0.0, 0.0)), 0.0), 3.0);
  refractColor.g = pow(max(dot(finalNormal, viewDir), 0.0), 3.0);
  refractColor.b = pow(max(dot(finalNormal, viewDir - vec3(aberration, 0.0, 0.0)), 0.0), 3.0);
  
  // Resonance Glow
  vec3 resonanceColor = vec3(0.0);
  if (u_resonance_norm < 0.4) {
      resonanceColor = vec3(0.0, 0.3, 1.0); // Blue glow
  } else if (u_resonance_norm > 0.6) {
      resonanceColor = vec3(1.0, 0.0, 0.8); // Pink glow
  }
  float resIntensity = abs(u_resonance_norm - 0.5) * 2.0;
  
  // Composition
  vec3 finalColor = baseColor;
  
  // Add dispersion sparkles (Less sparkles if rough/heavy)
  finalColor += refractColor * 0.8 * (1.0 - u_roughness * 0.5);
  
  // Add sharp specular + bloom
  // Resonance affects specular intensity (Bright = Sparkly, Dark = Dull)
  float resBrightness = 0.5 + u_resonance_norm; // 0.5 to 1.5
  finalColor += vec3(1.0) * spec * (1.5 + u_intensity) * resBrightness;
  
  // Add Fresnel rim
  finalColor += baseColor * fresnel * 3.0 * resBrightness; // Boosted Fresnel with Resonance
  
  // Add Resonance Glow (Pulse)
  // Pulse the resonance color with time for organic feel
  float pulse = 0.5 + 0.5 * sin(u_time * 2.0);
  finalColor = mix(finalColor, resonanceColor, resIntensity * 0.6 * pulse);
  
  // Inner brightness from volume
  // Resonance affects inner glow (Bright = Glowing, Dark = Dim)
  finalColor += finalColor * u_intensity * (0.5 + u_resonance_norm);

  // Alpha - Frosted glass is slightly more opaque
  // Heavy weight (Rough) -> More opaque/matte
  float alpha = 0.85 + u_roughness * 0.15;
  
  gl_FragColor = vec4(finalColor, alpha);
}
`;

// FIRE SHADER (Unchanged for now, or minimal updates)
const fireVertex = `
${noiseChunk}
uniform float u_time;
uniform float u_amplitude;
uniform float u_roughness;
varying vec2 vUv;
varying float vNoise;

void main() {
  vUv = uv;
  float time = u_time * 1.5;
  float n = snoise(vec3(position.x * 2.0, position.y * 1.5 + time, position.z * 2.0));
  vNoise = n;
  float displacement = n * (0.2 + u_amplitude * 0.8);
  vec3 newPos = position + normal * displacement;
  newPos.y += u_amplitude * 0.5 * (position.y + 1.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
}
`;

const fireFragment = `
uniform float u_pitch_norm;
uniform float u_weight;
uniform float u_intensity;
varying float vNoise;

void main() {
  vec3 c1 = vec3(0.0, 0.5, 1.0);
  vec3 c2 = vec3(0.0, 1.0, 1.0);
  vec3 c3 = vec3(0.8, 0.0, 1.0);
  vec3 c4 = vec3(1.0, 0.2, 0.5);
  vec3 baseColor;
  if (u_pitch_norm < 0.5) baseColor = mix(c1, c2, u_pitch_norm * 2.0);
  else baseColor = mix(c3, c4, (u_pitch_norm - 0.5) * 2.0);
  float heat = vNoise * 0.5 + 0.5;
  heat += u_intensity;
  vec3 finalColor = baseColor * (1.0 + heat * 2.0);
  float alpha = (0.5 + u_weight * 0.5) * smoothstep(0.2, 0.8, heat);
  gl_FragColor = vec4(finalColor, alpha);
}
`;

const VisualizerMesh = ({ mode, dataRef, externalDataRef, calibration }) => {
  const mesh = useRef();
  const material = useRef();

  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    u_amplitude: { value: 0 },
    u_roughness: { value: 0 },
    u_pitch_norm: { value: 0 },
    u_weight: { value: 0.5 },
    u_intensity: { value: 0 },
    u_resonance_norm: { value: 0.5 }
  }), []);

  const shaders = useMemo(() => {
    switch (mode) {
      case 'fire': return { v: fireVertex, f: fireFragment };
      case 'gem':
      default: return { v: gemVertex, f: gemFragment };
    }
  }, [mode]);

  useFrame((state, delta) => {
    if (!mesh.current || !material.current || !dataRef.current) return;

    const { pitch, resonance, weight, volume } = dataRef.current;
    const extVol = externalDataRef?.current?.volume || 0;
    const vol = Math.max(volume || 0, extVol);

    // Damping factor for smooth transitions (Lerp)
    const damping = 4.0 * delta; // Adjust speed here

    // Smooth volume
    const currentVol = uniforms.u_amplitude.value;
    const targetVol = vol;
    const smoothedVol = THREE.MathUtils.lerp(currentVol, targetVol, damping);

    // Smooth Pitch
    // If pitch is 0 (silence), don't snap, just stay or drift slowly
    const pitchVal = pitch || 0;
    let targetPitchNorm = uniforms.u_pitch_norm.value;
    if (pitchVal > 0) {
      const pitchNorm = (Math.max(85, Math.min(255, pitchVal)) - 85) / 170;
      targetPitchNorm = pitchNorm;
    }
    const smoothedPitch = THREE.MathUtils.lerp(uniforms.u_pitch_norm.value, targetPitchNorm, damping * 0.5);

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

    uniforms.u_time.value = state.clock.elapsedTime;
    uniforms.u_amplitude.value = smoothedVol;
    uniforms.u_pitch_norm.value = smoothedPitch;
    uniforms.u_weight.value = smoothedWeight;
    uniforms.u_intensity.value = smoothedVol;
    uniforms.u_resonance_norm.value = smoothedResonanceNorm;

    // Map Weight to Roughness (Texture)
    // Light (0) -> Smooth/Glassy (0.0)
    // Heavy (1) -> Rough/Matte (1.0)
    // Normalize weight (assuming 0-100 range from processor)
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
      {mode === 'gem' ? (
        <octahedronGeometry args={[2.0, 0]} /> // Classic 8-sided Gem shape
      ) : (
        <icosahedronGeometry args={[1.6, 30]} />
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

const DynamicOrb = React.memo(({ dataRef, calibration, externalDataRef }) => {
  const [mode, setMode] = useState('gem');
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [genderPerception, setGenderPerception] = useState({ label: '—', color: 'text-slate-500' });

  const modes = [
    { id: 'gem', icon: Diamond, label: 'Gem' },
    { id: 'fire', icon: Flame, label: 'Fire' },
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
        const { pitch, resonance, volume } = dataRef.current;
        const pitchVal = pitch || 0;

        // Calculate resonance score for slider (Dark/Balanced/Bright)
        let resScore = 0.5;
        if (resonance && calibration) {
          const { dark, bright } = calibration;
          resScore = Math.max(0, Math.min(1, (resonance - dark) / (bright - dark)));
        }

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
  }, [dataRef, calibration]);

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
        // < 130 = Masc, 130-175 = Andro, > 175 = Fem
        let pitchScore = 0.5;
        if (pitch < 130) pitchScore = 0.0 + (pitch / 130) * 0.35; // 0.0 - 0.35
        else if (pitch < 175) pitchScore = 0.35 + ((pitch - 130) / 45) * 0.3; // 0.35 - 0.65
        else pitchScore = 0.65 + Math.min(1, (pitch - 175) / 80) * 0.35; // 0.65 - 1.0

        // 2. Resonance Score (0 = Masc, 1 = Fem)
        let resScore = 0.5;
        if (resonance && calibration) {
          const { dark, bright } = calibration;
          resScore = Math.max(0, Math.min(1, (resonance - dark) / (bright - dark)));
        }

        // 3. Weight Score (0 = Masc, 1 = Fem)
        // Heavy (>60) = Masc, Light (<40) = Fem
        // Weight is 0-100. Invert it: 100 -> 0, 0 -> 1
        const weightVal = weight !== undefined ? weight : 50;
        const weightScore = 1.0 - Math.max(0, Math.min(1, weightVal / 100));

        // Average for this frame
        const currentScore = (pitchScore + resScore + weightScore) / 3;

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
      }
    }, 200);
    return () => clearInterval(interval);
  }, [dataRef, calibration, mode]);

  return (
    <div className="w-full h-full relative group flex flex-col items-center justify-center">
      <div className="absolute top-2 text-xs font-bold text-slate-500 uppercase tracking-widest z-10">
        Dynamic Orb - Pitch, Resonance, Weight, & Volume
      </div>
      <OrbLegend mode={mode} />

      {/* Controls */}
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
        <button
          onClick={() => setShowDebug(!showDebug)}
          className={`p-2 rounded-full transition-all ${showDebug ? 'bg-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
          title="Toggle Debug Panel"
        >
          <Bug size={18} />
        </button>
      </div>

      <Canvas
        className="w-full h-full"
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true, preserveDrawingBuffer: false }}
        dpr={1}
        frameloop="always"
        onCreated={(state) => {
          state.gl.setClearColor('#020617', 0);
          const canvas = state.gl.domElement;
          canvas.addEventListener('webglcontextlost', (e) => e.preventDefault());
        }}
      >
        <ambientLight intensity={0.5} />
        <VisualizerMesh key={mode} mode={mode} dataRef={dataRef} externalDataRef={externalDataRef} calibration={calibration} />
      </Canvas>

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

          {/* Resonance Gradient Slider */}
          <div className="pt-3 border-t border-white/10">
            <div className="flex justify-between text-[10px] text-slate-500 mb-1 uppercase tracking-wider">
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

      {/* Gender Perception Label */}
      <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
        <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Gender Perception</div>
        <div className={`text-lg font-bold ${genderPerception.color} transition-colors duration-300`}>
          {genderPerception.label}
        </div>
      </div>
    </div>
  );
});

export default DynamicOrb;
