# Script de scan de documentation
# Génère une liste des fichiers .md pour détecter les doublons potentiels

Write-Host "📚 Scan de la documentation..." -ForegroundColor Cyan
Write-Host ""

# Récupérer tous les fichiers .md (hors node_modules)
$docs = Get-ChildItem -Path "." -Filter "*.md" -Recurse | 
    Where-Object { $_.FullName -notlike "*node_modules*" } |
    Select-Object Name, DirectoryName, Length, LastWriteTime |
    Sort-Object DirectoryName, Name

Write-Host "📋 Fichiers de documentation trouvés :" -ForegroundColor Green
Write-Host "─────────────────────────────────────" -ForegroundColor Gray

$groups = $docs | Group-Object DirectoryName

foreach ($group in $groups) {
    $relativePath = $group.Name -replace [regex]::Escape($PWD.Path), "."
    Write-Host "`n📁 $relativePath" -ForegroundColor Yellow
    
    foreach ($file in $group.Group) {
        $size = [math]::Round($file.Length / 1KB, 1)
        Write-Host "   • $($file.Name) " -NoNewline
        Write-Host "($size KB)" -ForegroundColor Gray
    }
}

Write-Host "`n─────────────────────────────────────" -ForegroundColor Gray
Write-Host "Total: $($docs.Count) fichiers" -ForegroundColor Cyan
Write-Host ""

# Détecter les noms similaires (doublons potentiels)
Write-Host "🔍 Vérification des doublons potentiels..." -ForegroundColor Cyan

$nameGroups = $docs | Group-Object { $_.Name -replace '_v\d+|_FINAL|_COMPLET', '' } | 
    Where-Object { $_.Count -gt 1 }

if ($nameGroups) {
    Write-Host ""
    Write-Host "⚠️  Doublons potentiels détectés :" -ForegroundColor Yellow
    foreach ($group in $nameGroups) {
        Write-Host "`n   Groupe '$($group.Name)' :" -ForegroundColor Red
        foreach ($file in $group.Group) {
            Write-Host "      • $($file.Name)" -ForegroundColor White
        }
    }
    Write-Host ""
    Write-Host "💡 Conseil : Consolider ou archiver les anciennes versions" -ForegroundColor Cyan
} else {
    Write-Host "✅ Aucun doublon détecté !" -ForegroundColor Green
}

Write-Host ""
