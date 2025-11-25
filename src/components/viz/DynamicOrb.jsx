import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Diamond, Flame } from 'lucide-react';
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
  float noiseFreq = 0.5 + u_roughness * 2.0;
  float time = u_time * (0.1 + u_amplitude * 0.3);
  float n1 = snoise(position * noiseFreq + time);
  float n2 = snoise(position * (noiseFreq * 2.0) - time);
  float finalNoise = mix(n1, abs(n2) * 2.0 - 1.0, u_roughness * 0.7);
  vNoise = finalNoise;
  float breathe = 1.0 + u_amplitude * 0.2;
  float displacement = finalNoise * (0.1 + u_amplitude * 0.5);
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
varying float vDisplacement;
varying vec3 vNormal;
varying float vNoise;
varying vec3 vViewPosition;

void main() {
  vec3 colorDeep = vec3(0.0, 0.5, 0.6);
  vec3 colorMasc = vec3(0.0, 1.0, 1.0);
  vec3 colorFem = vec3(0.8, 0.2, 1.0);
  vec3 colorBright = vec3(1.0, 0.3, 0.9);

  vec3 baseColor;
  if (u_pitch_norm < 0.33) baseColor = mix(colorDeep, colorMasc, u_pitch_norm * 3.0);
  else if (u_pitch_norm < 0.66) baseColor = mix(colorMasc, colorFem, (u_pitch_norm - 0.33) * 3.0);
  else baseColor = mix(colorFem, colorBright, (u_pitch_norm - 0.66) * 3.0);

  vec3 fdx = dFdx(vViewPosition);
  vec3 fdy = dFdy(vViewPosition);
  vec3 faceNormal = normalize(cross(fdx, fdy));
  vec3 finalNormal = normalize(mix(vNormal, faceNormal, 0.85));

  vec3 viewDir = normalize(cameraPosition - vViewPosition);
  float fresnel = pow(1.0 - abs(dot(finalNormal, viewDir)), 2.5);
  vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
  vec3 reflectDir = reflect(-lightDir, finalNormal);
  float spec1 = pow(max(dot(viewDir, reflectDir), 0.0), 64.0);
  vec3 lightDir2 = normalize(vec3(-0.5, 1.0, 0.5));
  vec3 reflectDir2 = reflect(-lightDir2, finalNormal);
  float spec2 = pow(max(dot(viewDir, reflectDir2), 0.0), 32.0);
  float subsurface = pow(max(dot(-viewDir, finalNormal), 0.0), 2.0);
  float alpha = 0.4 + u_weight * 0.6;
  vec3 gemColor = baseColor * 0.8;
  gemColor += baseColor * vNoise * 0.15;
  gemColor += baseColor * fresnel * 3.0;
  gemColor += vec3(1.0) * spec1 * 2.0;
  gemColor += baseColor * spec2 * 0.8;
  gemColor += baseColor * subsurface * 0.5;
  gemColor *= (0.9 + u_intensity * 0.6);
  gl_FragColor = vec4(gemColor, alpha);
}
`;

// FIRE SHADER
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

const VisualizerMesh = ({ mode, dataRef }) => {
    const mesh = useRef();
    const material = useRef();

    const uniforms = useMemo(() => ({
        u_time: { value: 0 },
        u_amplitude: { value: 0 },
        u_roughness: { value: 0 },
        u_pitch_norm: { value: 0 },
        u_weight: { value: 0.5 },
        u_intensity: { value: 0 }
    }), []);

    const shaders = useMemo(() => {
        switch (mode) {
            case 'fire': return { v: fireVertex, f: fireFragment };
            case 'gem':
            default: return { v: gemVertex, f: gemFragment };
        }
    }, [mode]);

    useFrame((state) => {
        if (!mesh.current || !material.current || !dataRef.current) return;

        const { pitch, resonance, weight, volume } = dataRef.current;
        const vol = volume || 0;
        const smoothedVol = THREE.MathUtils.lerp(uniforms.u_amplitude.value, vol, 0.15);
        const pitchVal = pitch || 150;
        const pitchNorm = (Math.max(85, Math.min(255, pitchVal)) - 85) / 170;
        const smoothedPitch = THREE.MathUtils.lerp(uniforms.u_pitch_norm.value, pitchNorm, 0.08);
        const resVal = resonance || 500;
        const resNorm = Math.max(0, Math.min(1, (resVal - 400) / 1600));
        const smoothedRes = THREE.MathUtils.lerp(uniforms.u_roughness.value, resNorm, 0.08);
        const weightVal = weight !== undefined ? weight : 0.5;
        const smoothedWeight = THREE.MathUtils.lerp(uniforms.u_weight.value, weightVal, 0.1);

        uniforms.u_time.value = state.clock.elapsedTime;
        uniforms.u_amplitude.value = smoothedVol;
        uniforms.u_pitch_norm.value = smoothedPitch;
        uniforms.u_roughness.value = smoothedRes;
        uniforms.u_weight.value = smoothedWeight;
        uniforms.u_intensity.value = smoothedVol;

        mesh.current.rotation.y += 0.002 + smoothedVol * 0.01;
        if (mode === 'gem') mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    });

    return (
        <mesh ref={mesh}>
            {mode === 'gem' ? (
                <octahedronGeometry args={[1.8, 0]} />
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

const DynamicOrb = React.memo(({ dataRef }) => {
    const [mode, setMode] = useState('gem');

    const modes = [
        { id: 'gem', icon: Diamond, label: 'Gem' },
        { id: 'fire', icon: Flame, label: 'Fire' },
    ];

    return (
        <div className="w-full h-full relative group">
            <OrbLegend mode={mode} />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 p-2 rounded-full bg-slate-900/50 backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
            </div>
            <Canvas
                camera={{ position: [0, 0, 5], fov: 50 }}
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
                <VisualizerMesh key={mode} mode={mode} dataRef={dataRef} />
            </Canvas>
        </div>
    );
});

export default DynamicOrb;
