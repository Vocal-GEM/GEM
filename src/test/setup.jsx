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
            getFloatFrequencyData: vi.fn(),
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
    createBuffer(channels, length, sampleRate) {
        return {
            numberOfChannels: channels,
            length: length,
            sampleRate: sampleRate,
            getChannelData: vi.fn().mockReturnValue(new Float32Array(length)),
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
const createIDBRequest = (result) => {
    const request = {
        result,
        error: null,
        source: null,
        transaction: null,
        readyState: 'done',
        onsuccess: null,
        onerror: null,
    };
    // Simulate async success
    Promise.resolve().then(() => {
        if (request.onsuccess) {
            request.onsuccess({ target: request });
        }
    });
    return request;
};

const indexedDBMock = {
    open: vi.fn().mockImplementation(() => createIDBRequest({
        objectStoreNames: {
            contains: vi.fn().mockReturnValue(true),
        },
        createObjectStore: vi.fn().mockReturnValue({
            createIndex: vi.fn(),
        }),
        transaction: vi.fn().mockReturnValue({
            objectStore: vi.fn().mockReturnValue({
                get: vi.fn().mockImplementation(() => createIDBRequest(null)),
                getAll: vi.fn().mockImplementation(() => createIDBRequest([])),
                put: vi.fn().mockImplementation(() => createIDBRequest(1)),
                add: vi.fn().mockImplementation(() => createIDBRequest(1)),
                delete: vi.fn().mockImplementation(() => createIDBRequest(undefined)),
                clear: vi.fn().mockImplementation(() => createIDBRequest(undefined)),
                count: vi.fn().mockImplementation(() => createIDBRequest(0)),
            }),
        }),
        close: vi.fn(),
    })),
};
global.indexedDB = indexedDBMock;
global.window.indexedDB = indexedDBMock;

// Mock Lucide React
vi.mock('lucide-react', async (importOriginal) => {
    const actual = await importOriginal();
    const { default: React } = await import('react');

    // Helper to create a mock icon
    const createIcon = (name) => {
        const MockIcon = (props) => React.createElement('svg', {
            ...props,
            'data-testid': `icon-${name}`,
            role: 'img'
        });
        MockIcon.displayName = `MockIcon${name.charAt(0).toUpperCase() + name.slice(1)}`;
        return MockIcon;
    };

    return {
        ...actual,
        // Explicitly mock common icons used in the app
        Zap: createIcon('zap'),
        Activity: createIcon('activity'),
        User: createIcon('user'),
        Settings: createIcon('settings'),
        LogOut: createIcon('log-out'),
        Menu: createIcon('menu'),
        X: createIcon('x'),
        ChevronLeft: createIcon('chevron-left'),
        ChevronRight: createIcon('chevron-right'),
        Play: createIcon('play'),
        Pause: createIcon('pause'),
        Mic: createIcon('mic'),
        Volume2: createIcon('volume-2'),
        Trophy: createIcon('trophy'),
        Calendar: createIcon('calendar'),
        Clock: createIcon('clock'),
        BarChart2: createIcon('bar-chart-2'),
        Droplets: createIcon('droplets'),
        HeartPulse: createIcon('heart-pulse'),
        Moon: createIcon('moon'),
        AlertTriangle: createIcon('alert-triangle'),
        Music: createIcon('music'),
        Stethoscope: createIcon('stethoscope'),
        Utensils: createIcon('utensils'),
        Wind: createIcon('wind'),
        // Add minimal generic fallback if feasible, but better to be explicit to avoid Proxy loops
    };
});
