# Hudu MCP Server - Installer for Claude Desktop
# Run this once. It installs the server and wires it into Claude Desktop automatically.
# Usage: Right-click → Run with PowerShell

Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
$ErrorActionPreference = 'Stop'
$InstallDir = "$env:LOCALAPPDATA\Programs\HuduMCP"
$ClaudeConfig = "$env:APPDATA\Claude\claude_desktop_config.json"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Hudu MCP Server Installer" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# ---------------------------------------------------------------------------
# Step 1 - Check for Node.js
# ---------------------------------------------------------------------------

Write-Host "Checking for Node.js..." -ForegroundColor Yellow

$nodeInstalled = $null
try { $nodeInstalled = node --version 2>$null } catch {}

if (-not $nodeInstalled) {
    Write-Host "Node.js not found. Downloading installer..." -ForegroundColor Yellow

    $nodeMsi = "$env:TEMP\nodejs.msi"
    Invoke-WebRequest -Uri "https://nodejs.org/dist/v22.14.0/node-v22.14.0-x64.msi" -OutFile $nodeMsi
    Start-Process msiexec.exe -ArgumentList "/i `"$nodeMsi`" /quiet /norestart" -Wait
    Remove-Item $nodeMsi -Force

    # Refresh PATH
    $env:PATH = [System.Environment]::GetEnvironmentVariable('PATH', 'Machine') + ';' + [System.Environment]::GetEnvironmentVariable('PATH', 'User')

    $nodeInstalled = $null
    try { $nodeInstalled = node --version 2>$null } catch {}

    if (-not $nodeInstalled) {
        Write-Host "ERROR: Node.js installation failed. Please install manually from https://nodejs.org and re-run this script." -ForegroundColor Red
        pause
        exit 1
    }
}

Write-Host "Node.js $nodeInstalled found." -ForegroundColor Green

# ---------------------------------------------------------------------------
# Step 2 - Prompt for Hudu API key
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "Enter your Hudu API key." -ForegroundColor Yellow
Write-Host "Get one from: Hudu Admin > Basic Information > API Keys" -ForegroundColor Gray
Write-Host ""

$apiKeySecure = Read-Host "API Key" -AsSecureString
$apiKey = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($apiKeySecure)
)

if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host "ERROR: API key cannot be empty." -ForegroundColor Red
    pause
    exit 1
}

# ---------------------------------------------------------------------------
# Step 3 - Download and install
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "Installing to $InstallDir..." -ForegroundColor Yellow

# Clean previous install if exists
if (Test-Path $InstallDir) {
    Remove-Item $InstallDir -Recurse -Force
}
New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null

# Download latest from GitHub
$ZipPath = "$env:TEMP\hudu-mcp.zip"
Write-Host "Downloading from GitHub..." -ForegroundColor Yellow
Invoke-WebRequest -Uri "https://github.com/Allied-Business-Solutions/hudu-mcp/archive/refs/heads/main.zip" -OutFile $ZipPath
Expand-Archive -Path $ZipPath -DestinationPath "$env:TEMP\hudu-mcp-extract" -Force
Copy-Item "$env:TEMP\hudu-mcp-extract\hudu-mcp-main\*" -Destination $InstallDir -Recurse -Force
Remove-Item $ZipPath -Force
Remove-Item "$env:TEMP\hudu-mcp-extract" -Recurse -Force

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
Set-Location $InstallDir
& npm install --silent

# Write .env file
$envContent = @"
HUDU_BASE_URL=https://allied.huducloud.com/api/v1
HUDU_API_KEY=$apiKey
"@
Set-Content -Path "$InstallDir\.env" -Value $envContent -Encoding UTF8

Write-Host "Server installed." -ForegroundColor Green

# ---------------------------------------------------------------------------
# Step 4 - Configure Claude Desktop
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "Configuring Claude Desktop..." -ForegroundColor Yellow

$nodePath = (Get-Command node).Source

# Build the new MCP entry
$huduEntry = @{
    command = $nodePath
    args    = @("$InstallDir\stdio.js")
}

# Load existing config or start fresh
if (Test-Path $ClaudeConfig) {
    $config = Get-Content $ClaudeConfig -Raw | ConvertFrom-Json
} else {
    New-Item -ItemType Directory -Path (Split-Path $ClaudeConfig) -Force | Out-Null
    $config = [PSCustomObject]@{}
}

# Add mcpServers if missing
if (-not $config.PSObject.Properties['mcpServers']) {
    $config | Add-Member -MemberType NoteProperty -Name 'mcpServers' -Value ([PSCustomObject]@{})
}

# Add or update the hudu entry
if ($config.mcpServers.PSObject.Properties['hudu']) {
    $config.mcpServers.hudu = $huduEntry
} else {
    $config.mcpServers | Add-Member -MemberType NoteProperty -Name 'hudu' -Value $huduEntry
}

# Save config
$config | ConvertTo-Json -Depth 10 | Set-Content $ClaudeConfig -Encoding UTF8

Write-Host "Claude Desktop configured." -ForegroundColor Green

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "  Installation complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Restart Claude Desktop and you will see Hudu in your tools." -ForegroundColor White
Write-Host ""
pause
