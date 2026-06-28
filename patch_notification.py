import re

with open("src/components/ui/NotificationSettingsPanel.jsx", "r") as f:
    content = f.read()

content = content.replace(
    '<button onClick={onClose} className="text-slate-400 hover:text-white">',
    '<button onClick={onClose} className="text-slate-400 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-500 rounded" aria-label="Close Notification Settings">'
)

with open("src/components/ui/NotificationSettingsPanel.jsx", "w") as f:
    f.write(content)
