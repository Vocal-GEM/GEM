import re

with open("src/components/ui/QuickSettings.jsx", "r") as f:
    content = f.read()

# Fix role attributes for modal dialogs and ARIA switch roles
content = re.sub(
    r'<div className="fixed inset-0 z-\[60\] flex justify-end">',
    r'<div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal="true" aria-label="Quick Settings">',
    content
)

# Convert Listen Mode button to a switch
content = re.sub(
    r'<button\s*onClick={\(\) => updateSettings\(\{ \.\.\.settings, listenMode: !settings\.listenMode \}\)}\s*className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all \$\{settings\.listenMode \? \'bg-indigo-600 border-indigo-500 text-white\' : \'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600\'\}`}',
    r'<button\n                                onClick={() => updateSettings({ ...settings, listenMode: !settings.listenMode })}\n                                role="switch"\n                                aria-checked={settings.listenMode}\n                                aria-label="Listen Mode"\n                                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${settings.listenMode ? \'bg-indigo-600 border-indigo-500 text-white\' : \'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600\'}`}',
    content
)

# Convert Privacy switch
content = re.sub(
    r'<button\s*onClick={\(\) => updateSettings\(\{ \.\.\.settings, analyticsEnabled: !settings\.analyticsEnabled \}\)}\s*className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all \$\{settings\.analyticsEnabled \? \'bg-emerald-500/20 border-emerald-500/50 text-emerald-400\' : \'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600\'\}`}',
    r'<button\n                            onClick={() => updateSettings({ ...settings, analyticsEnabled: !settings.analyticsEnabled })}\n                            role="switch"\n                            aria-checked={settings.analyticsEnabled}\n                            aria-label="Share Usage Data"\n                            className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${settings.analyticsEnabled ? \'bg-emerald-500/20 border-emerald-500/50 text-emerald-400\' : \'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600\'}`}',
    content
)

with open("src/components/ui/QuickSettings.jsx", "w") as f:
    f.write(content)
