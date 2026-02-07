# Backend Connectivity Test Script (PowerShell)
# Run this before deploying to verify backend is accessible

Write-Host "================================" -ForegroundColor Cyan
Write-Host "EV CMS Backend Connectivity Test" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$API_URL = $env:API_URL -or "https://api.ev-cms.com/api/v1"
$OCPP_URL = $env:OCPP_API_URL -or "https://ocpp.ev-cms.com"
$WS_URL = $env:WS_URL -or "wss://api.ev-cms.com"

# Test counter
$TestsPassed = 0
$TestsFailed = 0

# Function to test endpoint
function Test-Endpoint {
  param(
    [string]$Name,
    [string]$Url
  )
  
  Write-Host -NoNewline "Testing $Name... "
  
  try {
    $response = Invoke-WebRequest -Uri $Url -Method Head -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ PASS" -ForegroundColor Green
    $script:TestsPassed++
  }
  catch {
    Write-Host "✗ FAIL" -ForegroundColor Red
    Write-Host "  URL: $Url" -ForegroundColor Yellow
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Yellow
    $script:TestsFailed++
  }
}

# Function to test health endpoint
function Test-Health {
  param(
    [string]$Name,
    [string]$Url
  )
  
  Write-Host -NoNewline "Testing $Name health endpoint... "
  
  try {
    $response = Invoke-WebRequest -Uri $Url -TimeoutSec 5 -ErrorAction Stop
    $content = $response.Content
    
    if ($content -match "healthy|ok|status") {
      Write-Host "✓ PASS" -ForegroundColor Green
      Write-Host "  Response: $content" -ForegroundColor Gray
      $script:TestsPassed++
    }
    else {
      Write-Host "⚠ WARNING" -ForegroundColor Yellow
      Write-Host "  Response: $content" -ForegroundColor Gray
      $script:TestsFailed++
    }
  }
  catch {
    Write-Host "✗ FAIL" -ForegroundColor Red
    Write-Host "  URL: $Url" -ForegroundColor Yellow
    $script:TestsFailed++
  }
}

# Function to test CORS
function Test-CORS {
  param(
    [string]$Name,
    [string]$Url,
    [string]$Origin = "https://ev-cms-brand-admin.vercel.app"
  )
  
  Write-Host -NoNewline "Testing $Name CORS... "
  
  try {
    $response = Invoke-WebRequest -Uri $Url -Headers @{"Origin" = $Origin } -TimeoutSec 5 -ErrorAction SilentlyContinue
    $corsHeader = $response.Headers["Access-Control-Allow-Origin"]
    
    if ($corsHeader) {
      Write-Host "✓ PASS" -ForegroundColor Green
      Write-Host "  $corsHeader" -ForegroundColor Gray
      $script:TestsPassed++
    }
    else {
      Write-Host "⚠ WARNING" -ForegroundColor Yellow
      Write-Host "  CORS header not found for origin: $Origin" -ForegroundColor Yellow
      Write-Host "  Backend needs to whitelist Vercel domain" -ForegroundColor Yellow
      $script:TestsFailed++
    }
  }
  catch {
    Write-Host "⚠ WARNING" -ForegroundColor Yellow
    Write-Host "  Could not verify CORS" -ForegroundColor Yellow
  }
}

Write-Host "Environment Configuration:" -ForegroundColor Cyan
Write-Host "  API URL:     $API_URL"
Write-Host "  OCPP URL:    $OCPP_URL"
Write-Host "  WebSocket:   $WS_URL"
Write-Host ""

# Run Tests
Write-Host "Running Connectivity Tests..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Test main API
Test-Endpoint "Main API" $API_URL
Test-Health "Main API" "$API_URL/health"
Test-CORS "API" $API_URL

Write-Host ""

# Test OCPP API
Test-Endpoint "OCPP API" $OCPP_URL
Test-CORS "OCPP" $OCPP_URL

Write-Host ""

# Test important endpoints
Write-Host "Testing Important Endpoints..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Test-Endpoint "Users Endpoint" "$API_URL/users"
Test-Endpoint "Chargers Endpoint" "$API_URL/chargers"
Test-Endpoint "Stations Endpoint" "$API_URL/stations"
Test-Endpoint "Dashboard Endpoint" "$API_URL/dashboard/stats"
Test-Endpoint "Billing Endpoint" "$API_URL/billing/invoices"

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Test Results" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Passed: $TestsPassed" -ForegroundColor Green
Write-Host "Failed: $TestsFailed" -ForegroundColor Red
Write-Host ""

if ($TestsFailed -eq 0) {
  Write-Host "✅ All tests passed! Backend is ready for deployment." -ForegroundColor Green
  exit 0
}
else {
  Write-Host "⚠️  Some tests failed. Please check backend configuration." -ForegroundColor Yellow
  Write-Host ""
  Write-Host "Common issues:" -ForegroundColor Cyan
  Write-Host "1. Backend is not running or unreachable"
  Write-Host "2. Firewall blocking requests"
  Write-Host "3. CORS not configured on backend"
  Write-Host "4. SSL certificate issues"
  Write-Host ""
  Write-Host "Next steps:" -ForegroundColor Cyan
  Write-Host "1. Verify backend service is running"
  Write-Host "2. Check network connectivity to backend server"
  Write-Host "3. Contact backend team to verify CORS whitelist includes:"
  Write-Host "   - https://ev-cms-brand-admin.vercel.app"
  Write-Host "   - Your custom domain"
  exit 1
}
