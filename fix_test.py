with open('src/engines/AudioEngine.socket.test.js', 'r') as f:
    content = f.read()

# Replace the mock to fix tests
new_mock = """// Mock RenderCoordinator
vi.mock('../services/RenderCoordinator', () => {
    const fn = vi.fn(() => vi.fn());
    return {
        default: {
            subscribe: fn,
            PRIORITY: { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
        },
        renderCoordinator: {
            subscribe: fn,
            PRIORITY: { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
        }
    };
});"""

content = content.replace("""// Mock RenderCoordinator
vi.mock('../services/RenderCoordinator', () => ({
    default: {
        subscribe: vi.fn(() => vi.fn()),
        PRIORITY: { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
    },
    renderCoordinator: {
        subscribe: vi.fn(() => vi.fn()),
        PRIORITY: { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
    }
}));""", new_mock)

with open('src/engines/AudioEngine.socket.test.js', 'w') as f:
    f.write(content)
