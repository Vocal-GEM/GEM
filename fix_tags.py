import re

with open("src/components/ui/QuickActions.jsx", "r") as f:
    content = f.read()

# Fix unclosed div
content = re.sub(
    r'<div className=\{`w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-offset-2 group-focus-visible:ring-white \$\{action\.color\}`\}>\s*<div\s*className=\{twMerge\(\s*"w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-offset-2 group-focus-visible:ring-white",\s*action\.color\s*\)\}\s*>\s*<div className=\{`w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110 group-focus-visible:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-black \$\{action\.color\}`\}>\s*<action\.icon size=\{20\} />\s*</div>',
    r'<div className={twMerge("w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110 group-focus-visible:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-black", action.color)}>\n                            <action.icon size={20} />\n                        </div>',
    content
)

with open("src/components/ui/QuickActions.jsx", "w") as f:
    f.write(content)
