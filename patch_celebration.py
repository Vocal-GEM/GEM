import re

with open("src/components/ui/CelebrationModal.jsx", "r") as f:
    content = f.read()

content = content.replace(
    'className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"',
    'className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"\n                    aria-label="Close modal"'
)

with open("src/components/ui/CelebrationModal.jsx", "w") as f:
    f.write(content)
