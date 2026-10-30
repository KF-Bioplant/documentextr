import React, { useState, useEffect } from 'react';
import { MasterEmployeeRecord } from './types';
import { Header } from './components/Header';
import { FileUploadZone } from './components/FileUploadZone';
import { DocumentViewer } from './components/DocumentViewer';
import { FormDetailsEditor } from './components/FormDetailsEditor';
import { MasterTable } from './components/MasterTable';

import { calculateProbationDate, calculateConfirmationDate, enrichEmployeeRecord } from './companyCodes';
import { calculateEmployeeTotalExperience } from './utils/experienceCalculator';
import { applySortedBulletedFormatting } from './utils/listFormatter';
import { API_BASE_URL } from './config';

function ensureEnrichedRecord(rec: MasterEmployeeRecord): MasterEmployeeRecord {
  const prb = (rec.PRB_DT && rec.PRB_DT !== '-')
    ? rec.PRB_DT
    : (rec.JOIN_DT ? calculateProbationDate(rec.JOIN_DT, rec.DESIG) : '-');
  const conf = (rec.CONF_DT && rec.CONF_DT !== '-')
    ? rec.CONF_DT
    : (prb !== '-' ? calculateConfirmationDate(prb) : '-');
  const exp = calculateEmployeeTotalExperience(rec);
  const enrichment = enrichEmployeeRecord({
    COMPANY: rec.COMPANY,
    DESIG: rec.DESIG,
    DEPT_NAME: rec.DEPT_NAME,
    LabDetails: rec.LabDetails,
    JOIN_DT: rec.JOIN_DT
  });

  const normalized: MasterEmployeeRecord = {
    ...rec,
    DESIG_CODE: (rec.DESIG_CODE && rec.DESIG_CODE !== '-') ? rec.DESIG_CODE : enrichment.DESIG_CODE,
    F_DESIG_CODE: (rec.F_DESIG_CODE && rec.F_DESIG_CODE !== '-') ? rec.F_DESIG_CODE : enrichment.F_DESIG_CODE,
    DEPT_CODE: (rec.DEPT_CODE && rec.DEPT_CODE !== '-') ? rec.DEPT_CODE : enrichment.DEPT_CODE,
    F_DEPT_CODE: (rec.F_DEPT_CODE && rec.F_DEPT_CODE !== '-') ? rec.F_DEPT_CODE : enrichment.F_DEPT_CODE,
    SECTION_CODE: (rec.SECTION_CODE && rec.SECTION_CODE !== '-') ? rec.SECTION_CODE : enrichment.SECTION_CODE,
    F_SECTION_CODE: (rec.F_SECTION_CODE && rec.F_SECTION_CODE !== '-') ? rec.F_SECTION_CODE : enrichment.F_SECTION_CODE,
    PRB_DT: prb,
    CONF_DT: conf,
    PreviousExperience: exp.previousExperienceText,
    CurrentExperience: exp.currentExperienceText,
    TotalExperience: exp.totalExperienceText,
    PreviousExperienceMonths: exp.previousExperienceMonths,
    CurrentExperienceMonths: exp.currentExperienceMonths,
    TotalExperienceMonths: exp.totalExperienceMonths
  };
  return applySortedBulletedFormatting(normalized) as MasterEmployeeRecord;
}
import { FileSpreadsheet, CheckCircle2, AlertCircle, Layers, ArrowLeft, Download, Plus, Files } from 'lucide-react';
import { ModelSelectorModal } from './components/ModelSelectorModal';

export default function App() {
  const [records, setRecords] = useState<MasterEmployeeRecord[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [currentScreen, setCurrentScreen] = useState<'upload' | 'results'>('upload');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Model Selection State (gemini-3.5-flash-lite by default)
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    const stored = localStorage.getItem('gemini_selected_model');
    if (!stored || stored.includes('2.5-flash')) {
      localStorage.setItem('gemini_selected_model', 'gemini-3.5-flash-lite');
      return 'gemini-3.5-flash-lite';
    }
    return stored;
  });
  const [isModelModalOpen, setIsModelModalOpen] = useState<boolean>(false);

  // Load saved records from the backend on mount
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/employees`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.records)) {
            setRecords(data.records);
          }
        }
      } catch (err) {
        console.error('Error fetching records:', err);
      }
    };
    fetchRecords();
  }, []);

  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    localStorage.setItem('gemini_selected_model', modelId);
    showToast(`AI model set to "${modelId}"`, 'success');
  };

  const activeRecord = records.find(r => r.id === selectedRecordId) || records[0] || null;

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  // Upload and process scanned form (single or multiple files)
  const handleFileUpload = async (files: File[]) => {
    if (!files || files.length === 0) return;

    // Frontend guard against proxy connection resets for extremely large payloads
    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
    const MAX_TOTAL_SIZE = 45 * 1024 * 1024; // 45MB
    let totalSize = 0;
    
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        showToast(`File "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Please upload files smaller than 25MB to prevent connection drops.`, 'error');
        return;
      }
      totalSize += file.size;
    }
    
    if (totalSize > MAX_TOTAL_SIZE) {
      showToast(`Total upload size is too large (${(totalSize / 1024 / 1024).toFixed(1)}MB). Please limit batch uploads to 45MB total.`, 'error');
      return;
    }

    setIsProcessing(true);
    const isMultiple = files.length > 1;
    setStatusMessage(
      isMultiple
        ? `Preparing batch of ${files.length} scanned employee files with ${selectedModel}...`
        : `Preparing scanned PDF pages for crawling with ${selectedModel}...`
    );

    try {
      const formData = new FormData();
      files.forEach(f => formData.append('files', f));
      formData.append('model', selectedModel);

      setStatusMessage(
        isMultiple
          ? `Extracting and mapping data from ${files.length} employee documents with ${selectedModel}...`
          : `Scanning handwritten fields with ${selectedModel}...`
      );
      let res: Response | null = null;
      let responseText = '';
      let httpStatus = 200;

      // Try up to 10 times with generous timeout to handle AI processing, network drops, or dev server restarts
      for (let attempt = 0; attempt < 10; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(new Error('Timeout: Processing took longer than 5 minutes')), 300000); // 300 second timeout per attempt

        try {
          res = await fetch(`${API_BASE_URL}/extract`, {
            method: 'POST',
            body: formData,
            headers: {
              'x-model-name': selectedModel,
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'include',
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          responseText = await res.text();
          httpStatus = res.status;

          // If proxy returned cookie check or starting server HTML, handle it automatically
          const lowerResponse = responseText ? responseText.toLowerCase() : '';
          if (
            responseText &&
            (lowerResponse.includes('cookie check') || 
             lowerResponse.includes('starting server...') || 
             lowerResponse.includes('<!doctype html>') ||
             lowerResponse.includes('<title>cookie check</title>'))
          ) {
            // Attempt auto-resolution of preview gateway security session cookie
            try {
              const cookieMatches = responseText.match(/document\.cookie\s*=\s*(['"])(.*?)\1/g);
              if (cookieMatches) {
                cookieMatches.forEach(m => {
                  const val = m.replace(/document\.cookie\s*=\s*/, '').replace(/^['"]|['"]$/g, '');
                  if (val) document.cookie = val;
                });
              }
            } catch (_) {}

            if (typeof document !== 'undefined') {
              const testFrame = document.createElement('iframe');
              testFrame.style.display = 'none';
              testFrame.src = '/?gateway_refresh=' + Date.now();
              document.body.appendChild(testFrame);
              setTimeout(() => { try { testFrame.remove(); } catch(_) {} }, 3000);
            }

            if (attempt < 9) {
              console.warn(`[Upload] Gateway session cookie check detected (attempt ${attempt + 1}/10). Auto-resolving and retrying...`);
              await new Promise(r => setTimeout(r, 2000 + attempt * 1000));
              continue;
            }
          }
          break;
        } catch (netErr: any) {
          clearTimeout(timeoutId);
          if (attempt === 9) throw netErr;
          console.warn(`[Upload] Network error or timeout (attempt ${attempt + 1}/10). Retrying...`, netErr);
          await new Promise(r => setTimeout(r, 3000 + attempt * 1000));
        }
      }

      let data: any = null;
      const contentType = res?.headers.get('content-type') || '';
      const lowerResponseText = responseText ? responseText.toLowerCase() : '';

      try {
        if (responseText && responseText.trim() && !lowerResponseText.includes('cookie check') && !lowerResponseText.includes('<!doctype html>')) {
          data = JSON.parse(responseText);
        } else {
          throw new Error('Cookie check verification page received from preview gateway.');
        }
      } catch (parseErr) {
        // Log the actual non-JSON server response for debugging
        console.error('[Upload] Server returned non-JSON response:', {
          status: httpStatus,
          statusText: res?.statusText,
          contentType,
          rawBody: responseText ? responseText.slice(0, 1000) : '<empty body>'
        });

        if (lowerResponseText.includes('cookie check') || lowerResponseText.includes('<!doctype html>')) {
          throw new Error('Preview security session cookie check was triggered. Please click Upload again to proceed.');
        } else if (httpStatus === 503 || httpStatus === 504 || httpStatus === 429) {
          throw new Error('The AI engine is temporarily experiencing high traffic. Please retry in a few moments or switch model.');
        } else if (httpStatus === 502) {
          throw new Error('Gateway error (502). The server took too long to process. Retrying with smaller images is recommended.');
        } else if (httpStatus === 413) {
          throw new Error('The uploaded file size exceeds the server limit (50MB). Please upload a smaller file.');
        } else if (!res?.ok) {
          const bodySnippet = responseText ? responseText.slice(0, 200).replace(/<[^>]*>/g, '').trim() : res?.statusText;
          throw new Error(`Server returned error (${httpStatus}): ${bodySnippet || 'Service unavailable'}`);
        } else {
          throw new Error(`Server returned non-JSON response (${httpStatus}): ${responseText ? responseText.slice(0, 150) : 'Empty response'}`);
        }
      }

      if (!res.ok || data?.success === false) {
        const rawErr = data?.error || data?.message || `Server returned error (${httpStatus})`;
        if (rawErr.includes('503') || rawErr.toLowerCase().includes('high demand') || rawErr.toLowerCase().includes('unavailable')) {
          throw new Error('The selected model is experiencing momentary high demand. The system will automatically failover to Gemini 2.5 Flash-Lite.');
        }
        throw new Error(rawErr);
      }

      const extractedList: MasterEmployeeRecord[] = data.records && data.records.length > 0
        ? data.records
        : data.record ? [data.record] : [];

      const modelUsed = data.modelUsed || selectedModel;

      if (extractedList.length > 0) {
        const enrichedList = extractedList.map(ensureEnrichedRecord);
        setRecords(prev => [...enrichedList, ...prev]);
        setSelectedRecordId(enrichedList[0].id);
        setCurrentScreen('results');
        if (enrichedList.length === 1) {
          showToast(`Successfully extracted data for "${enrichedList[0].NAME || enrichedList[0].fileName}" using ${modelUsed}!`);
        } else {
          showToast(`Successfully extracted ${enrichedList.length} employee records in batch using ${modelUsed}!`);
        }
      } else {
        throw new Error(data.error || 'Extraction did not return valid record data');
      }
    } catch (err: any) {
      console.error('Error uploading and scanning form:', err);
      const msg = err?.message || 'Error parsing scanned document';
      if (msg.includes('Failed to fetch')) {
        showToast('Connection timed out or network dropped. Please retry with Gemini 2.5 Flash-Lite or check your file size.', 'error');
      } else {
        showToast(msg, 'error');
      }
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  };



  // Update record fields
  const handleUpdateRecord = async (updated: MasterEmployeeRecord) => {
    const enriched = ensureEnrichedRecord(updated);
    // Optimistic update
    setRecords(prev => prev.map(r => (r.id === enriched.id ? enriched : r)));
    
    try {
      await fetch(`${API_BASE_URL}/employees/${enriched.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enriched)
      });
    } catch (err) {
      console.error('Error saving update to DB:', err);
      showToast('Failed to save update to database', 'error');
    }
  };

  // Delete record
  const handleDeleteRecord = async (id: string) => {
    // Optimistic update
    const updated = records.filter(r => r.id !== id);
    setRecords(updated);
    
    if (selectedRecordId === id) {
      if (updated.length > 0) {
        setSelectedRecordId(updated[0].id);
      } else {
        setSelectedRecordId(null);
        setCurrentScreen('upload');
      }
    }

    try {
      await fetch(`${API_BASE_URL}/employees/${id}`, { method: 'DELETE' });
      showToast('Record deleted.');
    } catch (err) {
      console.error('Error deleting from DB:', err);
      showToast('Failed to delete from database', 'error');
    }
  };

  // Export to Excel .xlsx
  const handleExportExcel = async (specificIds?: string[]) => {
    const exportList = specificIds
      ? records.filter(r => specificIds.includes(r.id))
      : records;

    if (exportList.length === 0) {
      showToast('No records available for export', 'error');
      return;
    }

    try {
      showToast('Generating Master Format Excel file...');
      const res = await fetch(`${API_BASE_URL}/export-excel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: exportList })
      });

      if (!res.ok) throw new Error('Failed to generate Excel file');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `KF_Futura_Master_Employee_Data_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      showToast(`Exported ${exportList.length} employee record(s) to Excel (.xlsx)`);
    } catch (err: any) {
      console.error('Error downloading Excel:', err);
      showToast('Error exporting Excel file', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation Header */}
      <Header
        totalRecords={records.length}
        onExportAllExcel={() => handleExportExcel()}
        isProcessing={isProcessing}
        currentScreen={currentScreen}
        onGoToUpload={() => setCurrentScreen('upload')}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div
            className={`px-4 py-3 rounded-xl border text-xs font-semibold shadow-2xs flex items-center justify-between transition-all ${
              toastMessage.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {toastMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>{toastMessage.text}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-slate-600 font-bold ml-4 cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* FRONT PAGE: Upload Screen Only */}
        {currentScreen === 'upload' && (
          <div className="max-w-4xl mx-auto py-6">
            <FileUploadZone
              onFileUpload={handleFileUpload}
              isProcessing={isProcessing}
              statusMessage={statusMessage}
              selectedModel={selectedModel}
              onOpenModelModal={() => setIsModelModalOpen(true)}
            />

            {records.length > 0 && (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {records.length} Processed Form(s) Available
                    </h3>
                    <p className="text-xs text-slate-600">
                      You have {records.length} extracted employee record(s) ready for review and Excel export.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentScreen('results')}
                  className="px-4 py-2 text-xs font-bold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors shadow-2xs cursor-pointer"
                >
                  View Fetched Data & Export Excel
                </button>
              </div>
            )}
          </div>
        )}

        {/* NEXT SCREEN: Extracted Results & Verification Screen */}
        {currentScreen === 'results' && activeRecord && (
          <div className="space-y-6">
            {/* Top Results Control Banner with Download Excel Button */}
            <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentScreen('upload')}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                  title="Go back to upload page"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                      CRAWLED & CAPTURED
                    </span>
                    {records.length > 1 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 flex items-center gap-1">
                        <Files className="w-3 h-3 text-emerald-600" />
                        {records.length} Total Forms Loaded
                      </span>
                    )}
                    <h2 className="text-base font-bold text-slate-900">
                      {activeRecord.NAME || activeRecord.fileName || 'Employee Record'}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Scanned Employee Joining / Personal Data Form extracted into 38 Master Format Columns
                  </p>
                </div>
              </div>

              {/* Action Buttons: Download Excel + Upload New */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setCurrentScreen('upload')}
                  className="inline-flex items-center justify-center px-3.5 py-2 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Upload More Forms
                </button>

                <button
                  onClick={() => handleExportExcel()}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 shadow-sm transition-all cursor-pointer flex-1 sm:flex-initial"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Excel ({records.length})
                </button>
              </div>
            </div>

            {/* Side-by-Side Dual Workspace for Active Record */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Document Canvas Viewer */}
              <div className="lg:col-span-5">
                <DocumentViewer record={activeRecord} />
              </div>

              {/* Right Column: Tabbed Master Details Field Editor */}
              <div className="lg:col-span-7">
                <FormDetailsEditor
                  record={activeRecord}
                  onUpdateRecord={handleUpdateRecord}
                />
              </div>
            </div>

            {/* Master Format Data Table Grid */}
            <div className="pt-2">
              <MasterTable
                records={records}
                selectedRecordId={selectedRecordId}
                onSelectRecord={(id) => setSelectedRecordId(id)}
                onDeleteRecord={handleDeleteRecord}
                onExportExcel={handleExportExcel}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="text-emerald-800 font-bold">KF Bioplants Pvt. Ltd.</span>
          </div>
        </div>
      </footer>

      {/* Model Selector Modal */}
      <ModelSelectorModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        selectedModel={selectedModel}
        onSelectModel={handleSelectModel}
      />
    </div>
  );
}