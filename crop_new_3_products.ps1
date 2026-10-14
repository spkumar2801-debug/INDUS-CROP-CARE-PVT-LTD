Add-Type -AssemblyName System.Drawing

function FineCrop {
  param(
    [string]$file,
    [int]$x,
    [int]$y,
    [int]$w,
    [int]$h,
    [string]$outName
  )
  $img = [System.Drawing.Image]::FromFile($file)
  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $rect = New-Object System.Drawing.Rectangle($x, $y, $w, $h)
  $g.DrawImage($img, (New-Object System.Drawing.Rectangle(0,0,$w,$h)), $rect, [System.Drawing.GraphicsUnit]::Pixel)
  $outPath = Join-Path "c:\Users\HP\Desktop\INDAS AGRI PVT  LMT\public\images\products" $outName
  $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
  $g.Dispose()
  $bmp.Dispose()
  $img.Dispose()
  Write-Host "Saved: $outPath ($w x $h)"
}

# IAS 306 Marigold
FineCrop "C:\Users\HP\.gemini\antigravity-ide\brain\a41c362b-ef09-42b7-bffe-0828af0518f2\.user_uploaded\media_1791888558342.jpg" 16 153 234 178 "ias-306.jpg"

# IAS 613 Chilli
FineCrop "C:\Users\HP\.gemini\antigravity-ide\brain\a41c362b-ef09-42b7-bffe-0828af0518f2\.user_uploaded\media_1791888558408.jpg" 10 152 264 183 "ias-613.jpg"

# IAS 800 Tomato
FineCrop "C:\Users\HP\.gemini\antigravity-ide\brain\a41c362b-ef09-42b7-bffe-0828af0518f2\.user_uploaded\media_1791888558426.jpg" 20 162 236 190 "ias-800.jpg"
