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

    // Optimization: Pre-compute color lookup table (LUT) to avoid 4096 HSL conversions per frame
    // We map 't' (0..1) to 256 discrete colors
    const colorLUT = useMemo(() => {
        const lut = new Float32Array(256 * 3);
        const color = new THREE.Color();
        for (let i = 0; i < 256; i++) {
            const t = i / 255;
            // Same logic: 0.7 (Blue) -> 0.1 (Orange)
            color.setHSL(0.7 - t * 0.6, 1, 0.5);
            lut[i * 3] = color.r;
            lut[i * 3 + 1] = color.g;
            lut[i * 3 + 2] = color.b;
        }
        return lut;
    }, []);

    useFrame(() => {
        if (!meshRef.current || !meshRef.current.geometry || !meshRef.current.geometry.attributes) return;

        // Shift history
        const history = historyRef.current;
        if (!history) return;

        // Move everything back one column
        history.copyWithin(0, numRows);

        // Add new data at the end
        const spectrum = dataRef.current?.spectrum;
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
                // Store in last column of history
                history[(numCols - 1) * numRows + j] = intensity;
            }
        } else {
            // Silence
            for (let j = 0; j < numRows; j++) {
                history[(numCols - 1) * numRows + j] = 0;
            }
        }

        // Update geometry
        const positionsAttribute = meshRef.current.geometry.attributes.position;
        if (positionsAttribute) {
            const positionsArray = positionsAttribute.array;
            for (let i = 0; i < numCols; i++) {
                for (let j = 0; j < numRows; j++) {
                    const index = i * numRows + j;
                    const val = history[index];
                    // Update Y coordinate directly in the buffer
                    // positions are stored as [x, y, z, x, y, z, ...]
                    positionsArray[index * 3 + 1] = val;
                }
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
            const colorsArray = colorsAttribute.array;
            for (let i = 0; i < numCols; i++) {
                for (let j = 0; j < numRows; j++) {
                    const index = i * numRows + j;
                    const val = history[index];

                    // Color map: Blue -> Purple -> Red -> Yellow
                    const t = Math.min(1, val / 2); // Normalize somewhat

                    // Map t (0..1) to LUT index (0..255)
                    const lutIndex = Math.floor(t * 255);

                    // Direct buffer write from LUT
                    const r = colorLUT[lutIndex * 3];
                    const g = colorLUT[lutIndex * 3 + 1];
                    const b = colorLUT[lutIndex * 3 + 2];

                    colorsArray[index * 3] = r;
                    colorsArray[index * 3 + 1] = g;
                    colorsArray[index * 3 + 2] = b;
                }
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
