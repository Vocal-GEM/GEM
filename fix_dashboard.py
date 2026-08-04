import sys

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Add Activity import
    if "Activity" not in content[:content.find("const ClientDashboard")]:
        content = content.replace("import { Users, FileAudio, TrendingUp, Settings, ChevronRight, Video, FileText, Download } from 'lucide-react';", "import { Users, FileAudio, TrendingUp, Settings, ChevronRight, Video, FileText, Download, Activity } from 'lucide-react';")

    with open(filepath, 'w') as f:
        f.write(content)

if __name__ == "__main__":
    fix_file("src/components/professional/ClientDashboard.jsx")
