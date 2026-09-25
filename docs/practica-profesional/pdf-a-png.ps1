param([string]$Pdf, [string]$OutDir, [int[]]$Paginas, [int]$Ancho = 1400)
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Data.Pdf.PdfDocument, Windows.Data.Pdf, ContentType = WindowsRuntime]
$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Storage.Streams.InMemoryRandomAccessStream, Windows.Storage.Streams, ContentType = WindowsRuntime]
$null = [Windows.Data.Pdf.PdfPageRenderOptions, Windows.Data.Pdf, ContentType = WindowsRuntime]
$metodos = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 }
$asTaskOp = $metodos | Where-Object { $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' } | Select-Object -First 1
$asTaskAct = $metodos | Where-Object { $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncAction' } | Select-Object -First 1
function Esperar-Op($op, $tipo) { $t = $asTaskOp.MakeGenericMethod($tipo).Invoke($null, @($op)); $t.Wait(-1) | Out-Null; $t.Result }
function Esperar-Act($act) { $t = $asTaskAct.Invoke($null, @($act)); $t.Wait(-1) | Out-Null }
New-Item -ItemType Directory -Force $OutDir | Out-Null
$archivo = Esperar-Op ([Windows.Storage.StorageFile]::GetFileFromPathAsync($Pdf)) ([Windows.Storage.StorageFile])
$doc = Esperar-Op ([Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($archivo)) ([Windows.Data.Pdf.PdfDocument])
"Paginas en el PDF: " + $doc.PageCount
foreach ($n in $Paginas) {
  $pag = $doc.GetPage($n - 1)
  $stream = New-Object Windows.Storage.Streams.InMemoryRandomAccessStream
  $opc = New-Object Windows.Data.Pdf.PdfPageRenderOptions
  $opc.DestinationWidth = $Ancho
  Esperar-Act ($pag.RenderToStreamAsync($stream, $opc))
  $bytes = New-Object byte[] $stream.Size
  $reader = New-Object Windows.Storage.Streams.DataReader($stream.GetInputStreamAt(0))
  Esperar-Op ($reader.LoadAsync([uint32]$stream.Size)) ([uint32]) | Out-Null
  $reader.ReadBytes($bytes)
  [System.IO.File]::WriteAllBytes((Join-Path $OutDir ("p{0:D2}.png" -f $n)), $bytes)
  $pag.Dispose()
}
