$base = "http://localhost:5000/api"
$errors = 0

function OK($label) { Write-Host "  PASS: $label" -ForegroundColor Green }
function FAIL($label, $detail) {
    Write-Host "  FAIL: $label => $detail" -ForegroundColor Red
    $script:errors++
}

Write-Host ""
Write-Host "[1] Health Check" -ForegroundColor Cyan
try {
    $r = Invoke-RestMethod "$base/health"
    if ($r.success) { OK "/api/health" } else { FAIL "/api/health" "success=false" }
} catch { FAIL "/api/health" $_.Exception.Message }

Write-Host ""
Write-Host "[2] Login - donor" -ForegroundColor Cyan
try {
    $r = Invoke-RestMethod "$base/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"donor@nourish.demo","password":"Donor@123"}'
    $donorToken = $r.token
    if ($r.success -and $donorToken) { OK "POST /auth/login donor" } else { FAIL "POST /auth/login donor" "no token" }
} catch { FAIL "POST /auth/login donor" $_.Exception.Message }

Write-Host ""
Write-Host "[3] Login - admin" -ForegroundColor Cyan
try {
    $r = Invoke-RestMethod "$base/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@nourish.demo","password":"Admin@123"}'
    $adminToken = $r.token
    if ($r.success -and $adminToken) { OK "POST /auth/login admin" } else { FAIL "POST /auth/login admin" "no token" }
} catch { FAIL "POST /auth/login admin" $_.Exception.Message }

Write-Host ""
Write-Host "[4] Login - ngo" -ForegroundColor Cyan
try {
    $r = Invoke-RestMethod "$base/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"ngo@nourish.demo","password":"Ngo@1234"}'
    $ngoToken = $r.token
    if ($r.success -and $ngoToken) { OK "POST /auth/login ngo" } else { FAIL "POST /auth/login ngo" "no token" }
} catch { FAIL "POST /auth/login ngo" $_.Exception.Message }

Write-Host ""
Write-Host "[5] GET /auth/me (donor)" -ForegroundColor Cyan
try {
    $h = @{ Authorization = "Bearer $donorToken" }
    $r = Invoke-RestMethod "$base/auth/me" -Headers $h
    if ($r.success -and $r.data.email -eq "donor@nourish.demo") { OK "GET /auth/me" } else { FAIL "GET /auth/me" "wrong user" }
} catch { FAIL "GET /auth/me" $_.Exception.Message }

Write-Host ""
Write-Host "[6] Register new donor" -ForegroundColor Cyan
try {
    $ts = Get-Date -Format "HHmmss"
    $regBody = '{"name":"Test User ' + $ts + '","email":"test' + $ts + '@demo.com","password":"Test@123","confirmPassword":"Test@123","phone":"9800000001","role":"donor"}'
    $r = Invoke-RestMethod "$base/auth/register" -Method POST -ContentType "application/json" -Body $regBody
    if ($r.success -and $r.token) { OK "POST /auth/register" } else { FAIL "POST /auth/register" "no token" }
} catch { FAIL "POST /auth/register" $_.Exception.Message }

Write-Host ""
Write-Host "[7] GET /donations (public)" -ForegroundColor Cyan
try {
    $r = Invoke-RestMethod "$base/donations"
    if ($r.success) { OK "GET /donations" } else { FAIL "GET /donations" "success=false" }
} catch { FAIL "GET /donations" $_.Exception.Message }

Write-Host ""
Write-Host "[8] POST /donations (create)" -ForegroundColor Cyan
$donationId = $null
try {
    $expiry = (Get-Date).AddDays(1).ToString("yyyy-MM-ddTHH:mm:ssZ")
    $pickup = (Get-Date).AddHours(3).ToString("yyyy-MM-ddTHH:mm:ssZ")
    $donBody = '{"foodName":"Demo Biryani","description":"Leftover from event","category":"Cooked Meals","quantity":40,"unit":"servings","foodType":"Veg","expiryDate":"' + $expiry + '","pickupDate":"' + $pickup + '","pickupTime":"2:00 PM - 4:00 PM","pickupAddress":"14 MG Road","city":"Mumbai","state":"Maharashtra","pincode":"400001"}'
    $h = @{ Authorization = "Bearer $donorToken"; "Content-Type" = "application/json" }
    $r = Invoke-RestMethod "$base/donations" -Method POST -Headers $h -Body $donBody
    $donationId = $r.data._id
    if ($r.success -and $donationId) { OK "POST /donations" } else { FAIL "POST /donations" "no _id" }
} catch { FAIL "POST /donations" $_.Exception.Message }

Write-Host ""
Write-Host "[9] GET /donations/:id" -ForegroundColor Cyan
if ($donationId) {
    try {
        $r = Invoke-RestMethod "$base/donations/$donationId"
        if ($r.success -and $r.data._id -eq $donationId) { OK "GET /donations/$donationId" } else { FAIL "GET /donations/:id" "data mismatch" }
    } catch { FAIL "GET /donations/:id" $_.Exception.Message }
} else {
    Write-Host "  SKIP: No donation ID from step 8" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[10] GET /donations/my" -ForegroundColor Cyan
try {
    $r = Invoke-RestMethod "$base/donations/my" -Headers @{ Authorization = "Bearer $donorToken" }
    if ($r.success) { OK "GET /donations/my" } else { FAIL "GET /donations/my" "success=false" }
} catch { FAIL "GET /donations/my" $_.Exception.Message }

Write-Host ""
Write-Host "[11] GET /admin/reports" -ForegroundColor Cyan
try {
    $r = Invoke-RestMethod "$base/admin/reports" -Headers @{ Authorization = "Bearer $adminToken" }
    if ($r.success -and $r.data.summary) { OK "GET /admin/reports" } else { FAIL "GET /admin/reports" "no summary" }
} catch { FAIL "GET /admin/reports" $_.Exception.Message }

Write-Host ""
Write-Host "[12] GET /categories" -ForegroundColor Cyan
try {
    $r = Invoke-RestMethod "$base/categories"
    if ($r.success -and $r.data.Count -gt 0) { OK "GET /categories ($($r.data.Count) found)" } else { FAIL "GET /categories" "empty" }
} catch { FAIL "GET /categories" $_.Exception.Message }

Write-Host ""
Write-Host "========================================"
if ($errors -eq 0) {
    Write-Host "  ALL 12 TESTS PASSED" -ForegroundColor Green
} else {
    Write-Host "  $errors TESTS FAILED" -ForegroundColor Red
}
Write-Host "========================================"
Write-Host ""
