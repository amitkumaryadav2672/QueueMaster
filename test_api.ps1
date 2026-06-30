# QueueMaster API Testing Script (PowerShell)
# Make sure the backend server is running on http://localhost:5000

$ApiUrl = "http://localhost:5000/api/queue"
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting QueueMaster API Endpoint Tests" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Health Check
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get
    Write-Host "✅ Health Check: Success! Status: $($health.status) at $($health.timestamp)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health Check: Failed. Is the backend server running?" -ForegroundColor Red
    Exit
}

# 2. Get current Queue (Initial state)
Write-Host "`n1. Fetching Initial Queue..." -ForegroundColor Yellow
$queueResponse = Invoke-RestMethod -Uri $ApiUrl -Method Get
Write-Host "✅ Retrieved $($queueResponse.data.Count) active queue entries." -ForegroundColor Green

# 3. Add a Customer to the Queue
Write-Host "`n2. Adding Customer 'Alice Tester' to the Queue..." -ForegroundColor Yellow
$newCustomer = @{
    name = "Alice Tester"
    phone = "9876543210"
    serviceType = "Consultation"
} | ConvertTo-Json

$addResponse = Invoke-RestMethod -Uri $ApiUrl -Method Post -Body $newCustomer -ContentType "application/json"
$customerId = $addResponse.data._id
Write-Host "✅ Customer added successfully! ID: $customerId" -ForegroundColor Green
Write-Host ($addResponse | ConvertTo-Json -Depth 5) -ForegroundColor Gray

# 4. Fetch Queue again to verify addition
Write-Host "`n3. Verifying customer is in the queue..." -ForegroundColor Yellow
$queueResponse = Invoke-RestMethod -Uri $ApiUrl -Method Get
$addedUser = $queueResponse.data | Where-Object { $._id -eq $customerId }
if ($addedUser) {
    Write-Host "✅ Verified: '$($addedUser.name)' exists in queue with status '$($addedUser.status)'." -ForegroundColor Green
} else {
    Write-Host "❌ Failed: Customer not found in queue." -ForegroundColor Red
}

# 5. Move customer to 'Being Served'
Write-Host "`n4. Transitioning customer status to 'Being Served'..." -ForegroundColor Yellow
$serveBody = @{ status = "Being Served" } | ConvertTo-Json
$serveResponse = Invoke-RestMethod -Uri "$ApiUrl/$customerId/status" -Method Patch -Body $serveBody -ContentType "application/json"
Write-Host "✅ Status updated: $($serveResponse.data.status) (Served at: $($serveResponse.data.servedAt))" -ForegroundColor Green

# 6. Move customer to 'Completed'
Write-Host "`n5. Transitioning customer status to 'Completed'..." -ForegroundColor Yellow
$completeBody = @{ status = "Completed" } | ConvertTo-Json
$completeResponse = Invoke-RestMethod -Uri "$ApiUrl/$customerId/status" -Method Patch -Body $completeBody -ContentType "application/json"
Write-Host "✅ Status updated: $($completeResponse.data.status) (Completed at: $($completeResponse.data.completedAt))" -ForegroundColor Green

# 7. Remove/Delete the test customer
Write-Host "`n6. Cleaning up: Removing the test customer..." -ForegroundColor Yellow
$deleteResponse = Invoke-RestMethod -Uri "$ApiUrl/$customerId" -Method Delete
Write-Host "✅ Test customer successfully deleted." -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "All API Endpoint tests completed successfully!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
