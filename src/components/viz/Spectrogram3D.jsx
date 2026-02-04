import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const SpectrogramMesh = ({ dataRef }) => {
    const meshRef = useRef();
    const numCols = 64; // Time steps
    const numRows = 64; // Frequency bins

    // Create geometry and initial positions
    const { positions, indices, uvs } = useMemo(() => {
        const pos = [];
        const ind = [];
        const uv = [];

        for (let i = 0; i < numCols; i++) {
            for (let j = 0; j < numRows; j++) {
                const x = (i / (numCols - 1)) * 10 - 5;
                const z = (j / (numRows - 1)) * 10 - 5;
                const y = 0;
                pos.push(x, y, z);
                uv.push(i / (numCols - 1), j / (numRows - 1));
            }
        }

        for (let i = 0; i < numCols - 1; i++) {
            for (let j = 0; j < numRows - 1; j++) {
                const a = i * numRows + j;
                const b = (i + 1) * numRows + j;
                const c = i * numRows + (j + 1);
                const d = (i + 1) * numRows + (j + 1);

                ind.push(a, b, d);
                ind.push(a, d, c);
            }
        }

        return {
            positions: new Float32Array(pos),
            indices: new Uint16Array(ind),
            uvs: new Float32Array(uv)
        };
    }, []);

    // Buffer for historical data
    const historyRef = useRef(null);
    useEffect(() => {
        historyRef.current = new Float32Array(numCols * numRows);
    }, []);
    if (!historyRef.current) {
        historyRef.current = new Float32Array(numCols * numRows);
    }

    // Optimization: Pre-calculated LUT for frequency mapping
    const lutRef = useRef(null);

    useFrame(() => {
        if (!meshRef.current || !meshRef.current.geometry || !meshRef.current.geometry.attributes) return;

        // Shift history
        const history = historyRef.current;
        if (!history) return;

        // Move everything back one column
        history.copyWithin(0, numRows);

        // Add new data at the end
        const spectrum = dataRef.current?.spectrum;
        if (spectrum && spectrum.length > 0) {
            // Build LUT if needed (runs once)
            if (!lutRef.current) {
                const maxIndex = spectrum.length;
                const targetMaxFreq = 8000;
                const sampleRate = 16000;
                const maxTargetIndex = Math.floor(maxIndex * targetMaxFreq / (sampleRate / 2));

                lutRef.current = new Uint16Array(numRows);
                for (let j = 0; j < numRows; j++) {
                    lutRef.current[j] = Math.floor((j / numRows) * maxTargetIndex);
                }
            }

            const lut = lutRef.current;
            const log10inv = 0.4342944819 * 0.5; // (1 / ln(10)) * 0.5

            for (let j = 0; j < numRows; j++) {
                const val = spectrum[lut[j]] || 0;
                // Fast log approximation: Math.log is faster than Math.log10
                const intensity = Math.log(val + 1) * log10inv;
                history[(numCols - 1) * numRows + j] = intensity;
            }
        } else {
            // Silence
            for (let j = 0; j < numRows; j++) {
                history[(numCols - 1) * numRows + j] = 0;
            }
        }

        // Update geometry positions directly in the buffer
        const positionsAttribute = meshRef.current.geometry.attributes.position;
        if (positionsAttribute) {
            const posArray = positionsAttribute.array;
            const count = numCols * numRows;

            for (let i = 0; i < count; i++) {
                // Y is at index * 3 + 1
                posArray[i * 3 + 1] = history[i];
            }
            positionsAttribute.needsUpdate = true;
        }

        // Update colors based on height
        let colorsAttribute = meshRef.current.geometry.attributes.color;
        if (!colorsAttribute) {
            const colors = new Float32Array(numCols * numRows * 3);
            meshRef.current.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            colorsAttribute = meshRef.current.geometry.attributes.color;
        }

        if (colorsAttribute) {
            const colorArray = colorsAttribute.array;
            const count = numCols * numRows;

            for (let i = 0; i < count; i++) {
                const val = history[i];
                // Color map: Blue -> Purple -> Red -> Yellow
                // HSL: H = 0.7 - t * 0.6, S = 1, L = 0.5

                const t = val < 2 ? val * 0.5 : 1; // Math.min(1, val / 2)
                const h = 0.7 - t * 0.6;

                // Fast HSL to RGB (S=1, L=0.5)
                // When L=0.5, S=1: R,G,B = (1 - |H' - 1|), etc.
                // Simplified:
                // q = 1
                // p = 0
                // r = hue2rgb(0, 1, h + 1/3)

                // Helper inline hue2rgb for S=1, L=0.5:
                // t < 0: t+=1; t > 1: t-=1
                // if t < 1/6 return 6 * t
                // if t < 1/2 return 1
                // if t < 2/3 return 4 - 6 * t
                // return 0

                let r = 0, g = 0, b = 0;

                // R
                let th = h + 0.33333;
                if (th > 1) th -= 1;
                if (th < 0.16666) r = 6 * th;
                else if (th < 0.5) r = 1;
                else if (th < 0.66666) r = 4 - 6 * th; // (2/3 - t) * 6

                // G
                th = h;
                if (th < 0.16666) g = 6 * th;
                else if (th < 0.5) g = 1;
                else if (th < 0.66666) g = 4 - 6 * th;

                // B
                th = h - 0.33333;
                if (th < 0) th += 1;
                if (th < 0.16666) b = 6 * th;
                else if (th < 0.5) b = 1;
                else if (th < 0.66666) b = 4 - 6 * th;

                const idx = i * 3;
                colorArray[idx] = r;
                colorArray[idx + 1] = g;
                colorArray[idx + 2] = b;
            }
            colorsAttribute.needsUpdate = true;
        }
    });

    return (
        <mesh ref={meshRef}>
            {/* eslint-disable react/no-unknown-property */}
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="index"
                    count={indices.length}
                    array={indices}
                    itemSize={1}
                />
                <bufferAttribute
                    attach="attributes-uv"
                    count={uvs.length / 2}
                    array={uvs}
                    itemSize={2}
                />
            </bufferGeometry>
            <meshStandardMaterial
                vertexColors
                wireframe={true}
                roughness={0.4}
                metalness={0.6}
            />
        </mesh>
    );
};

const Spectrogram3D = ({ dataRef }) => {
    return (
        <div className="h-full w-full bg-black rounded-xl overflow-hidden relative">
            <Canvas>
                <PerspectiveCamera makeDefault position={[8, 5, 8]} fov={50} />
                <OrbitControls
                    autoRotate
                    autoRotateSpeed={0.5}
                    enableZoom={true}
                    maxPolarAngle={Math.PI / 2 - 0.1}
                />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <SpectrogramMesh dataRef={dataRef} />
                <gridHelper args={[20, 20, 0x444444, 0x222222]} position={[0, -0.1, 0]} />
            </Canvas>
            <div className="absolute bottom-2 right-2 text-[10px] text-white/50 font-mono pointer-events-none">
                3D Visualization
            </div>
        </div>
    );
};

export default Spectrogram3D;
