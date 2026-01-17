import { render, cleanup } from '@testing-library/react';
import { describe, it, vi, afterEach } from 'vitest';
import Spectrogram3D from './Spectrogram3D';
import React from 'react';

// Mock three.js
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
        BufferAttribute: class {},
        Float32BufferAttribute: class {},
    };
});

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
    Canvas: ({ children }) => <div>{children}</div>,
    useFrame: (callback) => {
        // No-op for smoke test
        return null;
    },
}));

// Mock @react-three/drei
vi.mock('@react-three/drei', () => ({
    OrbitControls: () => null,
    PerspectiveCamera: () => null,
}));

describe('Spectrogram3D', () => {
    afterEach(cleanup);

    it('renders without crashing', () => {
        const dataRef = { current: { spectrum: new Array(100).fill(0) } };
        render(<Spectrogram3D dataRef={dataRef} />);
    });
});
