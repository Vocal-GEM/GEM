import sys

def fix_activity():
    filepath = "src/components/marketplace/MarketplaceBrowser.jsx"
    with open(filepath, 'r') as f:
        content = f.read()

    # Add Activity import
    if "Activity" not in content[:content.find("const MarketplaceBrowser")]:
        content = content.replace("import { Search, Filter, Star, Clock, Download, ChevronRight, User, Tag, Sparkles } from 'lucide-react';", "import { Search, Filter, Star, Clock, Download, ChevronRight, User, Tag, Sparkles, Activity } from 'lucide-react';")

    with open(filepath, 'w') as f:
        f.write(content)

if __name__ == "__main__":
    fix_activity()
