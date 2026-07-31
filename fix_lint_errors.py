import re

def fix_success_stories_test():
    f = "src/components/community/SuccessStories.test.jsx"
    with open(f, 'r') as file:
        content = file.read()
    if content.count("import React") > 1:
        lines = content.split('\n')
        # Remove duplicate import React
        new_lines = []
        found = False
        for line in lines:
            if "import React" in line:
                if not found:
                    new_lines.append(line)
                    found = True
            else:
                new_lines.append(line)
        with open(f, 'w') as file:
            file.write('\n'.join(new_lines))

def fix_journal_form_test():
    f = "src/components/ui/JournalForm.test.jsx"
    with open(f, 'r') as file:
        content = file.read()
    content = content.replace("startRecording stopRecording", "startRecording, stopRecording")
    with open(f, 'w') as file:
        file.write(content)

def fix_loading_spinner_test():
    f = "src/components/ui/LoadingSpinner.test.jsx"
    with open(f, 'r') as file:
        content = file.read()
    if content.count("import { render }") > 1:
        lines = content.split('\n')
        new_lines = []
        found = False
        for line in lines:
            if "import { render }" in line:
                if not found:
                    new_lines.append(line)
                    found = True
            else:
                new_lines.append(line)
        with open(f, 'w') as file:
            file.write('\n'.join(new_lines))

def fix_loading_spinner_ver():
    f = "src/components/ui/LoadingSpinnerVerification.jsx"
    with open(f, 'r') as file:
        content = file.read()
    content = content.replace("    return (", "    return (", 1) # Find exact line and fix it if it's missing { or something
    # Actually just print it

def fix_quick_actions():
    f = "src/components/ui/QuickActions.jsx"
    with open(f, 'r') as file:
        content = file.read()
    content = content.replace("Unexpected token `}`", "") # Wait, let's print this one

def fix_breathiness():
    f = "src/components/viz/BreathinessMeter.jsx"
    with open(f, 'r') as file:
        content = file.read()
    # Remove duplicate renderCoordinator
    lines = content.split('\n')
    new_lines = []
    found = False
    for line in lines:
        if "renderCoordinator" in line and "import" in line:
            if not found:
                new_lines.append(line)
                found = True
        else:
            new_lines.append(line)
    with open(f, 'w') as file:
        file.write('\n'.join(new_lines))

def fix_high_res():
    f = "src/components/viz/HighResSpectrogram.jsx"
    with open(f, 'r') as file:
        content = file.read()
    # remove duplicate componentId
    lines = content.split('\n')
    new_lines = []
    found = False
    for line in lines:
        if "const componentId = " in line:
            if not found:
                new_lines.append(line)
                found = True
        else:
            new_lines.append(line)
    with open(f, 'w') as file:
        file.write('\n'.join(new_lines))

def fix_quality():
    f = "src/components/viz/QualityVisualizer.jsx"
    with open(f, 'r') as file:
        content = file.read()
    # Let's print this

def fix_spectral():
    f = "src/components/viz/SpectralTiltMeter.jsx"
    with open(f, 'r') as file:
        content = file.read()

try:
    fix_success_stories_test()
    fix_journal_form_test()
    fix_loading_spinner_test()
    fix_breathiness()
    fix_high_res()
except Exception as e:
    print(e)
