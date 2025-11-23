import os
import re

# Icon mapping from data-lucide names to lucide-react component names
ICON_MAP = {
    'x': 'X',
    'alert-triangle': 'AlertTriangle',
    'eye-off': 'EyeOff',
    'mic': 'Mic',
    'chevron-down': 'ChevronDown',
    'chevron-up': 'ChevronUp',
    'book': 'Book',
    'wrench': 'Wrench',
    'heart-pulse': 'HeartPulse',
    'trash-2': 'Trash2',
    'minus': 'Minus',
    'plus': 'Plus',
    'maximize-2': 'Maximize2',
    'vibrate': 'Vibrate',
    'volume-2': 'Volume2',
    'help-circle': 'HelpCircle',
    'download': 'Download',
    'clipboard-check': 'ClipboardCheck',
    'flame': 'Flame',
    'target': 'Target',
    'check': 'Check',
    'arrow-left-right': 'ArrowLeftRight',
    'send': 'Send',
    'music': 'Music',
    'book-open': 'BookOpen',
    'play': 'Play',
    'gamepad-2': 'Gamepad2',
    'arrow-left': 'ArrowLeft'
}

def process_file(filepath):
    """Process a single file to migrate icons."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    icons_used = set()
    
    # Find all data-lucide icon usages
    pattern = r'<i\s+data-lucide="([^"]+)"[^>]*></i>'
    matches = re.findall(pattern, content)
    
    for icon_name in matches:
        if icon_name in ICON_MAP:
            icons_used.add(icon_name)
            # Replace the icon tag
            old_pattern = rf'<i\s+data-lucide="{icon_name}"([^>]*)></i>'
            component_name = ICON_MAP[icon_name]
            new_tag = f'<{component_name}\\1 />'
            content = re.sub(old_pattern, new_tag, content)
    
    # Add imports if icons were found
    if icons_used:
        import_components = ', '.join([ICON_MAP[icon] for icon in sorted(icons_used)])
        
        # Check if there's already a lucide-react import
        if "from 'lucide-react'" in content:
            # Update existing import
            import_pattern = r"import\s+{([^}]+)}\s+from\s+'lucide-react';"
            match = re.search(import_pattern, content)
            if match:
                existing_imports = match.group(1).strip()
                existing_set = set(i.strip() for i in existing_imports.split(','))
                new_set = set(ICON_MAP[icon] for icon in icons_used)
                combined = sorted(existing_set | new_set)
                new_import = f"import {{ {', '.join(combined)} }} from 'lucide-react';"
                content = re.sub(import_pattern, new_import, content)
        else:
            # Add new import after React import
            react_import_pattern = r"(import React[^;]+;)"
            if re.search(react_import_pattern, content):
                new_import = f"\\1\nimport {{ {import_components} }} from 'lucide-react';"
                content = re.sub(react_import_pattern, new_import, content, count=1)
    
    # Only write if content changed
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True, len(icons_used)
    return False, 0

def main():
    src_dir = r'c:\Users\riley\Desktop\GEM\src'
    files_processed = 0
    icons_migrated = 0
    
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.jsx', '.js')):
                filepath = os.path.join(root, file)
                changed, count = process_file(filepath)
                if changed:
                    files_processed += 1
                    icons_migrated += count
                    print(f"✓ {filepath}: {count} icons migrated")
    
    print(f"\n✅ Migration complete!")
    print(f"   Files processed: {files_processed}")
    print(f"   Icons migrated: {icons_migrated}")

if __name__ == '__main__':
    main()
