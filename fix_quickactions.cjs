const fs = require('fs');

const path = 'src/components/ui/QuickActions.jsx';
let code = fs.readFileSync(path, 'utf8');

// Fix menu div classname duplication
code = code.replace(/id="quick-actions-menu"[\s\S]*?className={`flex flex-col gap-3 mb-4 transition-all duration-300 \${isOpen \? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}/, `id="quick-actions-menu"\n                className={twMerge(\n                    "flex flex-col gap-3 mb-4 transition-all duration-300",\n                    isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"\n                )}`);

// Fix button props
code = code.replace(/tabIndex={isOpen \? 0 : -1}\s+aria-hidden={!isOpen}\s+className="flex items-center justify-end gap-3 group focus:outline-none"\s+className="flex items-center justify-end gap-3 group focus-visible:outline-none"/g, `tabIndex={isOpen ? 0 : -1}\n                        className="flex items-center justify-end gap-3 group focus-visible:outline-none"`);

// Fix inner div duplication
code = code.replace(/<div className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-offset-2 group-focus-visible:ring-white \${action\.color}`}>[\s\S]*?<div className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110 group-focus-visible:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-black \${action\.color}`}/, `<div className={twMerge("w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110 group-focus-visible:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-black", action.color)}`);

// Fix main FAB button
code = code.replace(/<button[\s\S]*?<Plus size={28} \/>/g, `<button\n                onClick={() => setIsOpen(!isOpen)}\n                className={twMerge(\n                    "w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/50",\n                    isOpen ? "bg-slate-700 rotate-45" : "bg-gradient-to-r from-teal-500 to-violet-500 hover:shadow-teal-500/30"\n                )}\n                aria-label={isOpen ? "Close Quick Actions" : "Open Quick Actions"}\n                aria-expanded={isOpen}\n                aria-controls="quick-actions-menu"\n            >\n                <Plus size={28} />`);

fs.writeFileSync(path, code);
