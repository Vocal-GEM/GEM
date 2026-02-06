import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// Generate LUT once outside component
// This avoids creating temporary Color objects and performing HSL->RGB math 4096 times per frame
const COLOR_LUT = new Float32Array(256 * 3);
const _tempColor = new THREE.Color();
for (let i = 0; i < 256; i++) {
    const t = i / 255;
    // Match original logic: tempColor.setHSL(0.7 - t * 0.6, 1, 0.5);
    _tempColor.setHSL(0.7 - t * 0.6, 1, 0.5);
    COLOR_LUT[i * 3] = _tempColor.r;
    COLOR_LUT[i * 3 + 1] = _tempColor.g;
    COLOR_LUT[i * 3 + 2] = _tempColor.b;
}

const SpectrogramMesh = ({ dataRef }) => {
    const meshRef = useRef();
    const numCols = 64; // Time steps
    const numRows = 64; // Frequency bins

    // Create geometry and initial positions
    const { positions, indices, uvs, colors } = useMemo(() => {
        const pos = [];
        const ind = [];
        const uv = [];
        // Pre-allocate colors buffer (Float32Array for r,g,b)
        const col = new Float32Array(numCols * numRows * 3);

        for (let i = 0; i < numCols; i++) {
            for (let j = 0; j < numRows; j++) {
                const x = (i / (numCols - 1)) * 10 - 5;
                const z = (j / (numRows - 1)) * 10 - 5;
                const y = 0;
                pos.push(x, y, z);
                uv.push(i / (numCols - 1), j / (numRows - 1));

                // Initialize color to base color (first entry of LUT)
                const idx = (i * numRows + j) * 3;
                col[idx] = COLOR_LUT[0];
                col[idx + 1] = COLOR_LUT[1];
                col[idx + 2] = COLOR_LUT[2];
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
            colors: col
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
        const geometry = meshRef.current.geometry;
        const positionsAttribute = geometry.attributes.position;
        const colorsAttribute = geometry.attributes.color;

        if (positionsAttribute && colorsAttribute) {
            const posArray = positionsAttribute.array;
            const colArray = colorsAttribute.array;

            for (let i = 0; i < numCols; i++) {
                for (let j = 0; j < numRows; j++) {
                    const index = i * numRows + j;
                    const val = history[index];

                    // Update Y coordinate directly in the typed array
                    // Position is [x, y, z], so y is at index * 3 + 1
                    posArray[index * 3 + 1] = val;

                    // Update colors based on height using LUT
                    // Normalize val (roughly 0-2) to 0-255 index
                    let lutIndex = Math.floor(val * 127.5); // val/2 * 255
                    if (lutIndex > 255) lutIndex = 255;
                    if (lutIndex < 0) lutIndex = 0;

                    const lutOffset = lutIndex * 3;
                    const colOffset = index * 3;

                    // Direct copy from LUT to attribute buffer
                    colArray[colOffset] = COLOR_LUT[lutOffset];
                    colArray[colOffset + 1] = COLOR_LUT[lutOffset + 1];
                    colArray[colOffset + 2] = COLOR_LUT[lutOffset + 2];
                }
            }
            positionsAttribute.needsUpdate = true;
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
