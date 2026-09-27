param([int]$Port = 8890)
$ErrorActionPreference = 'Continue'

Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -match 'netlify' } | ForEach-Object {
  Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 2

$root = (Get-Item (Join-Path $PSScriptRoot '..')).FullName
$npx = (Get-Command npx.cmd).Source
$env:ADMIN_USERNAME = 'ProjectAdmin'
$env:ADMIN_PASSWORD = 'ZXCV1234!@#$'
$log = Join-Path $env:TEMP 'netlify-dev.log'
$err = Join-Path $env:TEMP 'netlify-dev.err'
Remove-Item -LiteralPath $log, $err -ErrorAction SilentlyContinue

$proc = Start-Process -FilePath $npx -ArgumentList @('netlify-cli', 'dev', '--no-open', '--port', "$Port") -WorkingDirectory $root -RedirectStandardOutput $log -RedirectStandardError $err -PassThru

try {
  $base = "http://localhost:$Port"
  $ready = $false
  for ($i = 0; $i -lt 90; $i++) {
    Start-Sleep -Seconds 1
    try {
      $r = Invoke-WebRequest -Uri "$base/" -UseBasicParsing -TimeoutSec 3
      if ($r.StatusCode -eq 200) { $ready = $true; break }
    } catch { }
    if ($proc.HasExited) { break }
  }
  if (-not $ready) {
    Write-Output '=== SERVER NOT READY ==='
    Get-Content -LiteralPath $log -Tail 40 -ErrorAction SilentlyContinue
    Get-Content -LiteralPath $err -Tail 40 -ErrorAction SilentlyContinue
    exit 1
  }
  Write-Output '=== SERVER READY ==='

  $failures = 0

  function ApiTest($name, $method, $path, $body, $token, $expectStatus) {
    $headers = @{}
    if ($token) { $headers.Authorization = "Bearer $token" }
    $params = @{ Uri = "$base$path"; Method = $method; Headers = $headers; UseBasicParsing = $true; TimeoutSec = 60 }
    if ($body -ne $null) {
      $params.ContentType = 'application/json'
      $params.Body = ($body | ConvertTo-Json -Depth 6 -Compress)
    }
    try {
      $r = Invoke-WebRequest @params
      $status = [int]$r.StatusCode
      $ok = $status -eq $expectStatus
      if (-not $ok) { $script:failures++ }
      $short = if ($r.Content) { $r.Content.Substring(0, [Math]::Min(150, $r.Content.Length)) } else { '' }
      Write-Output ("{0} | {1} {2} -> {3} ok={4} body={5}" -f $(if($ok){'PASS'}else{'FAIL'}), $method, $path, $status, $ok, $short)
      return @{ ok = $ok; status = $status; content = $r.Content }
    } catch {
      $status = -1
      $content = ''
      if ($_.Exception.Response) {
        $status = [int]$_.Exception.Response.StatusCode
        try {
          $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
          $content = $reader.ReadToEnd()
        } catch { }
      }
      $ok = $status -eq $expectStatus
      if (-not $ok) { $script:failures++ }
      $short = if ($content) { $content.Substring(0, [Math]::Min(150, $content.Length)) } else { '' }
      Write-Output ("{0} | {1} {2} -> {3} ok={4} body={5}" -f $(if($ok){'PASS'}else{'FAIL'}), $method, $path, $status, $ok, $short)
      return @{ ok = $ok; status = $status; content = $content }
    }
  }

  ApiTest 'index' 'Get' '/' $null $null 200
  ApiTest 'login-bad' 'Post' '/api/login' @{ username = 'x'; password = 'y' } $null 401
  Write-Output ''
  $login = ApiTest 'login-good' 'Post' '/api/login' @{ username = 'ProjectAdmin'; password = 'ZXCV1234!@#$' } $null 200
  if (-not $login.ok) { Write-Output 'Cannot continue without login'; exit 1 }
  $loginJson = $login.content | ConvertFrom-Json
  $tok = $loginJson.token
  Write-Output ''
  ApiTest 'auth-me' 'Get' '/api/auth/me' $null $tok 200
  ApiTest 'list-empty' 'Get' '/api/licenses/list' $null $tok 200
  Write-Output ''
  $created = ApiTest 'create' 'Post' '/api/licenses/create' @{ client_id = 'BuildCo-UAT'; duration = 30 } $tok 200
  if (-not $created.ok) { Write-Output 'Cannot continue without a license'; exit 1 }
  $createJson = $created.content | ConvertFrom-Json
  $licToken = $createJson.license.token
  $licId = $createJson.license.license_id
  Write-Output ''
  ApiTest 'verify-valid' 'Post' '/api/licenses/verify' @{ token = $licToken } $null 200
  $tampered = $licToken.Substring(0, $licToken.Length - 12) + 'AAAAAAAAAA'
  ApiTest 'verify-tampered' 'Post' '/api/licenses/verify' @{ token = $tampered } $null 200
  ApiTest 'verify-empty' 'Post' '/api/licenses/verify' @{ token = '' } $null 400
  Write-Output ''
  ApiTest 'create-unauthed' 'Post' '/api/licenses/create' @{ client_id = 'X'; duration = 30 } $null 401
  ApiTest 'list-one' 'Get' '/api/licenses/list' $null $tok 200
  ApiTest 'delete' 'Post' '/api/licenses/delete' @{ license_id = $licId } $tok 200
  ApiTest 'list-empty-again' 'Get' '/api/licenses/list' $null $tok 200
  ApiTest 'cors-preflight' 'Options' '/api/licenses/verify' $null $null 204
  Write-Output ''
  Write-Output ('=== RESULT: ' + $(if ($failures -eq 0) { 'ALL LIVE TESTS PASSED' } else { "$failures LIVE TEST(S) FAILED" })) + ' ==='
  exit $(if ($failures -eq 0) { 0 } else { 1 })
} finally {
  if (-not $proc.HasExited) { Stop-Process -Id $proc.Id -Force }
}