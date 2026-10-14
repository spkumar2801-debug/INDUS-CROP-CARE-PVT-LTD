Add-Type -AssemblyName System.Drawing
$srcDir = "C:\Users\HP\.gemini\antigravity-ide\brain\a41c362b-ef09-42b7-bffe-0828af0518f2\.user_uploaded"
$dstDir = "c:\Users\HP\Desktop\INDAS AGRI PVT  LMT\public\images\products"

$mappings = @(
  @{ Src = "media_1791886031766.jpg"; Sheet = "ias-703-sheet.jpg"; Crop = "ias-703.jpg" },
  @{ Src = "media_1791886031797.jpg"; Sheet = "ias-801-sheet.jpg"; Crop = "ias-801.jpg" },
  @{ Src = "media_1791886031874.jpg"; Sheet = "ias-305-sheet.jpg"; Crop = "ias-305.jpg" },
  @{ Src = "media_1791886031910.jpg"; Sheet = "ias-702-sheet.jpg"; Crop = "ias-702.jpg" },
  @{ Src = "media_1791886031955.jpg"; Sheet = "ias-612-sheet.jpg"; Crop = "ias-612.jpg" }
)

foreach ($m in $mappings) {
  $srcPath = Join-Path $srcDir $m.Src
  $sheetPath = Join-Path $dstDir $m.Sheet
  $cropPath = Join-Path $dstDir $m.Crop
  
  Copy-Item -Path $srcPath -Destination $sheetPath -Force
  
  $img = [System.Drawing.Image]::FromFile($srcPath)
  Write-Host "Processing $($m.Sheet) dimensions: $($img.Width) x $($img.Height)"
  
  # The photo box in these sheets is on the left side:
  # X: 3.5% to 48%, Y: 15.8% to 41.5%
  $cropX = [int]($img.Width * 0.035)
  $cropY = [int]($img.Height * 0.158)
  $cropW = [int]($img.Width * 0.445)
  $cropH = [int]($img.Height * 0.255)
  
  $rect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
  $bmp = New-Object System.Drawing.Bitmap($cropW, $cropH)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  
  $destRect = New-Object System.Drawing.Rectangle(0, 0, $cropW, $cropH)
  $g.DrawImage($img, $destRect, $rect, [System.Drawing.GraphicsUnit]::Pixel)
  
  $bmp.Save($cropPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
  $g.Dispose()
  $bmp.Dispose()
  $img.Dispose()
  Write-Host "Created clean crop: $cropPath"
}
