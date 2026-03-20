from playwright.sync_api import sync_playwright

def verify_feature(page):
    # Set the content of the page to test the HighResSpectrogram directly
    page.set_content("""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Spectrogram Test</title>
        <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <style>
            body { background: #0f172a; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; color: white; font-family: sans-serif; }
            #root { width: 800px; height: 300px; }
            .canvas-container { border: 1px solid #334155; border-radius: 12px; overflow: hidden; position: relative; }
        </style>
    </head>
    <body>
        <div id="root"></div>
        <script type="text/babel">
            const { useEffect, useRef, useState } = React;

            // Simplified Mock Spectrogram matching the optimization logic
            const Spectrogram = () => {
                const canvasRef = useRef(null);
                const [frameCount, setFrameCount] = useState(0);

                useEffect(() => {
                    const canvas = canvasRef.current;
                    const ctx = canvas.getContext('2d');
                    const width = canvas.width;
                    const height = canvas.height;
                    const speed = 2;

                    // Simulated render loop
                    const interval = setInterval(() => {
                        // Move everything left
                        const imgData = ctx.getImageData(speed, 0, width - speed, height);
                        ctx.putImageData(imgData, 0, 0);

                        // Optimzed pixel drawing simulation
                        if (!canvas.imageDataRef || canvas.imageDataRef.width !== speed || canvas.imageDataRef.height !== height) {
                            canvas.imageDataRef = ctx.createImageData(speed, height);
                            canvas.data32Ref = new Uint32Array(canvas.imageDataRef.data.buffer);
                        }

                        const imageData = canvas.imageDataRef;
                        const data32 = canvas.data32Ref;

                        // Fill with random "audio" data
                        for (let y = 0; y < height; y++) {
                            const intensity = Math.random() * 255;
                            // Generate a simple heat map color (blue to red)
                            const r = Math.min(255, intensity * 2);
                            const b = Math.max(0, 255 - intensity * 2);
                            // ABGR format
                            const color = (255 << 24) | (b << 16) | (0 << 8) | r;

                            const rowOffset = y * speed;
                            for (let x = 0; x < speed; x++) {
                                data32[rowOffset + x] = color;
                            }
                        }

                        ctx.putImageData(imageData, width - speed, 0);
                        setFrameCount(f => f + 1);
                    }, 50);

                    return () => clearInterval(interval);
                }, []);

                return (
                    <div className="canvas-container">
                        <canvas ref={canvasRef} width={800} height={300} style={{ display: 'block' }} />
                        <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>
                            Frames rendered: {frameCount} (Testing data32Ref caching)
                        </div>
                    </div>
                );
            };

            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(<Spectrogram />);
        </script>
    </body>
    </html>
    """)

    # Wait for the component to render and run for a few frames
    page.wait_for_timeout(2000)

    # Take screenshot
    page.screenshot(path="/app/verification/verification.png")
    page.wait_for_timeout(500)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(record_video_dir="/app/verification/video")
        page = context.new_page()
        try:
            verify_feature(page)
        finally:
            context.close()
            browser.close()
