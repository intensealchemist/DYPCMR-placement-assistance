$src = "C:\Users\ATUL\.gemini\antigravity\brain\4439ff68-d922-438f-b239-e795771cf7fd\dypcmr_placement_logo_1769764654311.png"
$dest_dir = "d:\GH\DYPCMR-placement-assistance\mobile\assets"
$files = @("icon.png", "dypcmr-logo.png", "adaptive-icon.png", "favicon.png")

if (!(Test-Path $src)) {
    Write-Host "Source file not found: $src"
    exit 1
}

foreach ($f in $files) {
    $dest = Join-Path $dest_dir $f
    Copy-Item -Path $src -Destination $dest -Force
    Write-Host "Copied to $dest"
}
