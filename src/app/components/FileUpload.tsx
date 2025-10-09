'use client';
import { useState, useRef, ChangeEvent } from 'react';

interface FileUploadProps { onUploadComplete: () => void; }

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');
      onUploadComplete();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mb-2">
      <label htmlFor="file-upload" className={`inline-block text-sm font-medium px-4 py-2 rounded-lg cursor-pointer transition-colors ${isUploading ? 'bg-gray-400 text-gray-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
        {isUploading ? 'Uploading...' : 'Upload Image'}
      </label>
      <input id="file-upload" type="file" ref={fileInputRef} onChange={handleFileChange} disabled={isUploading} className="hidden" accept="image/*" />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}