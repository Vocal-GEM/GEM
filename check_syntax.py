
import re

def check_file(filepath):
    print(f"Checking {filepath}...")
    try:
        with open(filepath, 'r') as f:
            content = f.read()

        # Simple stack-based checker for braces/parens
        stack = []
        lines = content.split('\n')
        for i, line in enumerate(lines):
            for char in line:
                if char in '{[(':
                    stack.append((char, i + 1))
                elif char in '}])':
                    if not stack:
                        print(f"  Error: Unmatched closing '{char}' at line {i + 1}")
                        return False
                    last, last_line = stack.pop()
                    if (last == '{' and char != '}') or \
                       (last == '[' and char != ']') or \
                       (last == '(' and char != ')'):
                        print(f"  Error: Mismatched '{last}' (line {last_line}) and '{char}' (line {i + 1})")
                        return False

        if stack:
            print(f"  Error: Unclosed '{stack[-1][0]}' at line {stack[-1][1]}")
            return False

        print("  Syntax check passed (basic structural).")
        return True
    except Exception as e:
        print(f"  Error reading file: {e}")
        return False

files = [
    'src/components/professional/TaskRecorder.jsx',
    'src/components/professional/ClientDashboard.jsx',
    'src/components/ui/MicrophoneCalibration.jsx',
    'src/components/ui/IntakeQuestionnaire.jsx'
]

for file in files:
    check_file(file)
