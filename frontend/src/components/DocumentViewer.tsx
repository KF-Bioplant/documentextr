import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw, FileText, ChevronLeft, ChevronRight, Eye, ShieldCheck, Download } from 'lucide-react';
import { MasterEmployeeRecord } from '../types';

interface DocumentViewerProps {
  record: MasterEmployeeRecord;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ record }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  // Pages preview list (use images provided or custom previews)
  const pages = record.previewImages && record.previewImages.length > 0
    ? record.previewImages
    : ['/sample_page1.png', '/sample_page2.png', '/sample_page3.png'];

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  return (
    <div className="bg-slate-900 text-white rounded-xl shadow-md overflow-hidden flex flex-col h-[700px] border border-slate-800">
      {/* Top Toolbar */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-200 truncate">
            {record.fileName}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
            <ShieldCheck className="w-3 h-3 mr-1" />
            {record.confidenceScore}% Accuracy
          </span>
        </div>

        {/* Page & Zoom Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-800 text-xs text-slate-300">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
              disabled={currentPage === 0}
              className="p-1 hover:bg-slate-800 rounded disabled:opacity-30 cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-xs">
              Page {currentPage + 1} of {pages.length}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pages.length - 1))}
              disabled={currentPage === pages.length - 1}
              className="p-1 hover:bg-slate-800 rounded disabled:opacity-30 cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-800">
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 text-[11px] font-mono text-slate-400 min-w-[38px] text-center">
              {zoom}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRotate}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded ml-1 cursor-pointer"
              title="Rotate 90deg"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Document Content Canvas */}
      <div className="flex-1 bg-slate-950 p-4 overflow-auto flex items-center justify-center relative">
        <div
          className="transition-transform duration-200 ease-out origin-center relative shadow-2xl rounded"
          style={{
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`
          }}
        >
          {/* Form Page Renderer */}
          {currentPage === 0 && (
            <FormPage1Graphic record={record} />
          )}
          {currentPage === 1 && (
            <FormPage2Graphic record={record} />
          )}
          {currentPage === 2 && (
            <FormPage3Graphic record={record} />
          )}
        </div>
      </div>

      {/* Footer Info bar */}
      <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-emerald-400" />
          Interactive Scanned Form View — Page {currentPage + 1}
        </span>
        <span className="text-slate-500">
          Showing mapped field annotations & OCR layout boundaries
        </span>
      </div>
    </div>
  );
};

// Graphic replica renderer for Page 1 of Personal Data Form
const FormPage1Graphic: React.FC<{ record: MasterEmployeeRecord }> = ({ record }) => {
  const ext = record.extendedDetails || {};
  return (
    <div className="w-[520px] bg-white text-slate-900 p-6 shadow-xl border border-slate-300 font-sans text-[11px] relative select-none">
      <div className="border-2 border-slate-800 p-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-800 pb-2 mb-2">
          <div className="font-bold text-xs text-emerald-800">
            KF Bioplants PVT. LTD.
          </div>
          <div className="text-center font-black text-sm text-slate-900 tracking-wider">
            PERSONAL DATA FORM
          </div>
          <div className="w-16 h-18 border border-slate-400 text-[8px] text-slate-400 flex items-center justify-center text-center leading-tight">
            Photo
          </div>
        </div>

        {/* Section 1: Personal Details */}
        <div className="space-y-1.5 mb-3 text-[10px]">
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded font-mono">
            <div><span className="font-bold text-slate-600">Full Name:</span> <span className="text-emerald-900 font-bold bg-yellow-100 px-1">{record.NAME}</span></div>
            <div><span className="font-bold text-slate-600">DOB:</span> <span className="font-bold bg-yellow-100 px-1">{record.BIRTH_DT}</span></div>
          </div>
          <div className="grid grid-cols-3 gap-2 border-b border-slate-200 pb-1">
            <div><span className="text-slate-500">Gender:</span> <strong>{record.Gender}</strong></div>
            <div><span className="text-slate-500">Marital Status:</span> <strong>{record.MaritalStatus}</strong></div>
            <div><span className="text-slate-500">Age:</span> <strong>{ext.age || '25'}</strong></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-slate-500">Mobile:</span> <strong className="text-emerald-800">{record.EMP_MobileNumber}</strong></div>
            <div><span className="text-slate-500">Email:</span> <strong className="text-emerald-800">{record.EMAILID}</strong></div>
          </div>
        </div>

        {/* Section 2: Permanent & Mailing Address */}
        <div className="grid grid-cols-2 gap-2 border-t border-slate-800 pt-2 mb-3 text-[9px]">
          <div className="bg-emerald-50/50 p-1.5 rounded border border-emerald-100">
            <div className="font-bold text-emerald-900 text-[10px] mb-1">Permanent Address</div>
            <p className="text-slate-800 leading-snug">{record.Address1}</p>
            <div className="mt-1 font-bold text-slate-700">PIN: {record.Pin1}</div>
          </div>
          <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
            <div className="font-bold text-slate-900 text-[10px] mb-1">Mailing Address</div>
            <p className="text-slate-800 leading-snug">{record.Address2}</p>
            <div className="mt-1 font-bold text-slate-700">PIN: {record['Pin 2']}</div>
          </div>
        </div>

        {/* Section 3: Family Details */}
        <div className="border-t border-slate-800 pt-2">
          <div className="font-bold text-[10px] text-slate-800 mb-1">Family Details & Dependents</div>
          <table className="w-full text-[9px] border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-200 font-bold text-slate-700">
                <th className="border border-slate-300 px-1 py-0.5 text-left">Relation</th>
                <th className="border border-slate-300 px-1 py-0.5 text-left">Name</th>
                <th className="border border-slate-300 px-1 py-0.5 text-left">DOB</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 px-1 py-0.5 font-semibold">Father</td>
                <td className="border border-slate-300 px-1 py-0.5 text-emerald-900 font-bold">{record.FatherName}</td>
                <td className="border border-slate-300 px-1 py-0.5">{record.FatherDOB}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 px-1 py-0.5 font-semibold">Mother</td>
                <td className="border border-slate-300 px-1 py-0.5 text-emerald-900 font-bold">{record.MotherName}</td>
                <td className="border border-slate-300 px-1 py-0.5">{record.MotherDOB}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Graphic replica renderer for Page 2
const FormPage2Graphic: React.FC<{ record: MasterEmployeeRecord }> = ({ record }) => {
  const ext = record.extendedDetails || {};
  return (
    <div className="w-[520px] bg-white text-slate-900 p-6 shadow-xl border border-slate-300 font-sans text-[11px] relative select-none">
      <div className="border-2 border-slate-800 p-3">
        <div className="font-bold text-xs text-emerald-800 border-b-2 border-slate-800 pb-1 mb-2">
          ACADEMIC QUALIFICATIONS & EMPLOYMENT
        </div>

        {/* Qualification summary */}
        <div className="bg-yellow-50 border border-yellow-200 p-2 rounded mb-3 text-[10px]">
          <div className="font-bold text-slate-700 mb-0.5">Highest Qualification Mapped:</div>
          <div className="font-bold text-emerald-900">{record.Qualification}</div>
        </div>

        {/* Academic qualifications table */}
        <table className="w-full text-[8.5px] border-collapse border border-slate-300 mb-3">
          <thead>
            <tr className="bg-slate-200 font-bold text-slate-700">
              <th className="border border-slate-300 px-1 py-0.5 text-left">Level</th>
              <th className="border border-slate-300 px-1 py-0.5 text-left">Institute</th>
              <th className="border border-slate-300 px-1 py-0.5 text-left">Board</th>
              <th className="border border-slate-300 px-1 py-0.5 text-center">% / CGPA</th>
            </tr>
          </thead>
          <tbody>
            {(ext.academics || []).map((ac, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="border border-slate-300 px-1 py-0.5 font-bold">{ac.level}</td>
                <td className="border border-slate-300 px-1 py-0.5">{ac.institute}</td>
                <td className="border border-slate-300 px-1 py-0.5">{ac.boardUniversity}</td>
                <td className="border border-slate-300 px-1 py-0.5 text-center font-bold text-emerald-800">{ac.percentageOrCgpa}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Previous employment */}
        <div className="border-t border-slate-800 pt-2 mb-2">
          <div className="font-bold text-[10px] text-slate-800 mb-1">Previous Employment Record</div>
          <div className="bg-emerald-50/60 p-2 rounded border border-emerald-200 text-[9.5px]">
            <p className="font-bold text-emerald-950">{record.PreviousEmployment}</p>
          </div>
        </div>

        {/* Present Employment */}
        <div className="border-t border-slate-800 pt-2">
          <div className="font-bold text-[10px] text-slate-800 mb-1">Present Employment</div>
          <div className="bg-slate-100 p-2 rounded border border-slate-300 text-[9.5px] space-y-1">
            <div><span className="font-bold text-slate-600">Company:</span> {record.PresentEmployment}</div>
            <div><span className="font-bold text-slate-600">Joining Date:</span> <strong className="text-emerald-800">{record.JOIN_DT}</strong></div>
            <div><span className="font-bold text-slate-600">Designation:</span> <strong className="text-emerald-800">{record.DESIG}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Graphic replica renderer for Page 3
const FormPage3Graphic: React.FC<{ record: MasterEmployeeRecord }> = ({ record }) => {
  const ext = record.extendedDetails || {};
  return (
    <div className="w-[520px] bg-white text-slate-900 p-6 shadow-xl border border-slate-300 font-sans text-[11px] relative select-none">
      <div className="border-2 border-slate-800 p-3">
        <div className="font-bold text-xs text-emerald-800 border-b-2 border-slate-800 pb-1 mb-2">
          COMPENSATION & DISCLOSURES
        </div>

        <div className="space-y-2 text-[10px]">
          <div className="grid grid-cols-2 gap-2 bg-emerald-50 p-2 rounded border border-emerald-200">
            <div><span className="text-slate-600">Major Experience:</span> <strong className="text-emerald-900">{record.DEPT_NAME}</strong></div>
            <div><span className="text-slate-600">Gross CTC:</span> <strong className="text-emerald-900">{ext.ctcGrossPerAnnum || 'Rs. 3,80,000'}</strong></div>
          </div>

          <div className="border border-slate-200 p-2 rounded">
            <div className="font-bold text-slate-700 mb-1">Organization Chart Chain:</div>
            <p className="font-mono text-[9px] bg-slate-100 p-1 rounded text-slate-800">{ext.organizationChart || 'HR-HEAD -> ASST. MANAGER -> EXECUTIVE -> ASSOCIATE -> TRAINEE'}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-slate-800 pt-2 text-[9.5px]">
            <div><span className="text-slate-600">Reporting Manager:</span> <strong>{record.ReferenceName}</strong></div>
            <div><span className="text-slate-600">Joining Availability:</span> <strong>{ext.joiningAvailability || 'IMMEDIATE JOINER'}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
};
