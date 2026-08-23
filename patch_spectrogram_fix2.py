import re

with open("src/components/viz/HighResSpectrogram.jsx", "r") as f:
    content = f.read()

# Let's fix the ARIA label addition that might have duplicated a line
if '<button\n                    aria-label="Save Screenshot"\n                    onClick={handleScreenshot}\n                    className="absolute top-2 right-2 p-2 bg-slate-900/80 hover:bg-slate-800 rounded-lg text-white/70 hover:text-white transition-all z-10 animate-in fade-in duration-200"\n                    title="Save Screenshot"\n                >' in content:
    # Looks like we don't need this patch script, the error is something else
    pass

with open("src/components/viz/HighResSpectrogram.jsx", "w") as f:
    f.write(content)
