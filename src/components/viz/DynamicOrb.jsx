import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';

// --- Shaders ---

const vertexShader = `
uniform float u_time;
uniform float u_amplitude;
uniform float u_roughness;
varying vec2 vUv;
varying float vDisplacement;
varying vec3 vNormal;

// Simplex 3D Noise 
// (Standard GLSL implementation or imported)
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

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

  // Permutations
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  // Gradients: 7x7 points over a square, mapped onto an octahedron.
  // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  //Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  // Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}

void main() {
  vUv = uv;
  vNormal = normal;
  
  // Dynamic frequency based on roughness (resonance)
  float frequency = 1.5 + u_roughness * 2.0;
  
  // Noise displacement
  float noiseVal = snoise(position * frequency + u_time * 0.5);
  
  // Displacement amplitude based on volume
  float displacement = noiseVal * (0.1 + u_amplitude * 0.4);
  
  vDisplacement = displacement;
  
  vec3 newPosition = position + normal * displacement;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;

const fragmentShader = `
uniform float u_pitch_norm;
uniform float u_intensity;
varying float vDisplacement;
varying vec3 vNormal;

void main() {
  // Teal to Purple gradient (updated color scheme)
  vec3 colorLow = vec3(0.08, 0.72, 0.65); // Teal (#14b8a6)
  vec3 colorMid = vec3(0.02, 0.71, 0.83); // Cyan (#06b6d4)
  vec3 colorHigh = vec3(0.54, 0.36, 0.97); // Violet (#8b5cf6)
  
  // Three-way color mix for smoother gradient
  vec3 baseColor;
  if (u_pitch_norm < 0.5) {
    baseColor = mix(colorLow, colorMid, u_pitch_norm * 2.0);
  } else {
    baseColor = mix(colorMid, colorHigh, (u_pitch_norm - 0.5) * 2.0);
  }
  
  // Intensity based on displacement (peaks are brighter)
  float brightness = 0.5 + vDisplacement * 2.0 + u_intensity;
  
  // Enhanced Fresnel / Rim lighting for glow effect
  vec3 viewDirection = normalize(cameraPosition - vNormal);
  float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0, 0, 1.0))), 2.5);
  
  // Combine base color with brightness and glow
  vec3 glowColor = mix(colorLow, colorHigh, u_pitch_norm);
  vec3 finalColor = baseColor * brightness + fresnel * glowColor * 2.5;
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

const OrbMesh = ({ dataRef }) => {
    const mesh = useRef();
    const material = useRef();

    // Uniforms
    const uniforms = useMemo(() => ({
        u_time: { value: 0 },
        u_amplitude: { value: 0 },
        u_roughness: { value: 0 },
        u_pitch_norm: { value: 0 },
        u_intensity: { value: 0 }
    }), []);

    useFrame((state) => {
        if (!mesh.current || !material.current || !dataRef.current) return;

        const { pitch, resonance, volume } = dataRef.current;
        const vol = dataRef.current.volume || 0;
        const smoothedVol = THREE.MathUtils.lerp(uniforms.u_amplitude.value, vol, 0.1);

        // Normalize pitch (e.g., 100Hz to 300Hz range)
        const pitchClamped = Math.max(100, Math.min(300, pitch || 100));
        const pitchNorm = (pitchClamped - 100) / 200;
        const smoothedPitch = THREE.MathUtils.lerp(uniforms.u_pitch_norm.value, pitchNorm, 0.05);

        // Resonance (roughness)
        const resNorm = Math.min(1, (resonance || 500) / 2000);
        const smoothedRes = THREE.MathUtils.lerp(uniforms.u_roughness.value, resNorm, 0.05);

        // Update uniforms
        uniforms.u_time.value = state.clock.elapsedTime;
        uniforms.u_amplitude.value = smoothedVol;
        uniforms.u_pitch_norm.value = smoothedPitch;
        uniforms.u_roughness.value = smoothedRes;
        uniforms.u_intensity.value = smoothedVol * 0.5;

        // Pulse scale slightly
        const scale = 1.0 + smoothedVol * 0.2;
        mesh.current.scale.set(scale, scale, scale);
    });

    return (
        <mesh ref={mesh}>
            <icosahedronGeometry args={[1.8, 40]} />
            <shaderMaterial
                ref={material}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent={true}
                blending={THREE.AdditiveBlending}
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
                    alpha: true
                }}
                dpr={[1, 1.5]}
                frameloop="always"
                onCreated={(state) => {
                    console.log('✨ Canvas WebGL context created');
                    state.gl.setClearColor('#020617', 1);
                }}
            >
                <ambientLight intensity={0.5} />
                <OrbMesh dataRef={dataRef} />

                <EffectComposer disableNormalPass>
                    <Bloom
                        luminanceThreshold={0.2}
                        mipmapBlur
                        intensity={1.5}
                        radius={0.6}
                    />
                </EffectComposer>
            </Canvas>
        </div>
    );
});

export default DynamicOrb;
