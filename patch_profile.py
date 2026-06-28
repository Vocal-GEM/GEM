import re

with open("src/components/ui/ProfileManager.jsx", "r") as f:
    content = f.read()

content = content.replace(
    '<button onClick={onClose} className="text-slate-400 hover:text-white">',
    '<button onClick={onClose} className="text-slate-400 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-500 rounded" aria-label="Close Profile Manager">'
)

content = content.replace(
    '<button\n                                type="button"\n                                onClick={() => setIsCreating(false)}\n                                className="text-slate-400 hover:text-white px-2"\n                            >',
    '<button\n                                type="button"\n                                onClick={() => setIsCreating(false)}\n                                className="text-slate-400 hover:text-white px-2 focus-visible:ring-2 focus-visible:ring-blue-500 rounded"\n                                aria-label="Cancel Profile Creation"\n                            >'
)


with open("src/components/ui/ProfileManager.jsx", "w") as f:
    f.write(content)
