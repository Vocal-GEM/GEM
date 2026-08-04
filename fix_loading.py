import sys

def fix_file(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()

    with open(filepath, 'w') as f:
        f.writelines(lines[3:])

if __name__ == "__main__":
    fix_file("src/components/ui/LoadingSpinner.test.jsx")
