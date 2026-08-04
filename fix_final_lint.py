import sys

def fix_success_stories():
    filepath = "src/components/community/SuccessStories.test.jsx"
    with open(filepath, 'r') as f:
        content = f.read()
    content = content.replace("import React from 'react';\nimport { render, screen, fireEvent } from '@testing-library/react';", "import { render, screen, fireEvent } from '@testing-library/react';")
    with open(filepath, 'w') as f:
        f.write(content)

def fix_journal_form():
    filepath = "src/components/ui/JournalForm.test.jsx"
    with open(filepath, 'r') as f:
        content = f.read()
    content = content.replace("    stopRecording: vi.fn(),\n    stopRecording: vi.fn(),", "    stopRecording: vi.fn(),")
    with open(filepath, 'w') as f:
        f.write(content)

def fix_loading_spinner():
    filepath = "src/components/ui/LoadingSpinner.test.jsx"
    with open(filepath, 'r') as f:
        content = f.read()
    content = content.replace("import { render, screen } from '@testing-library/react';\nimport { render, screen } from '@testing-library/react';", "import { render, screen } from '@testing-library/react';")
    with open(filepath, 'w') as f:
        f.write(content)

def fix_quick_actions():
    filepath = "src/components/ui/QuickActions.jsx"
    with open(filepath, 'r') as f:
        content = f.read()
    content = content.replace("        </div>}\n        </div>", "        </div>\n")
    # Quick fix for QuickActions since it's probably mismatched brackets. Actually let's not touch if we don't know the exact lines, but wait, the CI log says Line 81: Unexpected token `}`. Did you mean `&rbrace;` or `{"}"}`?
    content = content.replace("    }\n    }", "    }")
    with open(filepath, 'w') as f:
        f.write(content)

if __name__ == "__main__":
    try: fix_success_stories()
    except: pass
    try: fix_journal_form()
    except: pass
    try: fix_loading_spinner()
    except: pass
