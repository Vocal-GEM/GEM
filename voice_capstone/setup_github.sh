#!/bin/bash
# GitHub Repository Setup Script
# Run this after downloading the project zip

echo "🎙️ Voice Capstone Project - GitHub Setup"
echo "=========================================="

# Initialize git
git init
echo "✓ Initialized git repository"

# Create .gitignore
cat > .gitignore << 'EOF'
# Audio files (too large for GitHub, download separately)
data/raw_audio/*.wav
data/raw_audio/*.mp3

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
.env

# Jupyter
.ipynb_checkpoints/
*.ipynb_checkpoints

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Output files (regenerate with scripts)
# Uncomment if you don't want to track these:
# data/processed/*.csv
# visualizations/*.png
EOF
echo "✓ Created .gitignore"

# Stage all files
git add .
echo "✓ Staged files"

# Initial commit
git commit -m "Initial commit: Voice acoustic analysis capstone project

- Feature extraction script (Parselmouth/Praat)
- Analysis script with visualizations
- Project documentation and README
- Download checklist for VVD dataset"
echo "✓ Created initial commit"

echo ""
echo "=========================================="
echo "✓ Local setup complete!"
echo ""
echo "Next steps:"
echo "1. Create a new repository on GitHub:"
echo "   https://github.com/new"
echo "   Name: voice-acoustic-analysis (or your preference)"
echo ""
echo "2. Connect and push:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/voice-acoustic-analysis.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Download audio files and run analysis!"
echo "=========================================="
