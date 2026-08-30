$source = "D:\workbench\strinova-guide-hub"
$destination = "D:\workbench\strinova-guide-hub_backup_20260821.zip"

if (Test-Path $destination) {
    Remove-Item $destination
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open($destination, 'Create')

Get-ChildItem -Path $source -Recurse | Where-Object { 
    $_.FullName -notmatch '\\node_modules\\' -and 
    $_.FullName -notmatch '\\\.next\\' -and 
    $_.FullName -notmatch '\\\.git\\'
} | ForEach-Object { 
    $relativePath = $_.FullName.Substring($source.Length + 1)
    if (-not $_.PSIsContainer) { 
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $relativePath) 
    } 
}
$zip.Dispose()
Write-Host "Backup created at $destination"
