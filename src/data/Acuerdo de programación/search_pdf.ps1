$pdfs = Get-ChildItem -Path 'src/data/Acuerdo*/*.pdf'
foreach ($file in $pdfs) {
    $pdfPath = $file.FullName
    Write-Host "Processing: $pdfPath"
    try {
        $word = New-Object -ComObject Word.Application
        $word.Visible = $false
        $word.DisplayAlerts = 0 # wdAlertsNone
        
        $doc = $word.Documents.Open($pdfPath)
        $text = $doc.Content.Text
        $doc.Close()
        $word.Quit()
        Write-Host "Text length: $($text.Length)"
        
        # Search for CMA and Villarrica
        $lines = $text -split "`n"
        foreach ($line in $lines) {
            $trimmed = $line.Trim()
            if ($trimmed -like '*CMA*' -or $trimmed -like '*Villarrica*') {
                Write-Host "Line: $trimmed"
            }
        }
    } catch {
        Write-Host "Error: $($_.Exception.Message)"
        if ($word) { $word.Quit() }
    }
}
