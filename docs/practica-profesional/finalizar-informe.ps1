param(
  [string]$Origen = "C:\Users\HP\Desktop\crm-empresarial\docs\practica-profesional\Informe_prueba.docx",
  [string]$Destino = "C:\Users\HP\Desktop\crm-empresarial\docs\practica-profesional\Informe_prueba_final.docx",
  [string]$Pdf = "C:\Users\HP\Desktop\crm-empresarial\docs\practica-profesional\Informe_prueba_final.pdf"
)
# Abre el .docx generado con Word, actualiza indices/numeracion de figuras, lo guarda con esos
# valores ya calculados (sin pedir "actualizar campos" al abrir) y exporta un PDF de revision.
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
  $doc = $word.Documents.Open($Origen)
  1..3 | ForEach-Object {
    $doc.Fields.Update() | Out-Null
    foreach ($t in $doc.TablesOfContents) { $t.Update() }
    foreach ($t in $doc.TablesOfFigures) { $t.Update() }
    $doc.Repaginate()
  }
  "Paginas: " + $doc.ComputeStatistics(2)
  $doc.SaveAs2($Destino, 16)
  $doc.ExportAsFixedFormat($Pdf, 17)
  $doc.Close([ref]0)
} finally { $word.Quit() }
