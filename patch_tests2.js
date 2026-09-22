import fs from 'fs';

let content = fs.readFileSync('src/components/viz/BrightnessMeter.test.jsx', 'utf8');
content = content.replace(
    "import React from 'react';",
    "import React from 'react';\nimport { Sun, Moon, Info, Smile } from 'lucide-react';"
);
content = content.replace(
    "    return {\n        Sun: createIcon('Sun'),\n        Moon: createIcon('Moon'),\n        Info: createIcon('Info'),\n        Smile: createIcon('Smile')\n    };\n});",
    "    return {\n        ...require('lucide-react'),\n        Sun: createIcon('Sun'),\n        Moon: createIcon('Moon'),\n        Info: createIcon('Info'),\n        Smile: createIcon('Smile')\n    };\n});"
);

// We need to use vi.importActual instead of require if this is a vitest mock
content = fs.readFileSync('src/components/viz/BrightnessMeter.test.jsx', 'utf8');
const mockStart = "vi.mock('lucide-react', () => {";
const mockReplacement = `vi.mock('lucide-react', async () => {
    const actual = await vi.importActual('lucide-react');
    const React = await import('react');

    const createIcon = (name) => {
        const MockComponent = function MockComponent(props) {
            return React.default.createElement('div', { ...props, 'data-testid': name });
        };
        MockComponent.displayName = name;
        return MockComponent;
    };

    return {
        ...actual,
        Sun: createIcon('Sun'),
        Moon: createIcon('Moon'),
        Info: createIcon('Info'),
        Smile: createIcon('Smile')
    };
});`;
content = content.replace(
    /vi\.mock\('lucide-react'[\s\S]*?\}\);\n\}\);/,
    mockReplacement
);
// just overwrite the file entirely it's easier

const newContent = `import { render, screen, cleanup, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import BrightnessMeter from './BrightnessMeter';
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
vi.mock('lucide-react', async () => {
    const actual = await vi.importActual('lucide-react');
    const React = await import('react');

    const createIcon = (name) => {
        const MockComponent = function MockComponent(props) {
            return React.default.createElement('div', { ...props, 'data-testid': name });
        };
        MockComponent.displayName = name;
        return MockComponent;
    };

    return {
        ...actual,
        Sun: createIcon('Sun'),
        Moon: createIcon('Moon'),
        Info: createIcon('Info'),
        Smile: createIcon('Smile')
    };
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

    it('renders successfully', () => {
        render(<BrightnessMeter dataRef={dataRef} />);
        expect(screen.getByText('Brightness Meter')).toBeDefined();
    });

    it('subscribes to RenderCoordinator', () => {
        render(<BrightnessMeter dataRef={dataRef} />);
        expect(renderCoordinator.subscribe).toHaveBeenCalled();
        const [, , priority] = renderCoordinator.subscribe.mock.calls[0];
        expect(priority).toBe(renderCoordinator.PRIORITY.MEDIUM);
    });

    it('updates based on dataRef via coordinator callback', () => {
        render(<BrightnessMeter dataRef={dataRef} />);

        // Get the callback passed to subscribe
        // Signature: subscribe(id, callback, priority)
        const callback = renderCoordinator.subscribe.mock.calls[0][1];

        // Update data
        dataRef.current.f2 = 2300; // Bright target

        // Manually trigger callback (simulate render loop)
        act(() => {
            callback();
        });

        // The status label becomes "Bright ✓"
        expect(screen.getByText('Bright ✓')).toBeDefined();
    });
});
`;

fs.writeFileSync('src/components/viz/BrightnessMeter.test.jsx', newContent);
