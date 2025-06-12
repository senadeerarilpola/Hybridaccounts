# GitHub Pages Deployment Script
# For SupiriAccounts PWA

param(
    [string]$CommitMessage = "Update SupiriAccounts PWA",
    [string]$GithubUsername = "",
    [string]$RepoName = "supiriaccounts"
)

# Check if git is installed
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Git is not installed. Please install Git and try again."
    exit 1
}

# Prepare the deployment
Write-Host "Preparing SupiriAccounts for deployment..." -ForegroundColor Green

# Ensure we're in the right directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Check if repository needs to be initialized
if (-not (Test-Path .git)) {
    Write-Host "Initializing Git repository..." -ForegroundColor Cyan
    git init
}

# If username is provided, set remote
if ($GithubUsername -ne "") {
    $remoteUrl = "https://github.com/$GithubUsername/$RepoName.git"
    
    # Check if remote already exists
    $remoteExists = git remote -v | Select-String -Pattern "origin"
    
    if ($remoteExists) {
        Write-Host "Remote 'origin' already exists. Updating URL..." -ForegroundColor Yellow
        git remote set-url origin $remoteUrl
    } else {
        Write-Host "Adding remote 'origin'..." -ForegroundColor Cyan
        git remote add origin $remoteUrl
    }
}

# Stage all files
Write-Host "Staging files for commit..." -ForegroundColor Cyan
git add .

# Commit changes
Write-Host "Committing changes..." -ForegroundColor Cyan
git commit -m $CommitMessage

# Push if remote is configured
try {
    $remoteExists = git remote -v | Select-String -Pattern "origin"
    if ($remoteExists) {
        Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
        git push -u origin main
        Write-Host "Deployment complete!" -ForegroundColor Green
        Write-Host "Your app will be available at: https://$GithubUsername.github.io/$RepoName/" -ForegroundColor Green
        Write-Host "Note: It may take a few minutes for GitHub Pages to build and deploy your site." -ForegroundColor Yellow
    } else {
        Write-Host "Changes committed locally. To push to GitHub:" -ForegroundColor Yellow
        Write-Host "1. Create a repository on GitHub" -ForegroundColor Yellow
        Write-Host "2. Run this script again with your GitHub username:" -ForegroundColor Yellow
        Write-Host "   .\deploy-to-github.ps1 -GithubUsername YourUsername" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error pushing to GitHub. Please check your connection and credentials." -ForegroundColor Red
}

# Reminder about GitHub Pages setup
if ($GithubUsername -ne "") {
    Write-Host "`nIMPORTANT:" -ForegroundColor Magenta
    Write-Host "To enable GitHub Pages:" -ForegroundColor Magenta
    Write-Host "1. Go to https://github.com/$GithubUsername/$RepoName/settings/pages" -ForegroundColor Magenta
    Write-Host "2. Select 'main' branch as the source" -ForegroundColor Magenta
    Write-Host "3. Choose the root folder (/) for your site" -ForegroundColor Magenta
    Write-Host "4. Click Save" -ForegroundColor Magenta
}
