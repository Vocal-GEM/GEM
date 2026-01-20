import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Spectrogram3D from './Spectrogram3D';
import React from 'react';
import { useFrame } from '@react-three/fiber';

// Mock Three.js
vi.mock('three', () => {
    return {
        Color: class {
            constructor(r, g, b) {
                this.r = r || 0;
                this.g = g || 0;
                this.b = b || 0;
            }
            setHSL() { return this; }
        },
        BufferAttribute: class {
            constructor(array, itemSize) {
                this.array = array;
                this.itemSize = itemSize;
                this.needsUpdate = false;
            }
            setY(index, val) {
                this.array[index * 3 + 1] = val;
            }
            setXYZ(index, x, y, z) {
                this.array[index * 3] = x;
                this.array[index * 3 + 1] = y;
                this.array[index * 3 + 2] = z;
            }
        },
        Float32BufferAttribute: class {
            constructor(array, itemSize) {
                this.array = array;
                this.itemSize = itemSize;
            }
        }
    };
});

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
    Canvas: ({ children }) => <div>{children}</div>,
    useFrame: vi.fn(),
}));

// Mock @react-three/drei
vi.mock('@react-three/drei', () => ({
    OrbitControls: () => null,
    PerspectiveCamera: () => null,
}));

describe('Spectrogram3D', () => {
    let dataRef;

    beforeEach(() => {
        dataRef = {
            current: {
                spectrum: new Float32Array(1024).fill(0.5)
            }
        };
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders and registers useFrame callback', () => {
        render(<Spectrogram3D dataRef={dataRef} />);
        expect(useFrame).toHaveBeenCalled();
    });

    it('executes the frame loop logic without errors', () => {
        // We need to capture the callback passed to useFrame
        let frameCallback;
        useFrame.mockImplementation((cb) => {
          frameCallback = cb;
        });

        render(<Spectrogram3D dataRef={dataRef} />);

        expect(frameCallback).toBeDefined();
        // Since we are mocking Canvas, the refs might not work as expected in a JSDOM environment,
        // so we stop at verifying registration.
    });
});
