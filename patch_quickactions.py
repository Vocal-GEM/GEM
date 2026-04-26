import re

with open("src/components/ui/QuickActions.jsx", "r") as f:
    content = f.read()

# Fix the quick actions menu div duplication
content = re.sub(
    r'id="quick-actions-menu"\s+className={twMerge\(\s+"flex flex-col gap-3 mb-4 transition-all duration-300",\s+isOpen \? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"\s+\)}\s+className={`flex flex-col gap-3 mb-4 transition-all duration-300 \${isOpen \? \'opacity-100 translate-y-0\' : \'opacity-0 translate-y-10 pointer-events-none\'}`}',
    r'id="quick-actions-menu"\n                className={twMerge(\n                    "flex flex-col gap-3 mb-4 transition-all duration-300",\n                    isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"\n                )}',
    content
)

# Fix duplicate button attributes for the action buttons
content = re.sub(
    r'tabIndex={isOpen \? 0 : -1}\s+aria-hidden={!isOpen}\s+className="flex items-center justify-end gap-3 group focus:outline-none"\s+className="flex items-center justify-end gap-3 group focus-visible:outline-none"',
    r'tabIndex={isOpen ? 0 : -1}\n                        aria-hidden={!isOpen}\n                        className="flex items-center justify-end gap-3 group focus-visible:outline-none"',
    content
)

content = re.sub(
    r'aria-label={action\.label}\s+aria-hidden={!isOpen}',
    r'aria-label={action.label}',
    content
)

# Fix duplicate icon divs
content = re.sub(
    r'<div className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-offset-2 group-focus-visible:ring-white \${action\.color}`}>\s*<div\s*className={twMerge\(\s*"w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-offset-2 group-focus-visible:ring-white",\s*action\.color\s*\)}\s*>\s*<div className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110 group-focus-visible:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-black \${action\.color}`}>\s*<action\.icon size={20} />\s*</div>',
    r'<div className={twMerge("w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110 group-focus-visible:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-black", action.color)}>\n                            <action.icon size={20} />\n                        </div>',
    content
)

# Fix main FAB button duplicate attributes
content = re.sub(
    r'onClick={\(\) => setIsOpen\(!isOpen\)}\s+className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-teal-500/50 \${isOpen \? \'bg-slate-700 rotate-45\' : \'bg-gradient-to-r from-teal-500 to-violet-500 hover:shadow-teal-500/30\'}`}\s+className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/50 \${isOpen \? \'bg-slate-700 rotate-45\' : \'bg-gradient-to-r from-teal-500 to-violet-500 hover:shadow-teal-500/30\'}`}\s+className={twMerge\(\s*"w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/50",\s*isOpen \? "bg-slate-700 rotate-45" : "bg-gradient-to-r from-teal-500 to-violet-500 hover:shadow-teal-500/30"\s*\)}\s+className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all duration-300 focus-visible:ring-4 focus-visible:ring-teal-500/50 focus-visible:outline-none \${isOpen \? \'bg-slate-700 rotate-45\' : \'bg-gradient-to-r from-teal-500 to-violet-500 hover:shadow-teal-500/30\'}`}',
    r'onClick={() => setIsOpen(!isOpen)}\n                className={twMerge("w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all duration-300 focus-visible:ring-4 focus-visible:ring-teal-500/50 focus-visible:outline-none", isOpen ? "bg-slate-700 rotate-45" : "bg-gradient-to-r from-teal-500 to-violet-500 hover:shadow-teal-500/30")}',
    content
)

content = re.sub(
    r'aria-expanded={isOpen}\s+aria-controls="quick-actions-menu"\s+aria-haspopup="true"\s+aria-controls="quick-actions-menu"',
    r'aria-expanded={isOpen}\n                aria-haspopup="true"\n                aria-controls="quick-actions-menu"',
    content
)

with open("src/components/ui/QuickActions.jsx", "w") as f:
    f.write(content)
