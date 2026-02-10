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
            gain: {
                value: 1,
                setTargetAtTime: vi.fn(),
                setValueAtTime: vi.fn(),
                linearRampToValueAtTime: vi.fn(),
                exponentialRampToValueAtTime: vi.fn()
            },
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
        AlignCenter: createIcon('align-center'),
        Anchor: createIcon('anchor'),
        Aperture: createIcon('aperture'),
        ArrowDown: createIcon('arrow-down'),
        ArrowDownRight: createIcon('arrow-down-right'),
        ArrowLeft: createIcon('arrow-left'),
        ArrowLeftRight: createIcon('arrow-left-right'),
        ArrowRight: createIcon('arrow-right'),
        ArrowUp: createIcon('arrow-up'),
        ArrowUpDown: createIcon('arrow-up-down'),
        ArrowUpRight: createIcon('arrow-up-right'),
        AudioWaveform: createIcon('audio-waveform'),
        Award: createIcon('award'),
        BarChart: createIcon('bar-chart'),
        BarChart2: createIcon('bar-chart-2'),
        BarChart3: createIcon('bar-chart-3'),
        Battery: createIcon('battery'),
        Bell: createIcon('bell'),
        BellOff: createIcon('bell-off'),
        Book: createIcon('book'),
        BookMarked: createIcon('book-marked'),
        BookOpen: createIcon('book-open'),
        Bot: createIcon('bot'),
        Brain: createIcon('brain'),
        Briefcase: createIcon('briefcase'),
        Bug: createIcon('bug'),
        Calendar: createIcon('calendar'),
        Camera: createIcon('camera'),
        Check: createIcon('check'),
        CheckCircle: createIcon('check-circle'),
        CheckCircle2: createIcon('check-circle-2'),
        CheckSquare: createIcon('check-square'),
        ChevronDown: createIcon('chevron-down'),
        ChevronLeft: createIcon('chevron-left'),
        ChevronRight: createIcon('chevron-right'),
        ChevronUp: createIcon('chevron-up'),
        Circle: createIcon('circle'),
        ClipboardCheck: createIcon('clipboard-check'),
        Clock: createIcon('clock'),
        Coffee: createIcon('coffee'),
        Command: createIcon('command'),
        Copy: createIcon('copy'),
        Cpu: createIcon('cpu'),
        Database: createIcon('database'),
        Diamond: createIcon('diamond'),
        Divide: createIcon('divide'),
        DoorOpen: createIcon('door-open'),
        Download: createIcon('download'),
        Droplets: createIcon('droplets'),
        Dumbbell: createIcon('dumbbell'),
        Ear: createIcon('ear'),
        Edit2: createIcon('edit-2'),
        Edit3: createIcon('edit-3'),
        ExternalLink: createIcon('external-link'),
        Eye: createIcon('eye'),
        EyeOff: createIcon('eye-off'),
        Feather: createIcon('feather'),
        FileJson: createIcon('file-json'),
        FileText: createIcon('file-text'),
        Filter: createIcon('filter'),
        Fingerprint: createIcon('fingerprint'),
        Flame: createIcon('flame'),
        FlaskConical: createIcon('flask-conical'),
        FolderPlus: createIcon('folder-plus'),
        Gamepad2: createIcon('gamepad-2'),
        Gauge: createIcon('gauge'),
        Ghost: createIcon('ghost'),
        Gift: createIcon('gift'),
        Globe: createIcon('globe'),
        Grid: createIcon('grid'),
        GripHorizontal: createIcon('grip-horizontal'),
        GripVertical: createIcon('grip-vertical'),
        Hand: createIcon('hand'),
        HardDrive: createIcon('hard-drive'),
        Headphones: createIcon('headphones'),
        Heart: createIcon('heart'),
        HeartPulse: createIcon('heart-pulse'),
        HelpCircle: createIcon('help-circle'),
        History: createIcon('history'),
        Home: createIcon('home'),
        Image: createIcon('image'),
        Info: createIcon('info'),
        Key: createIcon('key'),
        Languages: createIcon('languages'),
        Layers: createIcon('layers'),
        Layout: createIcon('layout'),
        LayoutGrid: createIcon('layout-grid'),
        Lightbulb: createIcon('lightbulb'),
        LineChart: createIcon('line-chart'),
        List: createIcon('list'),
        Loader: createIcon('loader'),
        Loader2: createIcon('loader-2'),
        Lock: createIcon('lock'),
        LogIn: createIcon('log-in'),
        LogOut: createIcon('log-out'),
        Map: createIcon('map'),
        MapPin: createIcon('map-pin'),
        Maximize2: createIcon('maximize-2'),
        Megaphone: createIcon('megaphone'),
        Meh: createIcon('meh'),
        Menu: createIcon('menu'),
        MessageCircle: createIcon('message-circle'),
        MessageSquare: createIcon('message-square'),
        Mic: createIcon('mic'),
        Mic2: createIcon('mic-2'),
        MicOff: createIcon('mic-off'),
        Minus: createIcon('minus'),
        Monitor: createIcon('monitor'),
        Moon: createIcon('moon'),
        MoreVertical: createIcon('more-vertical'),
        Move: createIcon('move'),
        MoveHorizontal: createIcon('move-horizontal'),
        MoveVertical: createIcon('move-vertical'),
        Music: createIcon('music'),
        Music2: createIcon('music-2'),
        Orbit: createIcon('orbit'),
        Pause: createIcon('pause'),
        PenTool: createIcon('pen-tool'),
        Phone: createIcon('phone'),
        PhoneOff: createIcon('phone-off'),
        Play: createIcon('play'),
        PlayCircle: createIcon('play-circle'),
        Plus: createIcon('plus'),
        Radio: createIcon('radio'),
        RefreshCw: createIcon('refresh-cw'),
        Repeat: createIcon('repeat'),
        Rocket: createIcon('rocket'),
        RotateCcw: createIcon('rotate-ccw'),
        RotateCw: createIcon('rotate-cw'),
        Salad: createIcon('salad'),
        Save: createIcon('save'),
        Scale: createIcon('scale'),
        Scan: createIcon('scan'),
        Search: createIcon('search'),
        Send: createIcon('send'),
        Server: createIcon('server'),
        Settings: createIcon('settings'),
        Share2: createIcon('share-2'),
        Shield: createIcon('shield'),
        ShoppingBag: createIcon('shopping-bag'),
        SkipBack: createIcon('skip-back'),
        SkipForward: createIcon('skip-forward'),
        Sliders: createIcon('sliders'),
        Smartphone: createIcon('smartphone'),
        Smile: createIcon('smile'),
        Sparkles: createIcon('sparkles'),
        Speaker: createIcon('speaker'),
        Square: createIcon('square'),
        Star: createIcon('star'),
        Stethoscope: createIcon('stethoscope'),
        StickyNote: createIcon('sticky-note'),
        Sun: createIcon('sun'),
        Tag: createIcon('tag'),
        Target: createIcon('target'),
        ThumbsDown: createIcon('thumbs-down'),
        ThumbsUp: createIcon('thumbs-up'),
        Timer: createIcon('timer'),
        Trash2: createIcon('trash-2'),
        TrendingDown: createIcon('trending-down'),
        TrendingUp: createIcon('trending-up'),
        Trophy: createIcon('trophy'),
        Twitter: createIcon('twitter'),
        Type: createIcon('type'),
        Undo2: createIcon('undo-2'),
        Unlock: createIcon('unlock'),
        Upload: createIcon('upload'),
        User: createIcon('user'),
        UserPlus: createIcon('user-plus'),
        Users: createIcon('users'),
        Utensils: createIcon('utensils'),
        Vibrate: createIcon('vibrate'),
        Volume1: createIcon('volume-1'),
        Volume2: createIcon('volume-2'),
        VolumeX: createIcon('volume-x'),
        Wand2: createIcon('wand-2'),
        Waves: createIcon('waves'),
        Wifi: createIcon('wifi'),
        WifiOff: createIcon('wifi-off'),
        Wind: createIcon('wind'),
        X: createIcon('x'),
        XCircle: createIcon('x-circle'),
        Zap: createIcon('zap'),
        ZoomIn: createIcon('zoom-in'),
        ZoomOut: createIcon('zoom-out'),
    };
});
