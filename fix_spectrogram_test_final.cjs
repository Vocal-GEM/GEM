const fs = require('fs');
const path = 'src/components/viz/HighResSpectrogram.test.jsx';
let content = fs.readFileSync(path, 'utf8');

// I can see the mock for ResizeObserver was completely removed in earlier attempts.
// We need to add it back properly to avoid the 'ResizeObserver is not defined' error in vitest
content = content.replace(
`  beforeEach(() => {
    dataRef = {`,
`  beforeEach(() => {
    globalThis.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    dataRef = {`
);

content = content.replace(
`  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });`,
`  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    delete globalThis.ResizeObserver;
  });`
);

fs.writeFileSync(path, content);
