/* eslint-env node, jest */
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock AudioContext
class AudioContextMock {
    constructor() {
        this.state = 'suspended';
        this.sampleRate = 44100;
        this.destination = {};
    }
    createAnalyser() {
        return {
            connect: vi.fn(),
            disconnect: vi.fn(),
            fftSize: 2048,
            frequencyBinCount: 1024,
            getFloatTimeDomainData: vi.fn(),
            getByteFrequencyData: vi.fn(),
        };
    }
    createOscillator() {
        return {
            connect: vi.fn(),
            start: vi.fn(),
            stop: vi.fn(),
            frequency: { value: 440 },
        };
    }
    createGain() {
        return {
            connect: vi.fn(),
            gain: { value: 1 },
        };
    }
    resume() {
        this.state = 'running';
        return Promise.resolve();
    }
    suspend() {
        this.state = 'suspended';
        return Promise.resolve();
    }
}

global.AudioContext = AudioContextMock;
global.window.AudioContext = AudioContextMock;
global.window.webkitAudioContext = AudioContextMock;

// Mock AudioWorkletNode
class AudioWorkletNodeMock {
    constructor() {
        this.port = {
            onmessage: null,
            postMessage: vi.fn(),
        };
        this.connect = vi.fn();
        this.disconnect = vi.fn();
    }
}
global.AudioWorkletNode = AudioWorkletNodeMock;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};
// Mock IndexedDB
const indexedDBMock = {
    open: vi.fn().mockReturnValue({
        result: {
            objectStoreNames: {
                contains: vi.fn(),
            },
            createObjectStore: vi.fn().mockReturnValue({
                createIndex: vi.fn(),
            }),
            transaction: vi.fn().mockReturnValue({
                objectStore: vi.fn().mockReturnValue({
                    get: vi.fn(),
                    getAll: vi.fn(),
                    put: vi.fn(),
                    add: vi.fn(),
                    delete: vi.fn(),
                    clear: vi.fn(),
                }),
            }),
        },
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
    }),
};
global.indexedDB = indexedDBMock;
global.window.indexedDB = indexedDBMock;

// Mock Lucide React
vi.mock('lucide-react', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        Zap: (props) => <svg {...props} data-testid="icon-zap" />,
        Droplets: (props) => <svg {...props} data-testid="icon-droplets" />,
        HeartPulse: (props) => <svg {...props} data-testid="icon-heart-pulse" />,
        Moon: (props) => <svg {...props} data-testid="icon-moon" />,
        AlertTriangle: (props) => <svg {...props} data-testid="icon-alert-triangle" />,
        Music: (props) => <svg {...props} data-testid="icon-music" />,
        Stethoscope: (props) => <svg {...props} data-testid="icon-stethoscope" />,
        Utensils: (props) => <svg {...props} data-testid="icon-utensils" />,
        Wind: (props) => <svg {...props} data-testid="icon-wind" />,
    };
});
