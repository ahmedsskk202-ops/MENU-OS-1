param([int]$Port = 8890)
$ErrorActionPreference = 'Continue'
$failures = 0
$base = "http://localhost:$Port"
$curl = "$env:SystemRoot\System32\curl.exe"
$reqBody = 'C:\Users\techmoiq\AppData\Local\Temp\opencode\curl-req.tmp'
$respBody = 'C:\Users\techmoiq\AppData\Local\Temp\opencode\curl-resp.tmp'
$hdr = 'C:\Users\techmoiq\AppData\Local\Temp\opencode\curl-hdr.tmp'

function Call($method, $path, $jsonText, $authToken) {
  if ($jsonText -ne $null) { Set-Content -LiteralPath $reqBody -Value $jsonText -NoNewline -Encoding Ascii }
  $argsList = @('-s', '-o', $respBody, '-D', $hdr, '-w', '%{http_code}', '-X', $method)
  if ($authToken) { $argsList += @('-H', "Authorization: Bearer $authToken") }
  if ($jsonText -ne $null) {
    $argsList += @('-H', 'Content-Type: application/json')
    $argsList += @('-d', "@$reqBody")
  }
  $argsList += "$base$path"
  $code = & $curl @argsList
  $body = ''
  if (Test-Path -LiteralPath $respBody) { $body = Get-Content -LiteralPath $respBody -Raw }
  $headersRaw = ''
  if (Test-Path -LiteralPath $hdr) { $headersRaw = Get-Content -LiteralPath $hdr -Raw }
  return @{ code = [int]$code; body = $body; headers = $headersRaw }
}

function Check($name, $actual, $expected, $match = $null) {
  $ok = ([int]$actual.code -eq [int]$expected)
  if ($ok -and $match -ne $null -and $actual.body -notmatch $match) { $ok = $false }
  if (-not $ok) { $script:failures++ }
  $short = if ($actual.body) { $actual.body.Substring(0, [Math]::Min(160, $actual.body.Length)) } else { '' }
  Write-Host ("{0} | {1} | HTTP {2} (exp {3}) | {4}" -f $(if($ok){'PASS'}else{'FAIL'}), $name, $actual.code, $expected, $short)
}

Write-Host '=== FRONTEND ==='
Check 'index served' (Call 'GET' '/' $null $null) 200 'Construction OS License'
Check 'spa fallback' (Call 'GET' '/some/random/page' $null $null) 200 'Construction OS License'

Write-Host ''
Write-Host '=== LOGIN ==='
Check 'wrong credentials' (Call 'POST' '/api/login' '{"username":"x","password":"y"}' $null) 401 'Invalid username'
Check 'missing credentials' (Call 'POST' '/api/login' '{"username":""}' $null) 400 'Username and password'
$login = Call 'POST' '/api/login' '{"username":"ProjectAdmin","password":"ZXCV1234!@#$"}' $null
Check 'correct credentials' $login 200 '"success"'
$json = $login.body | ConvertFrom-Json
$tok = $json.token
if (-not $tok) { Write-Host 'STOP: no token received'; exit 1 }

Write-Host ''
Write-Host '=== SESSION ==='
Check 'auth/me with token' (Call 'GET' '/api/auth/me' $null $tok) 200 '"ProjectAdmin"'
Check 'auth/me without token' (Call 'GET' '/api/auth/me' $null $null) 401 'Unauthorized'

Write-Host ''
Write-Host '=== LICENSE GENERATION ==='
Check 'create 30d' (Call 'POST' '/api/licenses/create' '{"client_id":"BuildCo-LIVE","duration":30}' $tok) 200 '"token"'
$created = Call 'POST' '/api/licenses/create' '{"client_id":"Site-LIVE","custom_date":"2030-06-15"}' $tok
Check 'create custom date' $created 200 '"token"'
$createJson = $created.body | ConvertFrom-Json
$licToken = $createJson.license.token
$licId = $createJson.license.license_id
if (-not $licToken) { Write-Host 'STOP: no license token received'; exit 1 }
Check 'create unauthenticated' (Call 'POST' '/api/licenses/create' '{"client_id":"X","duration":30}' $null) 401 'Unauthorized'
Check 'create missing client' (Call 'POST' '/api/licenses/create' '{"duration":30}' $tok) 400 'Client name'
Check 'create invalid duration' (Call 'POST' '/api/licenses/create' '{"client_id":"X","duration":-5}' $tok) 400 'Invalid duration'

Write-Host ''
Write-Host '=== VERIFICATION (public) ==='
$licJson = '{"token":"' + $licToken + '"}'
Check 'verify via /api/licenses/verify' (Call 'POST' '/api/licenses/verify' $licJson $null) 200 '"valid":true'
Check 'verify via /api/verify alias' (Call 'POST' '/api/verify' $licJson $null) 200 '"valid":true'
$tampered = $licToken.Substring(0, $licToken.Length - 12) + 'AAAAAAAAAA'
Check 'verify tampered' (Call 'POST' '/api/licenses/verify' ('{"token":"' + $tampered + '"}') $null) 200 '"valid":false'
Check 'verify garbage' (Call 'POST' '/api/licenses/verify' '{"token":"garbage"}' $null) 200 '"valid":false'
Check 'verify empty token' (Call 'POST' '/api/licenses/verify' '{"token":""}' $null) 400 'required'
if (Test-Path -LiteralPath $reqBody) { Remove-Item -LiteralPath $reqBody -ErrorAction SilentlyContinue }
Check 'verify no body' (Call 'POST' '/api/licenses/verify' $null $null) 400 'required'
$pre = Call 'OPTIONS' '/api/licenses/verify' $null $null
if ($pre.code -eq 204 -and $pre.headers -match 'access-control-allow-origin:\s*\*') { Write-Host 'PASS | cors preflight | 204 + Access-Control-Allow-Origin: *' } else { Write-Host 'FAIL | cors preflight | check CORS headers'; $script:failures++ }

Write-Host ''
Write-Host '=== LIST / DELETE ==='
Check 'list' (Call 'GET' '/api/licenses/list' $null $tok) 200 'BuildCo-LIVE'
Check 'list unauthenticated' (Call 'GET' '/api/licenses/list' $null $null) 401
Check 'delete' (Call 'POST' '/api/licenses/delete' ('{"license_id":"' + $licId + '"}') $tok) 200 '"success":true'
$after = Call 'GET' '/api/licenses/list' $null $tok
if ($after.body -match $licId) { Write-Host 'FAIL | deleted license still listed'; $script:failures++ } else { Write-Host 'PASS | deleted license gone from list' }
Check 'delete unauthenticated' (Call 'POST' '/api/licenses/delete' ('{"license_id":"' + $licId + '"}') $null) 401 'Unauthorized'

Write-Host ''
Write-Host ('=== RESULT: ' + $(if ($failures -eq 0) { 'ALL LIVE TESTS PASSED' } else { "$failures LIVE TEST(S) FAILED" }) + ' ===')
exit $(if ($failures -eq 0) { 0 } else { 1 })