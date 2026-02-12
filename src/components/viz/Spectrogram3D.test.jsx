import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Spectrogram3D from './Spectrogram3D';
import { renderCoordinator } from '../../services/RenderCoordinator';
import React from 'react';

// Mock dependencies
vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn(() => vi.fn()),
        PRIORITY: { LOW: 3 }
    }
}));

// Mock Three.js
vi.mock('three', () => {
    return {
        Scene: vi.fn(),
        PerspectiveCamera: vi.fn(),
        WebGLRenderer: vi.fn(() => ({
            setSize: vi.fn(),
            render: vi.fn(),
            domElement: document.createElement('canvas'),
            dispose: vi.fn()
        })),
        Color: vi.fn(),
        FogExp2: vi.fn(),
        BufferGeometry: vi.fn(() => ({
            setAttribute: vi.fn(),
            setIndex: vi.fn()
        })),
        Float32BufferAttribute: vi.fn(),
        MeshStandardMaterial: vi.fn(),
        Mesh: vi.fn(() => ({
            rotation: { x: 0 },
            position: { y: 0 }
        })),
        AmbientLight: vi.fn(),
        DirectionalLight: vi.fn(() => ({
            position: { set: vi.fn() }
        })),
        GridHelper: vi.fn()
    };
});

// Mock requestAnimationFrame
const mockRequestAnimationFrame = vi.fn();
globalThis.requestAnimationFrame = mockRequestAnimationFrame;

describe('Spectrogram3D', () => {
    let dataRef;

    beforeEach(() => {
        dataRef = { current: { spectrum: new Uint8Array(1024).fill(0) } };
        // Mock container dimensions
        Element.prototype.getBoundingClientRect = vi.fn(() => ({
            width: 800,
            height: 600,
            top: 0,
            left: 0
        }));
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders successfully', () => {
        const { container } = render(<Spectrogram3D dataRef={dataRef} />);
        expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('subscribes to RenderCoordinator', async () => {
        render(<Spectrogram3D dataRef={dataRef} />);
        await new Promise(resolve => setTimeout(resolve, 0));
        expect(renderCoordinator.subscribe).toHaveBeenCalled();
    });
});
