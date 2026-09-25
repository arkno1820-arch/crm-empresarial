param([string]$Salida = "C:\Users\HP\Desktop\crm-empresarial\docs\practica-profesional\Informe_Practica_Profesional_CRM_Empresarial.docx")
# Pipeline completo: generar -> leer numeros reales con Word -> resolver referencias -> actualizar indices -> PDF
$d = "C:\Users\HP\Desktop\crm-empresarial\docs\practica-profesional"
Set-Location $d
node generar-informe.js "_base.docx"
if ($LASTEXITCODE -ne 0) { throw "fallo la generacion" }
& "$d\leer-numeros-figuras.ps1" -Docx "$d\_base.docx" -Salida "$d\_numeros.txt"
node -e "require('./resolver-referencias.js').resolver('_base.docx','_numeros.txt').then(n=>console.log('referencias resueltas:',n)).catch(e=>{console.error(e.message);process.exit(1)})"
if ($LASTEXITCODE -ne 0) { throw "fallo la resolucion de referencias" }
& "$d\finalizar-informe.ps1" -Origen "$d\_base.docx" -Destino $Salida -Pdf ($Salida -replace '\.docx$','.pdf')
Remove-Item "$d\_base.docx","$d\_numeros.txt" -ErrorAction SilentlyContinue
