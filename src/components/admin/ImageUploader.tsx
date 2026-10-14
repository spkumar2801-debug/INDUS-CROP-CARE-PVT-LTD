import React, { useState } from 'react';
import { UploadCloud, AlertCircle, Loader2 } from 'lucide-react';
import { uploadToCloudinary } from '../../lib/cloudinary';

interface ImageUploaderProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string, publicId?: string) => void;
  folder?: 'products' | 'gallery' | 'branding';
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImageUrl,
  onImageUploaded,
  folder = 'products'
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    setProgress(0);

    // Create local object URL for instant preview
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    try {
      const result = await uploadToCloudinary(file, folder, (percent) => {
        setProgress(percent);
      });
      setPreview(result.secureUrl);
      onImageUploaded(result.secureUrl, result.publicId);
    } catch (err: any) {
      console.warn('Cloudinary upload warning:', err);
      setError(err?.message || 'Failed to upload image to Cloudinary.');
      // Keep local preview if user is working locally
      onImageUploaded(localPreview);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <label className="form-label">
        Image File (Cloudinary / Local)
      </label>

      <div className="image-uploader-dropzone">
        <input 
          type="file" 
          accept="image/jpeg,image/png,image/webp,image/jpg" 
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="cloudinary-file-input"
          disabled={uploading}
        />
        <label htmlFor="cloudinary-file-input" style={{ cursor: 'pointer', display: 'block' }}>
          {preview ? (
            <div>
              <img 
                src={preview} 
                alt="Selected asset preview" 
                className="uploader-preview-img"
              />
              <p style={{ fontSize: '0.85rem', color: 'var(--color-primary-green)', fontWeight: 600, margin: '8px 0 0 0' }}>
                Click to replace image
              </p>
            </div>
          ) : (
            <div>
              <UploadCloud size={36} style={{ color: 'var(--color-primary-green)', margin: '0 auto 8px auto' }} />
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-title)', margin: '0 0 4px 0' }}>
                Click or drag & drop to upload photograph
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Supports JPG, PNG, WebP up to 10MB
              </p>
            </div>
          )}
        </label>
      </div>

      {uploading && (
        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Loader2 size={16} className="animate-spin" style={{ color: 'var(--color-primary-green)' }} />
          <div style={{ flex: 1, backgroundColor: '#E0E0E0', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, backgroundColor: 'var(--color-primary-green)', height: '100%', transition: 'width 0.2s' }} />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary-green)' }}>{progress}%</span>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#C62828', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
