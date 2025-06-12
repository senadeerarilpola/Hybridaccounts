#!/usr/bin/env pwsh
# Validation script for GitHub Pages deployment
# Validates configuration and paths for GitHub Pages compatibility

Write-Host "Running GitHub Pages Deployment Validation..." -ForegroundColor Cyan

# Define paths
$baseDir = $PSScriptRoot
$publicDir = Join-Path $baseDir "public"
$indexFile = Join-Path $publicDir "index.html"
$manifestFile = Join-Path $publicDir "manifest.json"
$swFile = Join-Path $publicDir "service-worker.js"

$validationErrors = @()
$validationWarnings = @()
$validationSuccess = @()

# Check if public directory exists
if (Test-Path $publicDir) {
    $validationSuccess += "✓ Public directory exists"
} else {
    $validationErrors += "✗ Public directory not found"
}

# Check if index.html exists
if (Test-Path $indexFile) {
    $validationSuccess += "✓ index.html exists"
    
    # Check index.html content for proper path references
    $indexContent = Get-Content $indexFile -Raw
    
    if ($indexContent -match "./src/") {
        $validationSuccess += "✓ index.html contains relative paths using ./src/ pattern"
    } else {
        $validationErrors += "✗ index.html may not be using correct relative paths"
    }
    
    # Check that critical scripts are included
    if ($indexContent -match "data-manager.js") {
        $validationSuccess += "✓ data-manager.js is referenced in index.html"
    } else {
        $validationErrors += "✗ data-manager.js is not referenced in index.html"
    }
    
    if ($indexContent -match "business-analytics.js") {
        $validationSuccess += "✓ business-analytics.js is referenced in index.html"
    } else {
        $validationErrors += "✗ business-analytics.js is not referenced in index.html"
    }
    
    if ($indexContent -match "chart.js") {
        $validationSuccess += "✓ chart.js is referenced in index.html"
    } else {
        $validationErrors += "✗ chart.js is not referenced in index.html"
    }
} else {
    $validationErrors += "✗ index.html not found"
}

# Check manifest.json
if (Test-Path $manifestFile) {
    $validationSuccess += "✓ manifest.json exists"
    
    # Parse and validate manifest.json
    try {
        $manifestContent = Get-Content $manifestFile -Raw | ConvertFrom-Json
        
        # Check for start_url
        if ($manifestContent.start_url -eq "./" -or $manifestContent.start_url -eq ".") {
            $validationSuccess += "✓ manifest.json has correct start_url for GitHub Pages"
        } else {
            $validationWarnings += "⚠ manifest.json start_url may not be compatible with GitHub Pages: $($manifestContent.start_url)"
        }
        
        # Check for icons
        if ($manifestContent.icons -and $manifestContent.icons.Count -gt 0) {
            $validationSuccess += "✓ manifest.json defines icons"
        } else {
            $validationWarnings += "⚠ manifest.json doesn't define icons"
        }
    } catch {
        $validationErrors += "✗ Failed to parse manifest.json: $_"
    }
} else {
    $validationErrors += "✗ manifest.json not found"
}

# Check service-worker.js
if (Test-Path $swFile) {
    $validationSuccess += "✓ service-worker.js exists"
    
    # Check service worker content for proper caching strategy
    $swContent = Get-Content $swFile -Raw
    
    if ($swContent -match "const CACHE_NAME") {
        $validationSuccess += "✓ service-worker.js defines cache name"
    } else {
        $validationWarnings += "⚠ service-worker.js may not define cache name"
    }
    
    if ($swContent -match "./src/utils/business-analytics.js") {
        $validationSuccess += "✓ service-worker.js caches business-analytics.js"
    } else {
        $validationWarnings += "⚠ service-worker.js might not cache business-analytics.js"
    }
    
    if ($swContent -match "./src/utils/data-manager.js") {
        $validationSuccess += "✓ service-worker.js caches data-manager.js"
    } else {
        $validationWarnings += "⚠ service-worker.js might not cache data-manager.js"
    }
} else {
    $validationErrors += "✗ service-worker.js not found"
}

# Check GitHub workflow file
$workflowFile = Join-Path $baseDir "github-workflow-deploy.yml"
if (Test-Path $workflowFile) {
    $validationSuccess += "✓ GitHub workflow file exists"
} else {
    $validationWarnings += "⚠ GitHub workflow file not found. Manual deployment will be required."
}

# Check deployment script
$deployScript = Join-Path $baseDir "deploy-to-github.ps1"
if (Test-Path $deployScript) {
    $validationSuccess += "✓ GitHub Pages deployment script exists"
} else {
    $validationWarnings += "⚠ GitHub Pages deployment script not found. Manual deployment will be required."
}

# Display validation results
Write-Host "`nValidation Results:" -ForegroundColor Cyan
Write-Host "`nSuccessful checks:" -ForegroundColor Green
$validationSuccess | ForEach-Object { Write-Host $_ -ForegroundColor Green }

if ($validationWarnings.Count -gt 0) {
    Write-Host "`nWarnings:" -ForegroundColor Yellow
    $validationWarnings | ForEach-Object { Write-Host $_ -ForegroundColor Yellow }
}

if ($validationErrors.Count -gt 0) {
    Write-Host "`nErrors:" -ForegroundColor Red
    $validationErrors | ForEach-Object { Write-Host $_ -ForegroundColor Red }
    
    Write-Host "`nValidation failed with $($validationErrors.Count) error(s). Please fix these issues before deploying." -ForegroundColor Red
    exit 1
} else {
    Write-Host "`nValidation passed successfully! Your application is ready for GitHub Pages deployment." -ForegroundColor Green
    if ($validationWarnings.Count -gt 0) {
        Write-Host "Consider addressing the $($validationWarnings.Count) warning(s) for optimal deployment." -ForegroundColor Yellow
    }
}

Write-Host "`nTo deploy to GitHub Pages, run one of the following:" -ForegroundColor Cyan
Write-Host "  - Manual: Push your code to GitHub and set up Pages in repository settings" -ForegroundColor Cyan
Write-Host "  - Automated: Use deploy-to-github.ps1 script" -ForegroundColor Cyan
Write-Host "  - CI/CD: Ensure github-workflow-deploy.yml is in .github/workflows/ on GitHub" -ForegroundColor Cyan
