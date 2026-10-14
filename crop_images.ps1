Add-Type -AssemblyName System.Drawing

function Crop-Pure-Photo($srcPath, $dstPath, $cropX, $cropY, $cropW, $cropH) {
    $src = [System.Drawing.Bitmap]::FromFile($srcPath)
    $cropRect = [System.Drawing.Rectangle]::new($cropX, $cropY, $cropW, $cropH)
    $cropped = $src.Clone($cropRect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    
    # Save with pristine JPEG quality (Quality = 98)
    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
    $encoderParams = [System.Drawing.Imaging.EncoderParameters]::new(1)
    $encoderParams.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [long]98)
    
    $cropped.Save($dstPath, $codec, $encoderParams)
    $cropped.Dispose()
    $src.Dispose()
    Write-Host "Pure photo cropped: $dstPath"
}

# 1. Okra IAS 701 (Yellow bloom and tender green okra pod)
Crop-Pure-Photo "public\images\products\ias-701-sheet.jpg" "public\images\products\ias-701.jpg" 19 179 233 203

# 2. Chilli IAS 603 (Semi-erect, deep red chillies in bowl - text strip excluded)
Crop-Pure-Photo "public\images\products\ias-603-sheet.jpg" "public\images\products\ias-603.jpg" 27 152 248 180

# 3. Chilli IAS 604 (15-16 cm long dried chillies in cane basket - text strip excluded)
Crop-Pure-Photo "public\images\products\ias-604-sheet.jpg" "public\images\products\ias-604.jpg" 17 160 263 192

# 4. Bitter Gourd IAS 406 (Short spiny dark green bitter gourd)
Crop-Pure-Photo "public\images\products\ias-406-sheet.jpg" "public\images\products\ias-406.jpg" 16 157 304 265

# 5. Chilli IAS 611 (Long red chillies on cane tray - text strip excluded)
Crop-Pure-Photo "public\images\products\ias-611-sheet.jpg" "public\images\products\ias-611.jpg" 21 174 246 181

# 6. Bitter Gourd IAS 405 (Fresh green bitter gourds with yellow blossoms in basket)
Crop-Pure-Photo "public\images\products\ias-405-sheet.jpg" "public\images\products\ias-405.jpg" 20 143 258 215

# 7. Bitter Gourd IAS 404 (Long dark green hanging bitter gourds)
Crop-Pure-Photo "public\images\products\ias-404-sheet.jpg" "public\images\products\ias-404.jpg" 20 171 244 206

# 8. Cucumber IAS 503 (Straight fresh green cucumbers with flowers)
Crop-Pure-Photo "public\images\products\ias-503-sheet.jpg" "public\images\products\ias-503.jpg" 25 174 248 212

# 9. Cucumber IAS 504 (Dark green cucumber hanging on vine)
Crop-Pure-Photo "public\images\products\ias-504-sheet.jpg" "public\images\products\ias-504.jpg" 16 172 272 232

Write-Host "All 9 products cropped cleanly with pure photographic focus!"
