#!/bin/bash

# Backend Connectivity Test Script
# Run this before deploying to verify backend is accessible

echo "================================"
echo "EV CMS Backend Connectivity Test"
echo "================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="${NEXT_PUBLIC_API_URL:-https://api.ev-cms.com/api/v1}"
OCPP_URL="${NEXT_PUBLIC_OCPP_API_URL:-https://ocpp.ev-cms.com}"
WS_URL="${NEXT_PUBLIC_WS_URL:-wss://api.ev-cms.com}"

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test endpoint
test_endpoint() {
  local name=$1
  local url=$2
  
  echo -n "Testing $name... "
  
  if curl -s -f -I "$url" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}✗ FAIL${NC}"
    echo "  URL: $url"
    ((TESTS_FAILED++))
  fi
}

# Function to test health endpoint
test_health() {
  local name=$1
  local url=$2
  
  echo -n "Testing $name health endpoint... "
  
  response=$(curl -s "$url" 2>/dev/null)
  
  if echo "$response" | grep -q "healthy\|ok"; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "  Response: $response"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}✗ FAIL${NC}"
    echo "  URL: $url"
    echo "  Response: $response"
    ((TESTS_FAILED++))
  fi
}

# Function to test CORS
test_cors() {
  local name=$1
  local url=$2
  local origin="${3:-https://ev-cms-brand-admin.vercel.app}"
  
  echo -n "Testing $name CORS... "
  
  cors_header=$(curl -s -H "Origin: $origin" -I "$url" | grep -i "Access-Control-Allow-Origin" || echo "NOT FOUND")
  
  if [ "$cors_header" != "NOT FOUND" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "  $cors_header"
    ((TESTS_PASSED++))
  else
    echo -e "${YELLOW}⚠ WARNING${NC}"
    echo "  CORS header not found for origin: $origin"
    echo "  Backend needs to whitelist Vercel domain"
    ((TESTS_FAILED++))
  fi
}

echo "Environment Configuration:"
echo "  API URL:     $API_URL"
echo "  OCPP URL:    $OCPP_URL"
echo "  WebSocket:   $WS_URL"
echo ""

# Run Tests
echo "Running Connectivity Tests..."
echo "================================"
echo ""

# Test main API
test_endpoint "Main API" "$API_URL"
test_health "Main API" "$API_URL/health"
test_cors "API" "$API_URL"

echo ""

# Test OCPP API
test_endpoint "OCPP API" "$OCPP_URL"
test_cors "OCPP" "$OCPP_URL"

echo ""

# Test important endpoints
echo "Testing Important Endpoints..."
echo "================================"
test_endpoint "Users Endpoint" "$API_URL/users"
test_endpoint "Chargers Endpoint" "$API_URL/chargers"
test_endpoint "Stations Endpoint" "$API_URL/stations"
test_endpoint "Dashboard Endpoint" "$API_URL/dashboard/stats"
test_endpoint "Billing Endpoint" "$API_URL/billing/invoices"

echo ""
echo "================================"
echo "Test Results"
echo "================================"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed! Backend is ready for deployment.${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠️  Some tests failed. Please check backend configuration.${NC}"
  echo ""
  echo "Common issues:"
  echo "1. Backend is not running or unreachable"
  echo "2. Firewall blocking requests"
  echo "3. CORS not configured on backend"
  echo "4. SSL certificate issues"
  echo ""
  echo "Next steps:"
  echo "1. Verify backend service is running"
  echo "2. Check network connectivity to backend server"
  echo "3. Contact backend team to verify CORS whitelist includes:"
  echo "   - https://ev-cms-brand-admin.vercel.app"
  echo "   - Your custom domain"
  exit 1
fi
