import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Sparkles, AlertCircle, CheckCircle2, Loader2, Image as ImageIcon, Files, FilePlus, Layers, Cpu, Settings2 } from 'lucide-react';

interface FileUploadZoneProps {
  onFileUpload: (files: File[]) => void;
  isProcessing: boolean;
  statusMessage?: string;
  selectedModel: string;
  onOpenModelModal: () => void;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileUpload,
  isProcessing,
  statusMessage,
  selectedModel,
  onOpenModelModal
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFileList, setSelectedFileList] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(
        (f: File) => f.type.includes('pdf') || f.type.includes('image') || f.name.toLowerCase().endsWith('.pdf')
      );
      if (droppedFiles.length > 0) {
        setSelectedFileList(droppedFiles);
        onFileUpload(droppedFiles);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setSelectedFileList(selectedFiles);
      onFileUpload(selectedFiles);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 mb-6">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Upload Scanned Employee Personal Data Forms
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload single or multiple PDF scans / form images. AI extracts details and auto-maps each into 35 Master Columns.
          </p>
        </div>

        </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
          isDragOver
            ? 'border-emerald-500 bg-emerald-50/50'
            : 'border-slate-300 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/20'
        } ${isProcessing ? 'pointer-events-none opacity-80' : ''}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,image/png,image/jpeg,image/jpg"
          multiple
          className="hidden"
        />

        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-4">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-3" />
            <h3 className="text-sm font-bold text-slate-800">
              Crawling & Extracting Handwritten Form Data...
            </h3>
            <p className="text-xs text-emerald-700 font-medium mt-1">
              {statusMessage || `Gemini (${selectedModel}) is scanning fields, table rows, and mapping to Master Excel format.`}
            </p>
            {selectedFileList.length > 1 && (
              <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                <Files className="w-3.5 h-3.5 mr-1.5" />
                Processing {selectedFileList.length} uploaded files in batch
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              Drag & Drop Scanned Employee Personal Data Files (Single or Multiple)
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              Select <span className="font-semibold text-slate-700">one or multiple PDF documents / images</span> containing handwritten or printed Personal Data Forms.
            </p>
            <div className="mt-4 inline-flex items-center px-4 py-2 rounded-lg text-xs font-bold bg-white text-emerald-800 border border-emerald-300 shadow-2xs hover:bg-emerald-50 transition-colors gap-1.5">
              <FilePlus className="w-4 h-4 text-emerald-700" />
              <span>Browse Files from Computer (Multi-Select Enabled)</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-500 gap-2">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          Multi-file batch extraction supported: upload multiple candidate PDFs simultaneously.
        </span>
        <span className="flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          Auto-maps to 35 Master Format Columns & Extended History
        </span>
      </div>
    </div>
  );
};

