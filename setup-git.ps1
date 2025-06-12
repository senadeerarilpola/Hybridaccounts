# Setup git repository for SupiriAccounts PWA

# Initialize git repository
git init

# Add .gitignore
@"
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
"@ | Out-File -FilePath .gitignore -Encoding utf8

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit of SupiriAccounts PWA"

Write-Host "Git repository initialized. To connect to GitHub, run:"
Write-Host "git remote add origin <your-github-repo-url>"
Write-Host "git push -u origin main"
