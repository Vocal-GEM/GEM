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

    // Optimization: Pre-calculate Color Look-Up Table (LUT)
    // Avoids 4096 setHSL calculations per frame
    const LUT_SIZE = 256;
    const colorLUT = useMemo(() => {
        const lut = new Float32Array(LUT_SIZE * 3);
        const tempColor = new THREE.Color();
        for (let i = 0; i < LUT_SIZE; i++) {
            const t = i / (LUT_SIZE - 1);
            // Map: Blue (0.7) -> Orange (0.1)
            tempColor.setHSL(0.7 - t * 0.6, 1, 0.5);
            lut[i * 3] = tempColor.r;
            lut[i * 3 + 1] = tempColor.g;
            lut[i * 3 + 2] = tempColor.b;
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
            const posArray = positionsAttribute.array;
            for (let i = 0; i < numCols; i++) {
                for (let j = 0; j < numRows; j++) {
                    const index = i * numRows + j;
                    const val = history[index];
                    // Optimization: Direct array write is faster than setY
                    posArray[index * 3 + 1] = val;
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

                    // Optimization: Use LUT instead of setHSL
                    const lutIndex = Math.floor(t * (LUT_SIZE - 1));
                    const lutOffset = lutIndex * 3;
                    const bufOffset = index * 3;

                    // Direct buffer write
                    colorsArray[bufOffset] = colorLUT[lutOffset];
                    colorsArray[bufOffset + 1] = colorLUT[lutOffset + 1];
                    colorsArray[bufOffset + 2] = colorLUT[lutOffset + 2];
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
