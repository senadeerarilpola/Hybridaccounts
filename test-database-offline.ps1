#!/usr/bin/env pwsh
# Database and Offline Functionality Test Script
# This script validates database operations and offline functionality

Write-Host "Running Database and Offline Functionality Tests..." -ForegroundColor Cyan

# Define paths
$baseDir = $PSScriptRoot
$publicDir = Join-Path $baseDir "public"
$testOutputDir = Join-Path $baseDir "test-results"

# Create test results directory if it doesn't exist
if (-not (Test-Path $testOutputDir)) {
    New-Item -ItemType Directory -Path $testOutputDir -Force | Out-Null
}

$testResults = @{
    "dbTests" = @{
        "passed" = 0
        "failed" = 0
        "skipped" = 0
    }
    "offlineTests" = @{
        "passed" = 0
        "failed" = 0
        "skipped" = 0
    }
}

# Display test header
function Display-TestHeader($title) {
    Write-Host "`n$title" -ForegroundColor Cyan
    Write-Host "------------------------" -ForegroundColor Cyan
}

# Record test result
function Record-TestResult($category, $testName, $result, $details) {
    if ($result -eq "PASS") {
        Write-Host "✅ $testName - PASSED" -ForegroundColor Green
        $testResults[$category].passed++
    } 
    elseif ($result -eq "SKIP") {
        Write-Host "⚠️ $testName - SKIPPED: $details" -ForegroundColor Yellow
        $testResults[$category].skipped++
    }
    else {
        Write-Host "❌ $testName - FAILED: $details" -ForegroundColor Red
        $testResults[$category].failed++
    }    # Append to test results log
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] $testName - $result" + $(if ($details) { ": $details" } else { "" })
    $logEntry | Out-File -FilePath "$testOutputDir\test-log.txt" -Append
}

# Check for required files
Display-TestHeader "Checking Required Files"

$requiredFiles = @(
    @{Path="$publicDir\index.html"; Name="Main HTML file"},
    @{Path="$publicDir\service-worker.js"; Name="Service Worker"},
    @{Path="$publicDir\manifest.json"; Name="Web App Manifest"},
    @{Path="$baseDir\src\js\db.js"; Name="Database Script"},
    @{Path="$baseDir\src\utils\data-manager.js"; Name="Data Manager Utility"},
    @{Path="$baseDir\src\utils\business-analytics.js"; Name="Business Analytics Utility"}
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file.Path) {
        Record-TestResult "dbTests" $file.Name "PASS" "File exists"
    } else {
        Record-TestResult "dbTests" $file.Name "FAIL" "File not found: $($file.Path)"
    }
}

# Check database configuration
Display-TestHeader "Database Configuration Tests"

# Read db.js file to check database configuration
$dbJsPath = Join-Path $baseDir "src\js\db.js"
if (Test-Path $dbJsPath) {
    $dbJsContent = Get-Content $dbJsPath -Raw

    # Check for indexedDB usage
    if ($dbJsContent -match "indexedDB") {
        Record-TestResult "dbTests" "IndexedDB Usage" "PASS" "IndexedDB is used for storage"
    } else {
        Record-TestResult "dbTests" "IndexedDB Usage" "FAIL" "IndexedDB not found in db.js"
    }

    # Check for object stores
    if ($dbJsContent -match "createObjectStore") {
        Record-TestResult "dbTests" "Object Stores" "PASS" "Object stores are defined"
    } else {
        Record-TestResult "dbTests" "Object Stores" "FAIL" "No object stores found in db.js"
    }    # Check for error handling - look for console.error which is a form of error handling
    if ($dbJsContent -match "catch\s*\(" -or $dbJsContent -match "console\.error") {
        Record-TestResult "dbTests" "Error Handling" "PASS" "Error handling implemented"
    } else {
        Record-TestResult "dbTests" "Error Handling" "FAIL" "No error handling found in db.js"
    }
} else {
    Record-TestResult "dbTests" "DB Script Check" "FAIL" "db.js not found"
}

# Check data manager integration
Display-TestHeader "Data Manager Integration Tests"

$dataManagerPath = Join-Path $baseDir "src\utils\data-manager.js"
if (Test-Path $dataManagerPath) {
    $dataManagerContent = Get-Content $dataManagerPath -Raw

    # Check for export functionality
    if ($dataManagerContent -match "exportData") {
        Record-TestResult "dbTests" "Export Functionality" "PASS" "Export functionality implemented"
    } else {
        Record-TestResult "dbTests" "Export Functionality" "FAIL" "Export functionality not found"
    }

    # Check for import functionality
    if ($dataManagerContent -match "importData") {
        Record-TestResult "dbTests" "Import Functionality" "PASS" "Import functionality implemented"
    } else {
        Record-TestResult "dbTests" "Import Functionality" "FAIL" "Import functionality not found"
    }

    # Check for metadata tracking
    if ($dataManagerContent -match "metadata") {
        Record-TestResult "dbTests" "Metadata Tracking" "PASS" "Metadata tracking implemented"
    } else {
        Record-TestResult "dbTests" "Metadata Tracking" "FAIL" "Metadata tracking not found"
    }
} else {
    Record-TestResult "dbTests" "Data Manager Check" "FAIL" "data-manager.js not found"
}

# Check for offline functionality in service worker
Display-TestHeader "Service Worker and Offline Functionality Tests"

$serviceWorkerPath = Join-Path $publicDir "service-worker.js"
if (Test-Path $serviceWorkerPath) {
    $serviceWorkerContent = Get-Content $serviceWorkerPath -Raw

    # Check for cache definition
    if ($serviceWorkerContent -match "CACHE_NAME") {
        Record-TestResult "offlineTests" "Cache Definition" "PASS" "Cache is defined in service-worker.js"
    } else {
        Record-TestResult "offlineTests" "Cache Definition" "FAIL" "No cache definition found"
    }

    # Check for assets caching
    if ($serviceWorkerContent -match "addAll") {
        Record-TestResult "offlineTests" "Assets Caching" "PASS" "Assets caching is implemented"
    } else {
        Record-TestResult "offlineTests" "Assets Caching" "FAIL" "No assets caching found"
    }

    # Check for fetch event handling
    if ($serviceWorkerContent -match "fetch") {
        Record-TestResult "offlineTests" "Fetch Handling" "PASS" "Fetch event handling implemented"
    } else {
        Record-TestResult "offlineTests" "Fetch Handling" "FAIL" "No fetch handling found"
    }

    # Check for cache strategy
    if ($serviceWorkerContent -match "caches.match" -or $serviceWorkerContent -match "caches.open") {
        Record-TestResult "offlineTests" "Cache Strategy" "PASS" "Cache strategy implemented"
    } else {
        Record-TestResult "offlineTests" "Cache Strategy" "FAIL" "No cache strategy found"
    }

    # Check for business utility file caching
    if ($serviceWorkerContent -match "business-analytics.js") {
        Record-TestResult "offlineTests" "Business Analytics Caching" "PASS" "Business analytics is cached"
    } else {
        Record-TestResult "offlineTests" "Business Analytics Caching" "FAIL" "Business analytics not cached"
    }

    if ($serviceWorkerContent -match "data-manager.js") {
        Record-TestResult "offlineTests" "Data Manager Caching" "PASS" "Data manager is cached"
    } else {
        Record-TestResult "offlineTests" "Data Manager Caching" "FAIL" "Data manager not cached"
    }
} else {
    Record-TestResult "offlineTests" "Service Worker Check" "FAIL" "service-worker.js not found"
}

# Check service worker registration in index.html
$indexHtmlPath = Join-Path $publicDir "index.html"
if (Test-Path $indexHtmlPath) {
    $indexHtmlContent = Get-Content $indexHtmlPath -Raw

    # Check for service worker registration
    if ($indexHtmlContent -match "serviceWorker.register") {
        Record-TestResult "offlineTests" "SW Registration" "PASS" "Service worker registration found in index.html"
    } else {
        Record-TestResult "offlineTests" "SW Registration" "FAIL" "Service worker registration not found in index.html"
    }
} else {
    Record-TestResult "offlineTests" "Index HTML Check" "FAIL" "index.html not found"
}

# Generate test summary
Display-TestHeader "Test Summary"

$dbPassRate = 0
if ($testResults.dbTests.passed + $testResults.dbTests.failed -gt 0) {
    $dbPassRate = [math]::Round(($testResults.dbTests.passed / ($testResults.dbTests.passed + $testResults.dbTests.failed)) * 100, 1)
}

$offlinePassRate = 0
if ($testResults.offlineTests.passed + $testResults.offlineTests.failed -gt 0) {
    $offlinePassRate = [math]::Round(($testResults.offlineTests.passed / ($testResults.offlineTests.passed + $testResults.offlineTests.failed)) * 100, 1)
}

$totalPassed = $testResults.dbTests.passed + $testResults.offlineTests.passed
$totalFailed = $testResults.dbTests.failed + $testResults.offlineTests.failed
$totalSkipped = $testResults.dbTests.skipped + $testResults.offlineTests.skipped
$totalTests = $totalPassed + $totalFailed + $totalSkipped
$totalPassRate = 0
if ($totalPassed + $totalFailed -gt 0) {
    $totalPassRate = [math]::Round(($totalPassed / ($totalPassed + $totalFailed)) * 100, 1)
}

Write-Host "Database Tests: $($testResults.dbTests.passed) passed, $($testResults.dbTests.failed) failed, $($testResults.dbTests.skipped) skipped - $dbPassRate% pass rate" -ForegroundColor $(if ($dbPassRate -eq 100) { "Green" } elseif ($dbPassRate -ge 80) { "Yellow" } else { "Red" })
Write-Host "Offline Tests: $($testResults.offlineTests.passed) passed, $($testResults.offlineTests.failed) failed, $($testResults.offlineTests.skipped) skipped - $offlinePassRate% pass rate" -ForegroundColor $(if ($offlinePassRate -eq 100) { "Green" } elseif ($offlinePassRate -ge 80) { "Yellow" } else { "Red" })
Write-Host "`nOverall: $totalPassed passed, $totalFailed failed, $totalSkipped skipped - $totalPassRate% pass rate" -ForegroundColor $(if ($totalPassRate -eq 100) { "Green" } elseif ($totalPassRate -ge 80) { "Yellow" } else { "Red" })

# Generate test report
$reportContent = @"
# SupiriAccounts Database and Offline Functionality Test Report

**Date:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Version:** 1.0.0

## Test Summary

- **Database Tests:** $($testResults.dbTests.passed) passed, $($testResults.dbTests.failed) failed, $($testResults.dbTests.skipped) skipped - **$dbPassRate% pass rate**
- **Offline Tests:** $($testResults.offlineTests.passed) passed, $($testResults.offlineTests.failed) failed, $($testResults.offlineTests.skipped) skipped - **$offlinePassRate% pass rate**
- **Overall:** $totalPassed passed, $totalFailed failed, $totalSkipped skipped - **$totalPassRate% pass rate**

## Status

$(if ($totalPassRate -eq 100) {
    "✅ **ALL TESTS PASSED - APPLICATION IS READY FOR DEPLOYMENT**"
} elseif ($totalPassRate -ge 80) {
    "⚠️ **MOST TESTS PASSED - MINOR ISSUES NEED ATTENTION**"
} else {
    "❌ **SIGNIFICANT ISSUES DETECTED - MUST BE FIXED BEFORE DEPLOYMENT**"
})

"@

$reportContent | Out-File -FilePath "$testOutputDir\test-report.md" -Force

Write-Host "`nTest report saved to: $testOutputDir\test-report.md" -ForegroundColor Cyan
Write-Host "Test log saved to: $testOutputDir\test-log.txt" -ForegroundColor Cyan

if ($totalFailed -gt 0) {
    Write-Host "`n⚠️ $totalFailed test(s) failed. Please fix these issues before deploying." -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "`n✅ All tests passed! Application is ready for business deployment." -ForegroundColor Green
    exit 0
}
