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
vi.mock('lucide-react', () => {
    const React = require('react');

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
        // Explicitly mock all icons used in the app (alphabetically sorted for maintainability)
        Activity: createIcon('activity'),
        AlertCircle: createIcon('alert-circle'),
        AlertTriangle: createIcon('alert-triangle'),
        ArrowDown: createIcon('arrow-down'),
        ArrowLeft: createIcon('arrow-left'),
        ArrowRight: createIcon('arrow-right'),
        ArrowUp: createIcon('arrow-up'),
        BarChart2: createIcon('bar-chart-2'),
        Battery: createIcon('battery'),
        Book: createIcon('book'),
        BookOpen: createIcon('book-open'),
        Bot: createIcon('bot'),
        Bug: createIcon('bug'),
        Calendar: createIcon('calendar'),
        Camera: createIcon('camera'),
        Check: createIcon('check'),
        CheckCircle: createIcon('check-circle'),
        ChevronDown: createIcon('chevron-down'),
        ChevronLeft: createIcon('chevron-left'),
        ChevronRight: createIcon('chevron-right'),
        ChevronUp: createIcon('chevron-up'),
        Circle: createIcon('circle'),
        ClipboardCheck: createIcon('clipboard-check'),
        Clock: createIcon('clock'),
        Command: createIcon('command'),
        Diamond: createIcon('diamond'),
        Droplets: createIcon('droplets'),
        Dumbbell: createIcon('dumbbell'),
        ExternalLink: createIcon('external-link'),
        FileText: createIcon('file-text'),
        Flame: createIcon('flame'),
        FlaskConical: createIcon('flask-conical'),
        Gauge: createIcon('gauge'),
        Heart: createIcon('heart'),
        HeartPulse: createIcon('heart-pulse'),
        History: createIcon('history'),
        Home: createIcon('home'),
        Info: createIcon('info'),
        Languages: createIcon('languages'),
        Layers: createIcon('layers'),
        LayoutGrid: createIcon('layout-grid'),
        Lightbulb: createIcon('lightbulb'),
        Loader2: createIcon('loader-2'),
        LogOut: createIcon('log-out'),
        Menu: createIcon('menu'),
        MessageSquare: createIcon('message-square'),
        Mic: createIcon('mic'),
        Mic2: createIcon('mic-2'),
        Minus: createIcon('minus'),
        Moon: createIcon('moon'),
        Music: createIcon('music'),
        Music2: createIcon('music-2'),
        Pause: createIcon('pause'),
        Play: createIcon('play'),
        Plus: createIcon('plus'),
        RefreshCw: createIcon('refresh-cw'),
        Repeat: createIcon('repeat'),
        RotateCcw: createIcon('rotate-ccw'),
        Search: createIcon('search'),
        Send: createIcon('send'),
        Server: createIcon('server'),
        Settings: createIcon('settings'),
        Share2: createIcon('share-2'),
        SkipForward: createIcon('skip-forward'),
        Sliders: createIcon('sliders'),
        Sparkles: createIcon('sparkles'),
        Speaker: createIcon('speaker'),
        Square: createIcon('square'),
        Star: createIcon('star'),
        Stethoscope: createIcon('stethoscope'),
        Sun: createIcon('sun'),
        Target: createIcon('target'),
        ThumbsDown: createIcon('thumbs-down'),
        ThumbsUp: createIcon('thumbs-up'),
        Timer: createIcon('timer'),
        TrendingDown: createIcon('trending-down'),
        TrendingUp: createIcon('trending-up'),
        Trophy: createIcon('trophy'),
        Type: createIcon('type'),
        Undo2: createIcon('undo-2'),
        Upload: createIcon('upload'),
        User: createIcon('user'),
        Users: createIcon('users'),
        Utensils: createIcon('utensils'),
        Volume2: createIcon('volume-2'),
        Wand2: createIcon('wand-2'),
        Waves: createIcon('waves'),
        Wifi: createIcon('wifi'),
        WifiOff: createIcon('wifi-off'),
        Wind: createIcon('wind'),
        X: createIcon('x'),
        XCircle: createIcon('x-circle'),
        Zap: createIcon('zap'),
    };
});
