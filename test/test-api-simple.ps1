# PowerShell API Test Script for Portfolio Chatbot
# Usage: .\test-api-simple.ps1

$BaseUrl = "http://localhost:5000"
$ApiVersion = "/api/v1"
$Headers = @{
    "Content-Type" = "application/json"
}

Write-Host "Testing Portfolio Chatbot API..." -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "1. Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl$ApiVersion/health" -Method GET
    Write-Host "Success: Status = $($response.status)" -ForegroundColor Green
    Write-Host "Providers: $($response.providers | ConvertTo-Json -Compress)" -ForegroundColor Green
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Basic Chat
Write-Host "2. Basic Chat Test..." -ForegroundColor Yellow
try {
    $body = @{ message = "What projects have you built?" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$BaseUrl$ApiVersion/chat" -Method POST -Headers $Headers -Body $body
    Write-Host "Success: Source = $($response.source), Provider = $($response.provider)" -ForegroundColor Green
    Write-Host "Reply (first 100 chars): $($response.reply.Substring(0, [Math]::Min(100, $response.reply.Length)))..." -ForegroundColor Blue
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Skills Question
Write-Host "3. Skills Question..." -ForegroundColor Yellow
try {
    $body = @{ message = "What programming languages do you know?" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$BaseUrl$ApiVersion/chat" -Method POST -Headers $Headers -Body $body
    Write-Host "Success: Source = $($response.source)" -ForegroundColor Green
    Write-Host "Reply (first 100 chars): $($response.reply.Substring(0, [Math]::Min(100, $response.reply.Length)))..." -ForegroundColor Blue
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Out-of-Scope Question
Write-Host "4. Out-of-Scope Test..." -ForegroundColor Yellow
try {
    $body = @{ message = "What is your favorite breakfast?" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$BaseUrl$ApiVersion/chat" -Method POST -Headers $Headers -Body $body
    Write-Host "Success: Source = $($response.source)" -ForegroundColor Green
    if ($response.reply -match "portfolio assistant") {
        Write-Host "Smart redirection working!" -ForegroundColor Green
    }
    Write-Host "Reply (first 100 chars): $($response.reply.Substring(0, [Math]::Min(100, $response.reply.Length)))..." -ForegroundColor Blue
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 5: Error Handling Test
Write-Host "5. Error Handling Test..." -ForegroundColor Yellow
try {
    $body = @{ message = "" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$BaseUrl$ApiVersion/chat" -Method POST -Headers $Headers -Body $body -ErrorAction Stop
    Write-Host "ERROR: Should have failed with empty message!" -ForegroundColor Red
} catch {
    Write-Host "Success: Error handling works correctly" -ForegroundColor Green
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Blue
}
Write-Host ""

# Test 6: Portfolio Data
Write-Host "6. Portfolio Data..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl$ApiVersion/portfolio" -Method GET
    Write-Host "Success: Portfolio Owner = $($response.owner)" -ForegroundColor Green
    Write-Host "Profile: $($response.data.profile.Substring(0, [Math]::Min(50, $response.data.profile.Length)))..." -ForegroundColor Blue
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 7: Analytics
Write-Host "7. Analytics..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl$ApiVersion/analytics" -Method GET
    Write-Host "Success: Total Queries = $($response.totalQueries)" -ForegroundColor Green
    Write-Host "Provider Usage: $($response.providerUsage | ConvertTo-Json -Compress)" -ForegroundColor Green
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 8: Performance Test
Write-Host "8. Performance Test (3 quick requests)..." -ForegroundColor Yellow
$totalTime = 0
$successCount = 0

for ($i = 1; $i -le 3; $i++) {
    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $body = @{ message = "Quick test $i" } | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "$BaseUrl$ApiVersion/chat" -Method POST -Headers $Headers -Body $body
        $stopwatch.Stop()
        $totalTime += $stopwatch.ElapsedMilliseconds
        $successCount++
        Write-Host "  Request ${i}: $($stopwatch.ElapsedMilliseconds)ms" -ForegroundColor Blue
    } catch {
        Write-Host "  Request ${i} failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

if ($successCount -gt 0) {
    Write-Host "Average Response Time: $([Math]::Round($totalTime / $successCount, 2))ms" -ForegroundColor Green
} else {
    Write-Host "No successful requests in performance test!" -ForegroundColor Red
}
Write-Host ""

Write-Host "Test Summary Complete!" -ForegroundColor Green
Write-Host "Check your analytics endpoint for updated stats!" -ForegroundColor Cyan