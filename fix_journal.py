import sys

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    content = content.replace("        stopRecording: vi.fn().mockResolvedValue('mock-url'),\n      }\n    }\n  })\n        stopRecording: vi.fn(),\n      },\n    },\n  }),\n}));", "        stopRecording: vi.fn().mockResolvedValue('mock-url'),\n      }\n    }\n  })\n}));")
    with open(filepath, 'w') as f:
        f.write(content)

if __name__ == "__main__":
    fix_file("src/components/ui/JournalForm.test.jsx")
