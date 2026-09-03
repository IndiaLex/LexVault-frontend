import React, { useState } from 'react';
import { Upload, Link as LinkIcon, Loader2 } from 'lucide-react';

interface UploadPanelProps {
  onUploadSimulate?: (fileName: string) => void;
  onUploadFile?: (file: File) => Promise<void> | void;
  onAnchorSimulate: () => void;
  isAnchoring?: boolean;
}

export const UploadPanel: React.FC<UploadPanelProps> = ({
  onUploadSimulate,
  onUploadFile,
  onAnchorSimulate,
  isAnchoring = false,
}) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      if (onUploadFile) {
        await onUploadFile(file);
      } else if (onUploadSimulate) {
        onUploadSimulate(file.name);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium cursor-pointer transition">
        {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
        {uploading ? 'Processing File...' : 'Upload Evidence'}
        <input
          type="file"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
          accept=".pdf,.png,.jpg,.jpeg"
        />
      </label>

      <button
        onClick={onAnchorSimulate}
        disabled={isAnchoring}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-medium transition shadow"
      >
        {isAnchoring ? (
          <>
            <Loader2 size={13} className="animate-spin" /> Anchoring Batch...
          </>
        ) : (
          <>
            <LinkIcon size={13} /> Anchor to Polygon
          </>
        )}
      </button>
    </div>
  );
};