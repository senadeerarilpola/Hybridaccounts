Write-Host "Starting SupiriAccounts PWA development server..."
Write-Host "Press Ctrl+C to stop the server"
Write-Host ""

# Check if http-server is installed via npm
$httpServerInstalled = $null
try {
    $httpServerInstalled = npm list -g http-server
} catch {
    # npm command not found or http-server not installed
}

if ($httpServerInstalled -match "http-server") {
    # Use http-server if available
    Write-Host "Using http-server..."
    npx http-server -p 8080 -c-1 -o
} else {
    # Fall back to Python's built-in server
    Write-Host "http-server not found, using Python's built-in server..."
    
    # Check if Python is available
    try {
        $pythonVersion = python --version
        
        # Start Python server
        Write-Host "Starting Python server at http://localhost:8000"
        Set-Location -Path "d:\VS with Python\HybridApp"
        python -m http.server 8000
        
    } catch {
        # Python not available, show error
        Write-Host "Error: Neither http-server nor Python is available." -ForegroundColor Red
        Write-Host "Please install one of the following:" -ForegroundColor Red
        Write-Host "1. Node.js and http-server: npm install -g http-server" -ForegroundColor Yellow
        Write-Host "2. Python: https://www.python.org/downloads/" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
}
