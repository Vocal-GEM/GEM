import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';

// --- Shaders ---

const vertexShader = `
uniform float u_time;
uniform float u_amplitude;
uniform float u_roughness; // Mapped to Resonance (Brightness)
varying vec2 vUv;
varying float vDisplacement;
varying vec3 vNormal;
varying float vNoise;

// Simplex 3D Noise 
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;

  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  // Permutations
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}

void main() {
  vUv = uv;
  vNormal = normal;
  
  // RESONANCE controls the "Texture" / Frequency of the noise
  // Low Resonance (Dark) -> Low Frequency (Smooth/Round)
  // High Resonance (Bright) -> High Frequency (Crystalline/Spiky)
  float noiseFreq = 0.8 + u_roughness * 3.5; 
  
  // Time factor for movement
  float time = u_time * (0.2 + u_amplitude * 0.5);

  // Calculate noise
  float noiseVal = snoise(position * noiseFreq + time);
  vNoise = noiseVal;
  
  // VOLUME controls the "Amplitude" / Displacement size
  // We add a base displacement so it's never perfectly smooth unless silent
  float displacement = noiseVal * (0.05 + u_amplitude * 0.6);
  
  // Apply displacement along normal
  vec3 newPosition = position + normal * displacement;
  
  vDisplacement = displacement;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;

const fragmentShader = `
uniform float u_pitch_norm; // 0.0 (Masc) to 1.0 (Fem)
uniform float u_weight;     // 0.0 (Light/Ethereal) to 1.0 (Heavy/Solid)
uniform float u_intensity;  // Volume/Glow strength
varying float vDisplacement;
varying vec3 vNormal;
varying float vNoise;

void main() {
  // --- COLOR PALETTE (Pitch) ---
  // 4-stage gradient: Dark Teal → Cyan → Purple → Pink
  vec3 color1 = vec3(0.0, 0.4, 0.5);  // Dark Teal (Very Low)
  vec3 color2 = vec3(0.0, 0.8, 0.8);  // Cyan (Low-Mid)
  vec3 color3 = vec3(0.8, 0.2, 1.0);  // Purple (Mid-High)
  vec3 color4 = vec3(1.0, 0.4, 0.8);  // Pink (Very High)

  // Smooth 4-way interpolation
  vec3 baseColor;
  if (u_pitch_norm < 0.33) {
    // Stage 1: Dark Teal → Cyan
    baseColor = mix(color1, color2, u_pitch_norm * 3.0);
  } else if (u_pitch_norm < 0.66) {
    // Stage 2: Cyan → Purple
    baseColor = mix(color2, color3, (u_pitch_norm - 0.33) * 3.0);
  } else {
    // Stage 3: Purple → Pink
    baseColor = mix(color3, color4, (u_pitch_norm - 0.66) * 3.0);
  }

  // --- DENSITY / OPACITY (Weight) ---
  // Heavy weight -> More solid, less transparent
  // Light weight -> More ethereal, ghost-like
  float alphaBase = 0.4 + u_weight * 0.6; 
  
  // --- GLOW / FRESNEL (Volume + Weight) ---
  vec3 viewDir = normalize(cameraPosition - vNormal); // Approximation in local space if needed, but standard varying works
  // Fresnel effect: stronger at edges
  float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
  
  // Boost fresnel for "Light" voices to make them look like glowing energy
  float glowIntensity = fresnel * (1.5 + (1.0 - u_weight) * 2.0);
  
  // Add dynamic pulsing from volume
  glowIntensity *= (1.0 + u_intensity * 2.0);

  // Combine
  vec3 finalColor = baseColor + (vec3(1.0) * glowIntensity * 0.5);
  
  // Add some noise texture to the color itself for "Crystalline" look
  finalColor += vNoise * 0.1;

  gl_FragColor = vec4(finalColor, alphaBase * (0.8 + fresnel * 0.5));
}
`;

const OrbMesh = ({ dataRef }) => {
    const mesh = useRef();
    const material = useRef();

    // Uniforms
    const uniforms = useMemo(() => ({
        u_time: { value: 0 },
        u_amplitude: { value: 0 },
        u_roughness: { value: 0 }, // Resonance
        u_pitch_norm: { value: 0 }, // Pitch
        u_weight: { value: 0.5 },   // Vocal Weight
        u_intensity: { value: 0 }   // Volume
    }), []);

    useFrame((state) => {
        if (!mesh.current || !material.current || !dataRef.current) return;

        const { pitch, resonance, weight, volume } = dataRef.current;

        // --- DATA MAPPING ---

        // 1. Volume (Amplitude)
        // Assume volume is 0-1 linear or similar. Smooth it.
        const vol = volume || 0;
        const smoothedVol = THREE.MathUtils.lerp(uniforms.u_amplitude.value, vol, 0.15);

        // 2. Pitch (Color)
        // Range: 80Hz (Masc) to 260Hz (Fem)
        // Clamp and normalize
        const pitchVal = pitch || 100;
        const pitchMin = 80;
        const pitchMax = 260;
        const pitchClamped = Math.max(pitchMin, Math.min(pitchMax, pitchVal));
        const pitchNorm = (pitchClamped - pitchMin) / (pitchMax - pitchMin);
        const smoothedPitch = THREE.MathUtils.lerp(uniforms.u_pitch_norm.value, pitchNorm, 0.08);

        // 3. Resonance (Texture/Roughness)
        // Range: 400Hz (Dark) to 2000Hz (Bright) - typical F1 ranges or similar metric
        const resVal = resonance || 500;
        const resMin = 400;
        const resMax = 2000;
        const resNorm = Math.max(0, Math.min(1, (resVal - resMin) / (resMax - resMin)));
        const smoothedRes = THREE.MathUtils.lerp(uniforms.u_roughness.value, resNorm, 0.08);

        // 4. Vocal Weight (Density/Opacity)
        // Range: Depends on metric. If "Spectral Tilt" or "Closed Quotient".
        // Let's assume input is 0 (Light) to 1 (Heavy) or similar.
        // If dataRef.weight is undefined, default to 0.5
        const weightVal = weight !== undefined ? weight : 0.5;
        // Normalize if needed. Assuming 0-1 for now.
        const weightNorm = Math.max(0, Math.min(1, weightVal));
        const smoothedWeight = THREE.MathUtils.lerp(uniforms.u_weight.value, weightNorm, 0.1);


        // --- UPDATE UNIFORMS ---
        uniforms.u_time.value = state.clock.elapsedTime;
        uniforms.u_amplitude.value = smoothedVol;
        uniforms.u_pitch_norm.value = smoothedPitch;
        uniforms.u_roughness.value = smoothedRes;
        uniforms.u_weight.value = smoothedWeight;
        uniforms.u_intensity.value = smoothedVol;

        // Dynamic Rotation
        // Spin faster when loud or high resonance
        mesh.current.rotation.y += 0.002 + smoothedVol * 0.01;
        mesh.current.rotation.z += 0.001 + smoothedRes * 0.005;
    });

    return (
        <mesh ref={mesh}>
            {/* Increased subdivisions for "Crystalline" detail (20 -> 30) */}
            <icosahedronGeometry args={[1.8, 30]} />
            <shaderMaterial
                ref={material}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent={true}
                blending={THREE.AdditiveBlending}
                depthWrite={false} // Helps with transparency sorting
            />
        </mesh>
    );
};

const DynamicOrb = React.memo(({ dataRef }) => {
    const mountCount = useRef(0);

    useEffect(() => {
        mountCount.current += 1;
        console.log('🔮 DynamicOrb MOUNTED - Mount count:', mountCount.current);

        return () => {
            console.log('🔮 DynamicOrb UNMOUNTING - Mount count was:', mountCount.current);
        };
    }, []);

    return (
        <div className="w-full h-full relative">
            <Canvas
                camera={{ position: [0, 0, 5], fov: 50 }}
                gl={{
                    antialias: false,
                    powerPreference: "high-performance",
                    alpha: false,
                    stencil: false,
                    depth: true,
                    preserveDrawingBuffer: false,
                    failIfMajorPerformanceCaveat: false
                }}
                dpr={1}
                frameloop="always"
                onCreated={(state) => {
                    console.log('✨ Canvas WebGL context created');
                    state.gl.setClearColor('#020617', 1);

                    // Handle context loss
                    const canvas = state.gl.domElement;
                    canvas.addEventListener('webglcontextlost', (event) => {
                        event.preventDefault();
                        console.warn('⚠️ WebGL context lost - preventing default');
                    });

                    canvas.addEventListener('webglcontextrestored', () => {
                        console.log('✅ WebGL context restored');
                    });
                }}
            >
                <ambientLight intensity={0.5} />
                <OrbMesh dataRef={dataRef} />
            </Canvas>
        </div>
    );
});

export default DynamicOrb;
