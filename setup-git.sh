#!/bin/bash
# Setup git repository for SupiriAccounts PWA

# Initialize git repository
git init

# Add .gitignore
cat > .gitignore << EOL
# IDE files
.vscode/
.idea/
*.sublime-*

# System files
.DS_Store
Thumbs.db

# Temp files
*.log
*.tmp
EOL

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit of SupiriAccounts PWA"

echo "Git repository initialized. To connect to GitHub, run:"
echo "git remote add origin <your-github-repo-url>"
echo "git push -u origin main"
