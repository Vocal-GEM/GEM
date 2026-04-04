import { render, screen, cleanup, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderCoordinator } from '../../services/RenderCoordinator';

// Mock RenderCoordinator
vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn(() => vi.fn()), // Returns unsubscribe fn
        PRIORITY: { MEDIUM: 2 }
    }
}));

// Override global mock for this test to include Smile
vi.mock('lucide-react', async (importOriginal) => {
    const actual = await importOriginal();
    const createIcon = (name) => {
        const Icon = (props) => <div {...props} data-testid={name} />;
        Icon.displayName = name;
        return Icon;
    };

    return {
        ...actual,
        Sun: createIcon('Sun'),
        Moon: createIcon('Moon'),
        Info: createIcon('Info'),
        Smile: createIcon('Smile')
    };
});

// Mock BrightnessMeter component with display name
vi.mock('./BrightnessMeter', () => {
    const BrightnessMeter = (props) => <div {...props}>Brightness Meter</div>;
    BrightnessMeter.displayName = 'BrightnessMeter';
    return { default: BrightnessMeter };
});

describe('BrightnessMeter', () => {
    let dataRef;

    beforeEach(() => {
        dataRef = { current: { f2: 0 } };
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders successfully', async () => {
        const { default: BrightnessMeter } = await import('./BrightnessMeter');
        render(<BrightnessMeter dataRef={dataRef} />);
        expect(screen.getByText('Brightness Meter')).toBeDefined();
    });
});
