import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const SpectrogramMesh = ({ dataRef }) => {
    const meshRef = useRef();
    const numCols = 64; // Time steps
    const numRows = 64; // Frequency bins

    // Optimization: Pre-calculate Color Look-Up Table (LUT)
    // Avoids expensive THREE.Color.setHSL() calls and object creation in the render loop.
    const colorLUT = useMemo(() => {
        const lut = new Float32Array(1001 * 3);
        const color = new THREE.Color();
        for (let i = 0; i <= 1000; i++) {
            const t = i / 1000;
            // Blue (0.7) to Orange (0.1)
            color.setHSL(0.7 - t * 0.6, 1, 0.5);
            lut[i * 3] = color.r;
            lut[i * 3 + 1] = color.g;
            lut[i * 3 + 2] = color.b;
        }
        return lut;
    }, []);

    // Create geometry and initial positions
    const { positions, indices, uvs, colors } = useMemo(() => {
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
            uvs: new Float32Array(uv),
            colors: new Float32Array(pos.length) // Pre-allocate colors buffer
        };
    }, []);

    // Buffer for historical data
    const historyRef = useRef(null);
    if (!historyRef.current) {
        historyRef.current = new Float32Array(numCols * numRows);
    }

    useFrame(() => {
        if (!meshRef.current || !meshRef.current.geometry) return;

        const geometry = meshRef.current.geometry;
        // Optimization: Direct array access avoids function call overhead
        const positions = geometry.attributes.position.array;
        const colors = geometry.attributes.color.array;
        const history = historyRef.current;

        // Shift history: Move everything back one column
        // copyWithin is highly optimized in V8
        history.copyWithin(0, numRows);

        // Add new data at the end
        const spectrum = dataRef.current?.spectrum;
        const lastColOffset = (numCols - 1) * numRows;

        if (spectrum) {
            const maxIndex = spectrum.length;
            const targetMaxFreq = 8000;
            const sampleRate = 16000;
            const maxTargetIndex = Math.floor(maxIndex * targetMaxFreq / (sampleRate / 2));

            for (let j = 0; j < numRows; j++) {
                // Map row to frequency
                const mappedIndex = Math.floor((j / numRows) * maxTargetIndex);
                const val = spectrum[mappedIndex] || 0;
                // Log scale intensity
                const intensity = Math.log10(val + 1) * 0.5;
                history[lastColOffset + j] = intensity;
            }
        } else {
            // Silence
            for (let j = 0; j < numRows; j++) {
                history[lastColOffset + j] = 0;
            }
        }

        // Optimization: Single loop to update both position and color
        // Removes O(N) loop overhead and uses LUT for O(1) color lookup
        const total = numCols * numRows;
        for (let i = 0; i < total; i++) {
            const val = history[i];

            // Update Y coordinate (index * 3 + 1 is Y)
            positions[i * 3 + 1] = val;

            // Update Color using LUT
            // Map value to LUT index (0-1000)
            const t = val > 2 ? 1 : val * 0.5; // Optimized clamp: Math.min(1, val/2)
            const lutIndex = (t * 1000 | 0) * 3; // | 0 is fast floor

            const i3 = i * 3;
            colors[i3] = colorLUT[lutIndex];
            colors[i3 + 1] = colorLUT[lutIndex + 1];
            colors[i3 + 2] = colorLUT[lutIndex + 2];
        }

        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.color.needsUpdate = true;
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
                    attach="attributes-color"
                    count={colors.length / 3}
                    array={colors}
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
