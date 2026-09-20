<#
.SYNOPSIS
  Respaldo del CRM Empresarial: datos (Postgres) + codigo fuente del proyecto.

.DESCRIPTION
  Lo unico que realmente se pierde si algo falla es:
    1) Los datos guardados en Postgres (empleados, usuarios, reservas, etc.)
    2) El codigo fuente del proyecto (no esta en Git)
  Los contenedores y las imagenes de Docker NO hace falta respaldarlos:
  se reconstruyen en minutos desde el codigo fuente con "docker compose up --build".

  Este script genera, en una carpeta con fecha y hora:
    - postgres_dump.sql        -> volcado logico de TODAS las bases (pg_dumpall)
    - postgres_volume.tar.gz   -> copia binaria cruda del volumen de Postgres (respaldo extra)
    - chat_files.tar.gz        -> documentos compartidos por el chat (viven en su
                                  propio volumen "chat_files", NO estan en Postgres)
    - crm-empresarial-source.zip -> todo el codigo fuente del proyecto (incluye .env)

.PARAMETER BackupRoot
  Carpeta donde se guardan los respaldos. Por defecto, una carpeta FUERA del
  proyecto (para no zippear los respaldos anteriores dentro del respaldo nuevo).

.PARAMETER KeepLast
  Cuantos respaldos recientes conservar (se borran los mas viejos). 0 = no borrar nada.

.EXAMPLE
  .\scripts\backup.ps1
  .\scripts\backup.ps1 -BackupRoot "D:\Respaldos\crm-empresarial" -KeepLast 20
#>

param(
    [string]$BackupRoot = "$env:USERPROFILE\Desktop\crm-empresarial-backups",
    [int]$KeepLast = 10
)

$ErrorActionPreference = "Stop"

$ProjectDir = Split-Path -Parent $PSScriptRoot
$Timestamp  = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupDir  = Join-Path $BackupRoot $Timestamp

Write-Host "== Respaldo CRM Empresarial ==" -ForegroundColor Cyan
Write-Host "Proyecto: $ProjectDir"
Write-Host "Destino:  $BackupDir"
Write-Host ""

# --- 0. Verificar que Docker y el contenedor de Postgres esten activos ---
docker info *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker no esta corriendo. Abre Docker Desktop y vuelve a intentar."
}

$postgresUp = docker ps --filter "name=crm_postgres" --filter "status=running" --format "{{.Names}}"
if (-not $postgresUp) {
    Write-Error "El contenedor 'crm_postgres' no esta corriendo (docker compose up) - no se puede respaldar la base de datos."
}

New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null

# --- 1. Volcado logico de Postgres (pg_dumpall: incluye las 6 bases) ---
Write-Host "[1/4] Volcando bases de datos (pg_dumpall)..." -ForegroundColor Yellow
$pgUser = "crm_user"
docker exec crm_postgres pg_dumpall -U $pgUser | Out-File -FilePath (Join-Path $BackupDir "postgres_dump.sql") -Encoding utf8
if ($LASTEXITCODE -ne 0) { Write-Error "Fallo el volcado de Postgres." }

# --- 2. Copia binaria cruda del volumen (respaldo extra, por si el dump fallara) ---
Write-Host "[2/4] Copiando el volumen de datos de Postgres..." -ForegroundColor Yellow
$volumeName = docker volume ls --format "{{.Name}}" | Where-Object { $_ -match 'postgres_data$' } | Select-Object -First 1
if (-not $volumeName) {
    Write-Warning "No se encontro el volumen de Postgres; se omite la copia binaria (el volcado logico del paso 1 ya cubre los datos)."
} else {
    $volumeMount = "{0}:/volume:ro" -f $volumeName
    $backupMount = "{0}:/backup" -f $BackupDir
    $dockerArgs = @("run", "--rm", "-v", $volumeMount, "-v", $backupMount, "alpine", "sh", "-c", "tar czf /backup/postgres_volume.tar.gz -C /volume .")
    & docker @dockerArgs
    if ($LASTEXITCODE -ne 0) { Write-Warning "Fallo la copia binaria del volumen (el volcado logico sigue siendo valido)." }
}

# --- 3. Volumen de documentos compartidos por el chat ---
Write-Host "[3/4] Copiando los documentos compartidos del chat..." -ForegroundColor Yellow
$chatVolumeName = docker volume ls --format "{{.Name}}" | Where-Object { $_ -match 'chat_files$' } | Select-Object -First 1
if (-not $chatVolumeName) {
    Write-Warning "No se encontro el volumen 'chat_files' (¿el chat todavia no se uso o no esta levantado?); se omite este paso."
} else {
    $chatVolumeMount = "{0}:/volume:ro" -f $chatVolumeName
    $backupMount = "{0}:/backup" -f $BackupDir
    $dockerArgs = @("run", "--rm", "-v", $chatVolumeMount, "-v", $backupMount, "alpine", "sh", "-c", "tar czf /backup/chat_files.tar.gz -C /volume .")
    & docker @dockerArgs
    if ($LASTEXITCODE -ne 0) { Write-Warning "Fallo la copia de los documentos del chat." }
}

# --- 4. Codigo fuente del proyecto completo (incluye .env) ---
Write-Host "[4/4] Comprimiendo el codigo fuente del proyecto..." -ForegroundColor Yellow
$sourceZip = Join-Path $BackupDir "crm-empresarial-source.zip"
Compress-Archive -Path (Join-Path $ProjectDir "*") -DestinationPath $sourceZip -Force

# --- Instrucciones: una copia dentro de este respaldo y otra a la vista ---
# en la raiz de la carpeta de respaldos, para que siempre aparezcan sin
# tener que recordar donde quedaron.
$instrucciones = Join-Path $PSScriptRoot "INSTRUCCIONES_RESPALDO.txt"
if (Test-Path $instrucciones) {
    Copy-Item $instrucciones -Destination (Join-Path $BackupDir "INSTRUCCIONES_RESPALDO.txt") -Force
    Copy-Item $instrucciones -Destination (Join-Path $BackupRoot "LEEME_INSTRUCCIONES.txt") -Force
}

# --- Retencion: conservar solo los ultimos N respaldos ---
if ($KeepLast -gt 0) {
    $viejos = Get-ChildItem -Path $BackupRoot -Directory |
        Sort-Object Name -Descending |
        Select-Object -Skip $KeepLast
    foreach ($carpeta in $viejos) {
        Write-Host "Eliminando respaldo antiguo: $($carpeta.Name)" -ForegroundColor DarkGray
        Remove-Item -Path $carpeta.FullName -Recurse -Force
    }
}

Write-Host ""
Write-Host "Respaldo completo en: $BackupDir" -ForegroundColor Green
Get-ChildItem $BackupDir | Select-Object Name, @{N="Tamano (MB)";E={[math]::Round($_.Length/1MB,2)}}
