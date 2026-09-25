<#
.SYNOPSIS
  Respaldo del CRM Empresarial en Proxmox: base de datos (Patroni) + codigo fuente + .env.

.DESCRIPTION
  Desde el PC, entra por SSH a crm-edge (bastion) y de ahi a un nucleo, donde corre
  pg_dumpall a traves de HAProxy (puerto 5000), que siempre apunta al lider de Patroni.
  Los adjuntos del chat viven en la base de datos, asi que el volcado ya los incluye.

  Genera, en una carpeta con fecha y hora:
    - postgres_dump.sql          -> volcado logico de TODAS las bases (pg_dumpall)
    - crm-empresarial-source.zip -> codigo fuente del proyecto (incluye .env con
                                    FIELD_ENCRYPTION_KEY: sin esa clave los datos de
                                    salud del volcado quedan ilegibles)

  Las contrasenas de PostgreSQL NO se guardan aqui: viajan por stdin desde
  ~/.crm-secrets/pg_superuser en crm-edge y no se escriben en ningun archivo.

.PARAMETER BackupRoot
  Carpeta donde se guardan los respaldos (fuera del proyecto).

.PARAMETER KeepLast
  Cuantos respaldos recientes conservar. 0 = no borrar nada.
#>

param(
    [string]$BackupRoot = "$env:USERPROFILE\Desktop\crm-empresarial-backups",
    [int]$KeepLast = 10,
    [string]$Llave = "$env:USERPROFILE\.ssh\id_ed25519_crm",
    [string]$Proxmox = "192.168.80.10",
    [int]$PuertoEdge = 2211,
    [string]$Nucleo = "10.10.10.10"
)

$ErrorActionPreference = "Stop"

$ProjectDir = Split-Path -Parent $PSScriptRoot
$Timestamp  = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupDir  = Join-Path $BackupRoot $Timestamp
$sshOpts    = @("-i", $Llave, "-o", "BatchMode=yes", "-o", "ConnectTimeout=10", "-p", $PuertoEdge)

Write-Host "== Respaldo CRM Empresarial (Proxmox) ==" -ForegroundColor Cyan
Write-Host "Proyecto: $ProjectDir"
Write-Host "Destino:  $BackupDir"
Write-Host ""

if (-not (Test-Path $Llave)) { Write-Error "No existe la llave SSH $Llave" }

# --- 0. Comprobar que se llega al bastion ---
ssh @sshOpts "cesar@$Proxmox" "echo ok" *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Error "No se pudo entrar a crm-edge ($Proxmox`:$PuertoEdge). Revisa que Proxmox y crm-edge esten encendidos (y la huella SSH, ver INSTRUCCIONES_APAGADO_ENCENDIDO.txt)."
}

New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
$dump = Join-Path $BackupDir "postgres_dump.sql"

# --- 1. Volcado logico via HAProxy (siempre el lider de Patroni) ---
Write-Host "[1/3] Volcando las bases de datos (pg_dumpall, via lider de Patroni)..." -ForegroundColor Yellow
$remoto = "cat ~/.crm-secrets/pg_superuser | ssh -o BatchMode=yes cesar@$Nucleo " +
          "'read -r PGPASSWORD; export PGPASSWORD; pg_dumpall -h 127.0.0.1 -p 5000 -U postgres'"
ssh @sshOpts "cesar@$Proxmox" $remoto | Out-File -FilePath $dump -Encoding utf8
if ($LASTEXITCODE -ne 0) { Write-Error "Fallo el volcado de PostgreSQL." }

$lineas = (Get-Content $dump -TotalCount 5000 | Measure-Object).Count
$fin = Get-Content $dump -Tail 3
if ($lineas -lt 50 -or -not ($fin -match "PostgreSQL database cluster dump complete")) {
    Write-Error "El volcado parece incompleto (no termina con el marcador de fin). Revisa $dump"
}
Write-Host "      volcado verificado (termina con el marcador de fin de pg_dumpall)"

# --- 2. Codigo fuente + .env (sin carpetas pesadas regenerables ni evidencias) ---
Write-Host "[2/3] Comprimiendo el codigo fuente del proyecto..." -ForegroundColor Yellow
$sourceZip = Join-Path $BackupDir "crm-empresarial-source.zip"
# tar de Windows (bsdtar) arma el zip y permite excluir carpetas regenerables en cualquier nivel
Remove-Item $sourceZip -ErrorAction SilentlyContinue
& (Join-Path $env:SystemRoot "System32\tar.exe") -a -c -f $sourceZip -C $ProjectDir --exclude=.git --exclude=node_modules --exclude=.terraform --exclude=evidencia-pendiente --exclude=presentacion .
if ($LASTEXITCODE -ne 0) { Write-Error "Fallo la compresion del codigo fuente." }

# --- 3. Instrucciones a la vista ---
Write-Host "[3/3] Copiando las instrucciones..." -ForegroundColor Yellow
foreach ($f in @("INSTRUCCIONES_RESPALDO.txt", "INSTRUCCIONES_APAGADO_ENCENDIDO.txt")) {
    $origen = Join-Path $PSScriptRoot $f
    if (Test-Path $origen) {
        Copy-Item $origen -Destination (Join-Path $BackupDir $f) -Force
    }
}
$resp = Join-Path $PSScriptRoot "INSTRUCCIONES_RESPALDO.txt"
if (Test-Path $resp) { Copy-Item $resp -Destination (Join-Path $BackupRoot "LEEME_INSTRUCCIONES.txt") -Force }

# --- Retencion ---
if ($KeepLast -gt 0) {
    $viejos = Get-ChildItem -Path $BackupRoot -Directory | Sort-Object Name -Descending | Select-Object -Skip $KeepLast
    foreach ($carpeta in $viejos) {
        Write-Host "Eliminando respaldo antiguo: $($carpeta.Name)" -ForegroundColor DarkGray
        Remove-Item -Path $carpeta.FullName -Recurse -Force
    }
}

Write-Host ""
Write-Host "Respaldo completo en: $BackupDir" -ForegroundColor Green
Get-ChildItem $BackupDir | Select-Object Name, @{N="Tamano (MB)";E={[math]::Round($_.Length/1MB,2)}}
