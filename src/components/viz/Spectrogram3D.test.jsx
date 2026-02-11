import { render, cleanup, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import Spectrogram3D from './Spectrogram3D';
import * as THREE from 'three';

// Mock Three.js to avoid WebGL context issues in tests
vi.mock('three', async () => {
    const actual = await vi.importActual('three');
    return {
        ...actual,
        Color: class {
            constructor() {
                this.r = 0;
                this.g = 0;
                this.b = 0;
            }
            setHSL(h, s, l) {
                // Mock implementation
                this.r = h;
                this.g = s;
                this.b = l;
            }
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

// Mock Canvas and useFrame
// Also mock primitives to avoid console warnings about unknown elements
vi.mock('@react-three/fiber', () => ({
    Canvas: ({ children }) => <div>{children}</div>,
    useFrame: (cb) => {
        // Expose callback for testing
        globalThis.mockUseFrameCallback = cb;
    }
}));

// Mock Drei
vi.mock('@react-three/drei', () => ({
    OrbitControls: () => null,
    PerspectiveCamera: () => null
}));

// Setup global requestAnimationFrame mock
globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 16);

describe('Spectrogram3D', () => {
    let dataRef;

    beforeEach(() => {
        dataRef = {
            current: {
                spectrum: new Float32Array(1024).fill(0.5)
            }
        };
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
        delete globalThis.mockUseFrameCallback;
    });

    it('renders successfully', () => {
        render(<Spectrogram3D dataRef={dataRef} />);
        expect(screen.getByText(/3D Visualization/i)).toBeDefined();
    });

    it('runs the animation loop safely', () => {
        render(<Spectrogram3D dataRef={dataRef} />);

        // Ensure useFrame callback was captured
        expect(globalThis.mockUseFrameCallback).toBeDefined();

        // Execute the frame callback (simulation)
        // This should not throw even if meshRef is undefined (thanks to our safety checks)
        if (globalThis.mockUseFrameCallback) {
            expect(() => globalThis.mockUseFrameCallback()).not.toThrow();
        }
    });
});
