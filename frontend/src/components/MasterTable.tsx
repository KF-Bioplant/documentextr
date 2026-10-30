import React, { useState } from 'react';
import { MasterEmployeeRecord } from '../types';
import { Search, Download, Trash2, Eye, FileSpreadsheet, CheckSquare, Square, Calendar, Clock, Table, Info, Briefcase, Award } from 'lucide-react';
import { 
  MASTER_PROBATION_RULES_TABLE, 
  getProbationRuleMatch, 
  calculateProbationDate, 
  calculateConfirmationDate 
} from '../companyCodes';
import { calculateEmployeeTotalExperience } from '../utils/experienceCalculator';

interface MasterTableProps {
  records: MasterEmployeeRecord[];
  selectedRecordId: string | null;
  onSelectRecord: (id: string) => void;
  onDeleteRecord: (id: string) => void;
  onExportExcel: (selectedIds?: string[]) => void;
}

const Cell: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className = '', title }) => (
  <td className={`p-3 whitespace-nowrap ${className}`} title={title}>{children}</td>
);

export const MasterTable: React.FC<MasterTableProps> = ({
  records,
  selectedRecordId,
  onSelectRecord,
  onDeleteRecord,
  onExportExcel
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showRulesModal, setShowRulesModal] = useState(false);

  const filteredRecords = records.filter(rec => {
    const term = searchTerm.toLowerCase();
    return (
      (rec.NAME || '').toLowerCase().includes(term) ||
      (rec.EMAILID || '').toLowerCase().includes(term) ||
      (rec.EMP_MobileNumber || '').includes(term) ||
      (rec.DESIG || '').toLowerCase().includes(term) ||
      (rec.DEPT_NAME || '').toLowerCase().includes(term) ||
      (rec.DESIG_CODE || '').toLowerCase().includes(term) ||
      (rec.F_DESIG_CODE || '').toLowerCase().includes(term) ||
      (rec.DEPT_CODE || '').toLowerCase().includes(term) ||
      (rec.F_DEPT_CODE || '').toLowerCase().includes(term) ||
      (rec.SECTION_CODE || '').toLowerCase().includes(term) ||
      (rec.F_SECTION_CODE || '').toLowerCase().includes(term) ||
      (rec.PRB_DT || '').includes(term) ||
      (rec.CONF_DT || '').includes(term)
    );
  });

  const toggleSelectAll = () => {
    if (filteredRecords.length > 0 && selectedIds.length === filteredRecords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRecords.map(r => r.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const codeClass = (value?: string) => value && value !== '-' ? 'font-mono font-bold text-emerald-800' : 'font-mono text-rose-600';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg"><FileSpreadsheet className="w-5 h-5" /></div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Master Format Extracted Records Grid</h2>
            <p className="text-xs text-slate-500">
              Displaying {filteredRecords.length} of {records.length} employee forms (38 Master Columns)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, code, date..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 w-52 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {selectedIds.length > 0 && (
            <button onClick={() => onExportExcel(selectedIds)} className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 cursor-pointer">
              <Download className="w-3.5 h-3.5 mr-1" /> Export Selected ({selectedIds.length})
            </button>
          )}
          <button onClick={() => onExportExcel()} className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 cursor-pointer">
            <Download className="w-3.5 h-3.5 mr-1" /> Export Excel
          </button>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[460px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-emerald-800 text-white sticky top-0 z-20 font-bold">
              <th className="p-3 border-b border-emerald-900 w-10 text-center">
                <button onClick={toggleSelectAll} className="cursor-pointer">
                  {selectedIds.length > 0 && selectedIds.length === filteredRecords.length ? <CheckSquare className="w-4 h-4 text-emerald-200" /> : <Square className="w-4 h-4 text-emerald-300" />}
                </button>
              </th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[160px] sticky left-0 bg-emerald-800 z-30">1. NAME</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[180px]">Company Name (Futura and KF Bioplant)</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[100px]">2. BIRTH_DT</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[70px]">3. Gender</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[100px]">4. Marital Status</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[140px]">5. DESIG</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[95px]">Designation Code</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[105px]">F_Designation Code</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[100px]">6. JOIN_DT</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[115px]">7. PRB_DT</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[115px]">8. CONF_DT</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[140px]">9. DEPT_NAME</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[95px]">Department Code</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[105px]">F_Department Code</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[120px]">10. Lab Details</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[90px]">Section Code</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[95px]">F_Section Code</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[110px]">11. EPAN_NO</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[160px]">12. EMAILID</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[200px]">13. Address 1</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[200px]">14. Address2</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[80px]">15. Pin 1</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[80px]">16. Pin 2</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[110px]">17. ADHAR_NO</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[110px]">18. PF_UAN</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[110px]">19. ESI Number</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[120px]">20. EMP_Mobile Number</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[120px]">21. Alternate_Mobile Number</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[130px]">22. Father Name</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[100px]">23. DOB</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[130px]">24. Mother Name</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[100px]">25. DOB</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[130px]">26. Spouse_Name</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[100px]">27. DOB</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[110px]">28. Child_1</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[100px]">29. DOB</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[110px]">30. Child_2</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[100px]">31. DOB</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[180px]">32. Qualification</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[180px]">33. Previous Employement</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[180px]">34. Present Employement</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[140px]">Total Exp</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[130px]">35. Reference Name</th>
              <th className="p-3 border-b border-emerald-900 whitespace-nowrap min-w-[90px] text-center sticky right-0 bg-emerald-800 z-30">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredRecords.length === 0 ? (
              <tr><td colSpan={40} className="p-8 text-center text-slate-500 font-medium">No employee records processed yet. Upload a scanned form or click "Load Sample Form".</td></tr>
            ) : filteredRecords.map((rec, index) => {
              const isSelected = selectedRecordId === rec.id;
              const isChecked = selectedIds.includes(rec.id);
              const rowBg = isSelected ? 'bg-emerald-100' : index % 2 === 0 ? 'bg-white' : 'bg-slate-50';
              const ruleMatch = getProbationRuleMatch(rec.DESIG);
              const prbDate = (rec.PRB_DT && rec.PRB_DT !== '-') ? rec.PRB_DT : (rec.JOIN_DT ? calculateProbationDate(rec.JOIN_DT, rec.DESIG) : '-');
              const confDate = (rec.CONF_DT && rec.CONF_DT !== '-') ? rec.CONF_DT : (prbDate !== '-' ? calculateConfirmationDate(prbDate) : '-');
              const exp = calculateEmployeeTotalExperience(rec);
              const prevExp = rec.PreviousExperience || exp.previousExperienceText;
              const currExp = rec.CurrentExperience || exp.currentExperienceText;
              const totalExp = rec.TotalExperience || exp.totalExperienceText;

              return (
                <tr key={rec.id} className={`transition-colors hover:bg-emerald-50/60 ${isSelected ? 'bg-emerald-100/50 font-semibold' : index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                  <td className="p-3 text-center"><button onClick={() => toggleSelectOne(rec.id)} className="cursor-pointer">{isChecked ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-slate-300" />}</button></td>
                  <td onClick={() => onSelectRecord(rec.id)} className={`p-3 whitespace-nowrap sticky left-0 z-10 cursor-pointer font-bold text-slate-900 ${rowBg}`}>
                    <div className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-emerald-600 shrink-0" /><span className="truncate">{rec.NAME || 'Unnamed'}</span></div>
                  </td>
                  <Cell className="font-semibold text-emerald-700">
                    {rec.COMPANY === 'FUTURA' ? 'Futura' : rec.COMPANY === 'KF' ? 'KF Bioplants' : rec.COMPANY || '-'}
                  </Cell>
                  <Cell>{rec.BIRTH_DT || '-'}</Cell>
                  <Cell>{rec.Gender || '-'}</Cell>
                  <Cell>{rec.MaritalStatus || '-'}</Cell>
                  <Cell className="font-medium text-emerald-900" title={ruleMatch ? `${ruleMatch.canonicalName} (${ruleMatch.probationBucket})` : undefined}>
                    {rec.DESIG || '-'}
                  </Cell>
                  <Cell className={codeClass(rec.DESIG_CODE)}>{rec.DESIG_CODE || '-'}</Cell>
                  <Cell className={codeClass(rec.F_DESIG_CODE)}>{rec.F_DESIG_CODE || '-'}</Cell>
                  <Cell className="font-semibold text-slate-900">{rec.JOIN_DT || '-'}</Cell>
                  <Cell>{prbDate || '-'}</Cell>
                  <Cell>{confDate || '-'}</Cell>
                  <Cell>{rec.DEPT_NAME || '-'}</Cell>
                  <Cell className={codeClass(rec.DEPT_CODE)}>{rec.DEPT_CODE || '-'}</Cell>
                  <Cell className={codeClass(rec.F_DEPT_CODE)}>{rec.F_DEPT_CODE || '-'}</Cell>
                  <Cell>{rec.LabDetails || '-'}</Cell>
                  <Cell className={codeClass(rec.SECTION_CODE)}>{rec.SECTION_CODE || '-'}</Cell>
                  <Cell className={codeClass(rec.F_SECTION_CODE)}>{rec.F_SECTION_CODE || '-'}</Cell>
                  <Cell className="font-mono">{rec.EPAN_NO || '-'}</Cell>
                  <Cell className="text-emerald-800 font-medium">{rec.EMAILID || '-'}</Cell>
                  <Cell className="max-w-[200px] truncate" title={rec.Address1}>{rec.Address1 || '-'}</Cell>
                  <Cell className="max-w-[200px] truncate" title={rec.Address2}>{rec.Address2 || '-'}</Cell>
                  <Cell className="font-mono">{rec.Pin1 || '-'}</Cell>
                  <Cell className="font-mono">{rec['Pin 2'] || '-'}</Cell>
                  <Cell className="font-mono">{rec.ADHAR_NO || '-'}</Cell>
                  <Cell className="font-mono">{rec.PF_UAN || '-'}</Cell>
                  <Cell className="font-mono">{rec.ESI_Number || '-'}</Cell>
                  <Cell className="font-semibold text-slate-800">{rec.EMP_MobileNumber || '-'}</Cell>
                  <Cell>{rec.Alternate_MobileNumber || '-'}</Cell>
                  <Cell>{rec.FatherName || '-'}</Cell>
                  <Cell>{rec.FatherDOB || '-'}</Cell>
                  <Cell>{rec.MotherName || '-'}</Cell>
                  <Cell>{rec.MotherDOB || '-'}</Cell>
                  <Cell>{rec.SpouseName || '-'}</Cell>
                  <Cell>{rec.SpouseDOB || '-'}</Cell>
                  <Cell>{rec.Child1 || '-'}</Cell>
                  <Cell>{rec.Child1DOB || '-'}</Cell>
                  <Cell>{rec.Child2 || '-'}</Cell>
                  <Cell>{rec.Child2DOB || '-'}</Cell>
                  <Cell className="min-w-[200px] max-w-[300px] whitespace-pre-line text-left leading-tight py-2 text-[11px]" title={rec.Qualification}>{rec.Qualification || '-'}</Cell>
                  <Cell className="min-w-[200px] max-w-[300px] whitespace-pre-line text-left leading-tight py-2 text-[11px]" title={rec.PreviousEmployment}>{rec.PreviousEmployment || '-'}</Cell>
                  <Cell className="min-w-[180px] max-w-[260px] whitespace-pre-line text-left leading-tight py-2 text-[11px]" title={rec.PresentEmployment}>{rec.PresentEmployment || '-'}</Cell>

                  <Cell className="font-semibold text-slate-800">{totalExp || '-'}</Cell>

                  <Cell>{rec.ReferenceName || '-'}</Cell>
                  <td className={`p-3 whitespace-nowrap text-center sticky right-0 z-10 ${rowBg}`}>
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => onSelectRecord(rec.id)} className="p-1 text-emerald-700 hover:bg-emerald-100 rounded cursor-pointer" title="View / Edit Form Details"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => onDeleteRecord(rec.id)} className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer" title="Delete Record"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Rules Reference Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Table className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm">Master Probation & Confirmation Calculation Table</h3>
                  <p className="text-[11px] text-slate-300">Rules applied to PRB_DT & CONF_DT columns</p>
                </div>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer"
              >
                Close (ESC)
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 text-xs">
              <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-[11px] space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-emerald-700" />
                  Calculation Flow Logic:
                </div>
                <div>• <strong>Step A:</strong> System reads candidate <code>JOIN_DT</code> & <code>DESIG</code>.</div>
                <div>• <strong>Step B:</strong> Designation is matched to one of the 3 buckets (3 Months, 6 Months, 1 Year).</div>
                <div>• <strong>Step C (PRB_DT):</strong> <code>PRB_DT = JOIN_DT + Probation Duration</code></div>
                <div>• <strong>Step D (CONF_DT):</strong> <code>CONF_DT = PRB_DT + 6 Months</code> (Confirmation is always 6 months after Probation).</div>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">Designation Description</th>
                    <th className="p-2.5">Bucket</th>
                    <th className="p-2.5">Probation Rule (PRB_DT)</th>
                    <th className="p-2.5">Confirmation Rule (CONF_DT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {MASTER_PROBATION_RULES_TABLE.map((r, i) => (
                    <tr key={r.designationDesc} className="hover:bg-slate-50">
                      <td className="p-2.5 text-slate-500 font-mono">{i + 1}</td>
                      <td className="p-2.5 font-bold text-slate-900">{r.designationDesc}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.probationBucket === '3 Months' 
                            ? 'bg-blue-100 text-blue-800' 
                            : r.probationBucket === '6 Months'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {r.probationBucket}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-700">{r.probationRuleText}</td>
                      <td className="p-2.5 text-slate-700">{r.confirmationRuleText}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowRulesModal(false)}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};