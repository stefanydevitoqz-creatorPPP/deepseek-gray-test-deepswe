param(
    [switch]$RequireCredentials
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$checks = [ordered]@{}

function Has-Command([string]$Name) {
    return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

$checks.pier = Has-Command 'pier'
$checks.docker = Has-Command 'docker'
$checks.dsh = Has-Command 'dsh'
$checks.uv = Has-Command 'uv'
$checks.dockerDaemon = $false
if ($checks.docker) {
    docker info --format '{{.ServerVersion}}' *> $null
    $checks.dockerDaemon = $LASTEXITCODE -eq 0
}
$checks.proxyPort8787Available = $null -eq (Get-NetTCPConnection -LocalPort 8787 -State Listen -ErrorAction SilentlyContinue)
$checks.deepseekApiKey = Test-Path Env:DEEPSEEK_API_KEY
$checks.pierConfig = Test-Path (Join-Path $root 'config\pier-noop-smoke.yaml')
$checks.noModelPierSmoke = Test-Path (Join-Path $root 'noop-smoke.ok')
$datasetPath = Join-Path $root 'dataset'
$datasetTasks = if (Test-Path $datasetPath) { @(Get-ChildItem -LiteralPath $datasetPath -Directory) } else { @() }
$checks.datasetTaskCount = $datasetTasks.Count
$checks.datasetReady = $datasetTasks.Count -eq 113
$checks.proxyConfig = Test-Path (Join-Path $root 'config\session-id-proxy.json')
$checks.dshPatch = Test-Path (Join-Path $root 'config\dsh-eval.patch.yml')
$checks.isolatedDshHome = $null -ne $env:DSH_HOME
$checks.datasetRef = 'sha256:aaa82ceb8404dccc17689c9383f93dbcbc8f029a7601d2e3856a416f2cb89269'
$checks.modelSessionId = if ($env:DEEPSWE_MODEL_SESSION_ID) { '<provided-by-environment>' } else { '<missing>' }
$checks.proxyImplementation = Test-Path (Join-Path $root 'proxy\READY')
$workspaceRoot = Split-Path -Parent $root
$checks.pierAgentAdapterImport = Test-Path (Join-Path $workspaceRoot 'deepswe_agent.py')
$checks.pierAgentContainerSmoke = Test-Path (Join-Path $root 'adapter-container.ok')
$checks.realTestConfig = Test-Path (Join-Path $root 'config\pier-dsh-test.yaml')
$checks.checkedAt = (Get-Date).ToString('o')

$statusPath = Join-Path $root 'environment-status.json'
$checks | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $statusPath -Encoding UTF8
$checks | Format-List

$required = @('pier', 'docker', 'dsh', 'uv', 'dockerDaemon', 'proxyPort8787Available', 'pierConfig', 'noModelPierSmoke', 'datasetReady', 'proxyConfig', 'dshPatch', 'isolatedDshHome', 'proxyImplementation', 'pierAgentAdapterImport', 'realTestConfig')
$failed = @($required | Where-Object { -not $checks[$_] })
if ($RequireCredentials) {
    if (-not $checks.deepseekApiKey) { $failed += 'deepseekApiKey' }
    if (-not $checks.pierAgentContainerSmoke) { $failed += 'pierAgentContainerSmoke' }
}
if ($failed.Count -gt 0) {
    Write-Error ('Preflight failed: ' + ($failed -join ', '))
    exit 1
}
