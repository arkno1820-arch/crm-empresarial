param([string]$Docx, [string]$Salida)
# Abre el .docx con Word, actualiza los campos SEQ y vuelca "numero<TAB>archivo" de cada titulo de figura.
$word = New-Object -ComObject Word.Application
$word.Visible = $false; $word.DisplayAlerts = 0
try {
  $doc = $word.Documents.Open($Docx)
  $doc.Fields.Update() | Out-Null
  $lineas = New-Object System.Collections.Generic.List[string]
  foreach ($p in $doc.Paragraphs) {
    $t = $p.Range.Text
    if ($t -match '^Figura (\d+)\..*\[\[([^\]]*)\]\]') { $lineas.Add($Matches[1] + "`t" + $Matches[2]) }
  }
  [System.IO.File]::WriteAllLines($Salida, $lineas)
  "Titulos leidos: " + $lineas.Count
  $doc.Close([ref]0)
} finally { $word.Quit() }
