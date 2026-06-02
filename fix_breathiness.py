with open('src/components/viz/BreathinessMeter.jsx', 'r') as f:
    content = f.read()
import re
new_content = re.sub(r'import \{ renderCoordinator \} from \'../../services/RenderCoordinator\';\n', '', content, count=1)
with open('src/components/viz/BreathinessMeter.jsx', 'w') as f:
    f.write(new_content)
