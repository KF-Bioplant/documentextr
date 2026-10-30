import React from 'react';
import { KFBioplantsLogo } from './KFBioplantsLogo';
import { Download, FileSpreadsheet, Sparkles, RefreshCw, CheckCircle2, Cpu, ChevronDown } from 'lucide-react';

interface HeaderProps {
  totalRecords: number;
  onExportAllExcel: () => void;
  isProcessing: boolean;
  onGoToUpload?: () => void;
  currentScreen?: 'upload' | 'results';
}

export const Header: React.FC<HeaderProps> = ({
  totalRecords,
  onExportAllExcel,
  isProcessing,
  onGoToUpload,
  currentScreen
}) => {
  return (
    <header className="bg-white border-b border-emerald-100 shadow-xs sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Branding & Portal Title */}
        <div className="flex items-center gap-4">
          <KFBioplantsLogo size="md" />
          <div className="h-8 w-px bg-emerald-200 hidden sm:block" />
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Employee Personal Data Crawler
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Automated PDF Form Data Extraction & Master Excel Format Mapper
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {currentScreen === 'results' && onGoToUpload && (
            <button
              onClick={onGoToUpload}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
            >
              + Upload Another Form
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

