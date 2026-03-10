import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import PracticeView from './PracticeView';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    Mic: () => <div data-testid="icon-mic" />,
    Activity: () => <div data-testid="icon-activity" />,
    Anchor: () => <div data-testid="icon-anchor" />,
    Aperture: () => <div data-testid="icon-aperture" />,
    Maximize2: () => <div data-testid="icon-maximize2" />,
    Waves: () => <div data-testid="icon-waves" />,
    Stethoscope: () => <div data-testid="icon-stethoscope" />,
    ChevronUp: () => <div data-testid="icon-chevron-up" />,
    ChevronDown: () => <div data-testid="icon-chevron-down" />
}));

// Mock Contexts
vi.mock('../../context/AudioContext', () => ({
    useAudio: () => ({
        isAudioActive: false,
        toggleAudio: vi.fn(),
        dataRef: { current: {} }
    })
}));

vi.mock('../../context/ProfileContext', () => ({
    useProfile: () => ({
        calibration: {},
        targetRange: { min: 100, max: 200 }
    })
}));

vi.mock('../../context/SettingsContext', () => ({
    useSettings: () => ({
        settings: { userMode: 'user' }
    })
}));

vi.mock('../../context/LayoutContext', () => ({
    useLayout: () => ({
        layout: [],
        activeTools: ['pitch', 'resonance'],
        toggleTool: vi.fn()
    })
}));

// Mock child components
vi.mock('../viz/ResonanceOrb', () => ({ default: () => <div data-testid="resonance-orb">Orb</div> }));
vi.mock('../viz/LiveMetricsBar', () => ({ default: () => <div>Metrics</div> }));
vi.mock('../viz/PitchVisualizer', () => ({ default: () => <div>PitchViz</div> }));
vi.mock('../viz/VoiceQualityMeter', () => ({ default: () => <div>VQM</div> }));
vi.mock('../viz/VowelSpacePlot', () => ({ default: () => <div>VSP</div> }));
vi.mock('../viz/CPPMeter', () => ({ default: () => <div>CPP</div> }));
vi.mock('../viz/HighResSpectrogram', () => ({ default: () => <div>Spectrogram</div> }));
vi.mock('../viz/VoiceRangeProfile', () => ({ default: () => <div>VRP</div> }));
vi.mock('../viz/MPTTracker', () => ({ default: () => <div>MPT</div> }));
vi.mock('../viz/IntonationTrainer', () => ({ default: () => <div>Intonation</div> }));
vi.mock('../layout/ResizableToolGrid', () => ({
    default: ({ children }) => <div>{children}</div>,
    GridTool: ({ children }) => <div>{children}</div>
}));
vi.mock('../ui/LayoutControls', () => ({ default: () => <div>LayoutControls</div> }));

describe('PracticeView', () => {
    it('renders without crashing and toggles tools drawer', () => {
        render(<PracticeView />);

        // Initial state: Start/Stop button should be visible
        expect(screen.getByText('practice.start')).toBeInTheDocument();

        // Tools drawer toggle should be visible
        const toggleButton = screen.getByText('practice.tools.show').closest('button');
        expect(toggleButton).toBeInTheDocument();
        expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

        // Click to open drawer
        fireEvent.click(toggleButton);

        // Drawer should be open
        expect(screen.getByText('practice.tools.hide')).toBeInTheDocument();
        expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

        // Close button (handle) should be visible and have aria-label
        const closeButton = screen.getByLabelText('Close tools');
        expect(closeButton).toBeInTheDocument();

        // Check for Chevron icons (mocked)
        // Since text changes, we check for icon presence implicitly via toggle state logic in component
        // But we can check if the button contains the correct icon testid
        // When open (true), it should show ChevronDown
        expect(screen.getByTestId('icon-chevron-down')).toBeInTheDocument();

        // Click close handle
        fireEvent.click(closeButton);

        // Should be closed (text changes back)
        expect(screen.getByText('practice.tools.show')).toBeInTheDocument();
    });
});
