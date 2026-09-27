<#
.SYNOPSIS
  Carga en crm-nas la credencial HMAC de Google Cloud Storage SIN exponerla en el chat ni en el historial.
.DESCRIPTION
  Pide el ID de clave y el secreto (el secreto se escribe oculto), arma /etc/rclone-crm/rclone.conf en crm-nas
  (root, modo 600) y borra el archivo temporal. La credencial solo puede CREAR objetos en el bucket.
#>
param(
    [string]$Llave = "$env:USERPROFILE\.ssh\id_ed25519_crm",
    [string]$Proxmox = "192.168.80.10",
    [int]$PuertoEdge = 2211
)
$ErrorActionPreference = "Stop"
$id = Read-Host "ID de clave de acceso (empieza con GOOG...)"
$seg = Read-Host "Secreto de la clave (no se muestra)" -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($seg)
try { $sec = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
if ($id.Length -lt 10 -or $sec.Length -lt 20) { Write-Error "Las credenciales parecen incompletas." }

$conf = "[gcs]`ntype = s3`nprovider = GCS`naccess_key_id = $id`nsecret_access_key = $sec`nendpoint = https://storage.googleapis.com`nno_check_bucket = true`n"
$tmp = Join-Path $env:TEMP ("rc_" + [guid]::NewGuid().ToString("N") + ".tmp")
try {
    [IO.File]::WriteAllText($tmp, $conf, (New-Object Text.UTF8Encoding($false)))
    $remoto = "ssh -o BatchMode=yes root@10.10.10.30 'umask 077; cat > /etc/rclone-crm/rclone.conf; chmod 600 /etc/rclone-crm/rclone.conf; ls -l /etc/rclone-crm/rclone.conf'"
    cmd /c "ssh -i `"$Llave`" -o BatchMode=yes -p $PuertoEdge cesar@$Proxmox `"$remoto`" < `"$tmp`""
    if ($LASTEXITCODE -ne 0) { Write-Error "No se pudo guardar la credencial en crm-nas." }
    Write-Host "Credencial guardada en crm-nas (solo root la puede leer)." -ForegroundColor Green
} finally {
    if (Test-Path $tmp) { [IO.File]::WriteAllBytes($tmp, (New-Object byte[] 1024)); Remove-Item $tmp -Force }
    $sec = $null; $conf = $null
}
