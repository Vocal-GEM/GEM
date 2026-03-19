const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Create a minimal HTML file to test the component
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>RecordingsList Verification</title>
        <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <script src="https://unpkg.com/lucide@latest"></script>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-slate-900 p-8">
        <div id="root"></div>
        <script type="text/babel">
            const { useState, useEffect, useRef } = React;

            // Mock Lucide icons for standalone test
            const Icon = ({ name, size = 24, className = "" }) => {
                return <i data-lucide={name} style={{ width: size, height: size }} className={className}></i>;
            };

            const Play = (props) => <Icon name="play" {...props} />;
            const Pause = (props) => <Icon name="pause" {...props} />;
            const Trash2 = (props) => <Icon name="trash-2" {...props} />;
            const Download = (props) => <Icon name="download" {...props} />;
            const Edit2 = (props) => <Icon name="edit-2" {...props} />;
            const Check = (props) => <Icon name="check" {...props} />;
            const X = (props) => <Icon name="x" {...props} />;
            const Mic = (props) => <Icon name="mic" {...props} />;
            const Calendar = (props) => <Icon name="calendar" {...props} />;
            const Clock = (props) => <Icon name="clock" {...props} />;
            const Loader2 = (props) => <Icon name="loader-2" {...props} />;

            const RecordingsList = () => {
                const [recordings, setRecordings] = useState([
                    { id: 1, name: 'Practice Session 1', duration: 120, timestamp: Date.now() - 86400000, type: 'practice' },
                    { id: 2, name: 'Baseline Recording', duration: 45, timestamp: Date.now() - 172800000, type: 'baseline' }
                ]);
                const [loading, setLoading] = useState(false);
                const [playingId, setPlayingId] = useState(1); // Set to 1 to show pause state
                const [editingId, setEditingId] = useState(2); // Set to 2 to show edit state
                const [editName, setEditName] = useState('Baseline Recording');

                const formatDuration = (seconds) => {
                    if (!seconds && seconds !== 0) return '--:--';
                    const mins = Math.floor(seconds / 60);
                    const secs = Math.floor(seconds % 60);
                    return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
                };

                return (
                    <div id="recordings-list" className="space-y-3 max-w-2xl mx-auto">
                        {recordings.map((recording, index) => (
                            <div key={recording.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 transition-all group">
                                <div className="flex items-center justify-between gap-4">

                                    {/* Play Button */}
                                    <button
                                        id={index === 0 ? 'recording-play-btn' : undefined}
                                        aria-label={playingId === recording.id ? "Pause recording" : "Play recording"}
                                        aria-pressed={playingId === recording.id}
                                        className={\`w-10 h-10 rounded-full flex items-center justify-center transition-colors flex-shrink-0 \${playingId === recording.id
                                            ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                            }\`}
                                    >
                                        {playingId === recording.id ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                                    </button>

                                    {/* Info / Edit Input */}
                                    <div className="flex-1 min-w-0">
                                        {editingId === recording.id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="bg-slate-900 border border-violet-500 rounded px-2 py-1 text-sm text-white focus:outline-none w-full"
                                                />
                                                <button aria-label="Save recording name" className="p-1 hover:text-green-400 text-slate-400"><Check size={16} /></button>
                                                <button aria-label="Cancel editing" className="p-1 hover:text-red-400 text-slate-400"><X size={16} /></button>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold text-white truncate">{recording.name || 'Untitled Recording'}</h4>
                                                    <button
                                                        id={index === 0 ? 'recording-edit-btn' : undefined}
                                                        aria-label="Edit recording name"
                                                        className="opacity-100 p-1 text-slate-500 hover:text-violet-400 transition-opacity"
                                                    >
                                                        <Edit2 size={12} />
                                                    </button>
                                                </div>
                                                <div className="flex gap-3 text-xs text-slate-400 mt-1">
                                                    <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(recording.timestamp).toLocaleDateString()}</span>
                                                    <span className="flex items-center gap-1"><Clock size={10} /> {formatDuration(recording.duration)}</span>
                                                    <span className="bg-slate-700 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider text-slate-300">{recording.type || 'audio'}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1">
                                        <button
                                            title="Download"
                                            aria-label="Download recording"
                                            className="p-2 text-slate-400 hover:text-violet-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                                        >
                                            <Download size={18} />
                                        </button>
                                        <button
                                            title="Delete"
                                            aria-label="Delete recording"
                                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            };

            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(<RecordingsList />);
        </script>
        <script>
            // Initialize lucide icons after react render
            setTimeout(() => {
                if (window.lucide) {
                    window.lucide.createIcons();
                }
            }, 1000);
        </script>
      </body>
    </html>
  `;

  await page.setContent(htmlContent);
  await page.waitForTimeout(2000); // Wait for React to render and icons to initialize

  await page.screenshot({ path: '/app/verification/recordings-list-aria.png' });

  // Verify ARIA attributes in the DOM
  const playButtonAriaLabel = await page.evaluate(() => document.querySelector('#recording-play-btn').getAttribute('aria-label'));
  const playButtonAriaPressed = await page.evaluate(() => document.querySelector('#recording-play-btn').getAttribute('aria-pressed'));
  const editButtonAriaLabel = await page.evaluate(() => document.querySelector('#recording-edit-btn').getAttribute('aria-label'));

  console.log('Play Button ARIA Label:', playButtonAriaLabel);
  console.log('Play Button ARIA Pressed:', playButtonAriaPressed);
  console.log('Edit Button ARIA Label:', editButtonAriaLabel);

  const hasSaveEditAriaLabel = await page.evaluate(() => !!document.querySelector('button[aria-label="Save recording name"]'));
  const hasCancelEditAriaLabel = await page.evaluate(() => !!document.querySelector('button[aria-label="Cancel editing"]'));
  const hasDownloadAriaLabel = await page.evaluate(() => !!document.querySelector('button[aria-label="Download recording"]'));
  const hasDeleteAriaLabel = await page.evaluate(() => !!document.querySelector('button[aria-label="Delete recording"]'));

  console.log('Has Save Edit ARIA Label:', hasSaveEditAriaLabel);
  console.log('Has Cancel Edit ARIA Label:', hasCancelEditAriaLabel);
  console.log('Has Download ARIA Label:', hasDownloadAriaLabel);
  console.log('Has Delete ARIA Label:', hasDeleteAriaLabel);

  await browser.close();
})();
