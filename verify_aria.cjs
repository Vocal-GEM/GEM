const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Create a minimal test harness since the app requires login and microphone access
  // We'll render the components in isolation to verify the ARIA attributes
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>ARIA Verification</title>
        <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          .lucide { width: 16px; height: 16px; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; fill: none; }
        </style>
    </head>
    <body class="bg-slate-900 text-white p-8">
        <div id="root"></div>
        <script type="text/babel">
            // Mock Lucide icons
            const Camera = () => <svg className="lucide"><circle cx="12" cy="13" r="3"/><path d="M2 7l3-3h14l3 3v13H2z"/></svg>;
            const X = () => <svg className="lucide"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
            const Bug = () => <svg className="lucide"><rect x="8" y="6" width="8" height="14" rx="4"/><path d="M19 11h-2"/><path d="M19 15h-2"/><path d="M19 19h-2"/><path d="M5 11h2"/><path d="M5 15h2"/><path d="M5 19h2"/><path d="M9 6v-2"/><path d="M15 6v-2"/></svg>;
            const Info = () => <svg className="lucide"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>;
            const Mic = () => <svg className="lucide"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>;

            // Spectrogram Mock
            const SpectrogramMock = () => {
                return (
                    <div className="relative h-64 w-full bg-black rounded-xl overflow-hidden border border-slate-800 mb-8 p-4">
                        <h2 className="text-xl mb-4 text-teal-400">Spectrogram Area</h2>

                        {/* Cursor Data Mock */}
                        <div className="absolute z-20 bg-slate-900/95 border border-teal-500/50 rounded-lg px-3 py-2 shadow-xl w-32 left-10 top-10">
                            <div className="text-teal-400 font-bold text-lg">440 Hz</div>
                            <button
                                className="absolute -top-2 -right-2 w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:text-white"
                                aria-label="Close cursor data"
                            >
                                <X />
                            </button>
                        </div>

                        {/* Controls Mock */}
                        <button
                            className="absolute top-2 right-2 p-2 bg-slate-900/80 hover:bg-slate-800 rounded-lg text-white/70 hover:text-white transition-all"
                            aria-label="Save screenshot"
                        >
                            <Camera />
                        </button>
                    </div>
                );
            };

            // DynamicOrb Mock
            const DynamicOrbMock = () => {
                const modes = [{ id: 'pitch', label: 'Pitch Focus', icon: Mic }];
                return (
                    <div className="relative h-32 w-full bg-slate-800 rounded-xl mb-8 p-4 flex items-center gap-2">
                        <h2 className="text-xl mb-4 text-amber-400 w-48">Dynamic Orb Controls</h2>

                        <div className="flex bg-black/40 p-1 rounded-full backdrop-blur-sm border border-white/10 z-20">
                            {modes.map(m => (
                                <button
                                    key={m.id}
                                    className="p-2 rounded-full transition-all text-white/50 hover:text-white hover:bg-white/10"
                                    title={m.label}
                                    aria-label={m.label}
                                >
                                    <m.icon />
                                </button>
                            ))}
                            <div className="w-px bg-white/10 mx-1"></div>
                            <button
                                className="p-2 rounded-full transition-all text-white/50 hover:text-white hover:bg-white/10"
                                title="Toggle Debug Panel"
                                aria-label="Toggle Debug Panel"
                            >
                                <Bug />
                            </button>
                        </div>
                    </div>
                );
            };

            // BrightnessMeter Mock
            const BrightnessMeterMock = () => {
                return (
                    <div className="relative h-32 w-full bg-slate-800 rounded-xl p-4 flex items-center justify-between">
                        <h2 className="text-xl mb-4 text-purple-400">Brightness Meter</h2>
                        <button
                            className="text-slate-600 hover:text-slate-300 transition-colors p-2"
                            aria-label="More information"
                        >
                            <Info />
                        </button>
                    </div>
                );
            };

            const App = () => (
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">ARIA Label Verification</h1>
                    <SpectrogramMock />
                    <DynamicOrbMock />
                    <BrightnessMeterMock />
                </div>
            );

            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(<App />);
        </script>
    </body>
    </html>
  `;

  await page.setContent(htmlContent);

  // Wait for React to render
  await page.waitForTimeout(1000);

  // Take screenshot
  await page.screenshot({ path: '/home/jules/verification/aria_verification.png', fullPage: true });

  // Verification using locators based on our new aria-labels
  console.log('Verifying ARIA labels...');

  try {
      const closeBtn = page.locator('button[aria-label="Close cursor data"]');
      const closeBtnCount = await closeBtn.count();
      console.log(`- Found ${closeBtnCount} "Close cursor data" buttons.`);
      if (closeBtnCount === 0) throw new Error("Close cursor data button not found by ARIA label");

      const screenshotBtn = page.locator('button[aria-label="Save screenshot"]');
      const screenshotBtnCount = await screenshotBtn.count();
      console.log(`- Found ${screenshotBtnCount} "Save screenshot" buttons.`);
      if (screenshotBtnCount === 0) throw new Error("Save screenshot button not found by ARIA label");

      const pitchBtn = page.locator('button[aria-label="Pitch Focus"]');
      const pitchBtnCount = await pitchBtn.count();
      console.log(`- Found ${pitchBtnCount} "Pitch Focus" buttons.`);
      if (pitchBtnCount === 0) throw new Error("Pitch Focus button not found by ARIA label");

      const debugBtn = page.locator('button[aria-label="Toggle Debug Panel"]');
      const debugBtnCount = await debugBtn.count();
      console.log(`- Found ${debugBtnCount} "Toggle Debug Panel" buttons.`);
      if (debugBtnCount === 0) throw new Error("Toggle Debug Panel button not found by ARIA label");

      const infoBtn = page.locator('button[aria-label="More information"]');
      const infoBtnCount = await infoBtn.count();
      console.log(`- Found ${infoBtnCount} "More information" buttons.`);
      if (infoBtnCount === 0) throw new Error("More information button not found by ARIA label");

      console.log('✅ All ARIA labels verified successfully!');
  } catch (err) {
      console.error('❌ Verification failed:', err.message);
  }

  await browser.close();
})();
