import React, { useState } from 'react';
import { MasterEmployeeRecord, PreviousJob } from '../types';
import { 
  enrichEmployeeRecord, 
  getFullDateCalculation, 
  calculateConfirmationDate, 
  calculateProbationDate,
  MASTER_PROBATION_RULES_TABLE 
} from '../companyCodes';
import { 
  calculateEmployeeTotalExperience,
  formatMonthsToExperience 
} from '../utils/experienceCalculator';
import {
  applySortedBulletedFormatting,
  formatPreviousEmploymentsList,
  formatQualificationsList
} from '../utils/listFormatter';
import { 
  User, 
  MapPin, 
  Briefcase, 
  Users, 
  FileSpreadsheet, 
  AlertTriangle, 
  Edit3, 
  Calendar, 
  Calculator, 
  RefreshCw, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Info,
  Table,
  Award,
  Plus,
  Trash
} from 'lucide-react';

interface FormDetailsEditorProps {
  record: MasterEmployeeRecord;
  onUpdateRecord: (updated: MasterEmployeeRecord) => void;
}

export const FormDetailsEditor: React.FC<FormDetailsEditorProps> = ({
  record,
  onUpdateRecord
}) => {
  const [activeTab, setActiveTab] = useState<'master' | 'personal' | 'family' | 'employment'>('master');
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [justRecalculated, setJustRecalculated] = useState(false);

  const calculationDetails = getFullDateCalculation(record.JOIN_DT, record.DESIG);
  const experienceDetails = calculateEmployeeTotalExperience(record);

  // Auto-sync calculated probation, confirmation and experience dates if missing
  React.useEffect(() => {
    if (record.JOIN_DT && record.JOIN_DT !== '-') {
      const autoPrb = calculateProbationDate(record.JOIN_DT, record.DESIG);
      const autoConf = autoPrb !== '-' ? calculateConfirmationDate(autoPrb) : '-';
      const needsPrbUpdate = (!record.PRB_DT || record.PRB_DT === '-') && autoPrb !== '-';
      const needsConfUpdate = (!record.CONF_DT || record.CONF_DT === '-') && autoConf !== '-';
      const needsExpUpdate = !record.TotalExperience || record.TotalExperience === '-';

      if (needsPrbUpdate || needsConfUpdate || needsExpUpdate) {
        const exp = calculateEmployeeTotalExperience(record);
        onUpdateRecord({
          ...record,
          PRB_DT: needsPrbUpdate ? autoPrb : record.PRB_DT,
          CONF_DT: needsConfUpdate ? autoConf : record.CONF_DT,
          PreviousExperience: (record.PreviousExperience && record.PreviousExperience !== '-') ? record.PreviousExperience : exp.previousExperienceText,
          CurrentExperience: (record.CurrentExperience && record.CurrentExperience !== '-') ? record.CurrentExperience : exp.currentExperienceText,
          TotalExperience: (record.TotalExperience && record.TotalExperience !== '-') ? record.TotalExperience : exp.totalExperienceText,
          PreviousExperienceMonths: exp.previousExperienceMonths,
          CurrentExperienceMonths: exp.currentExperienceMonths,
          TotalExperienceMonths: exp.totalExperienceMonths
        });
      }
    }
  }, [record.id, record.JOIN_DT, record.DESIG]);

  const handleChange = (field: keyof MasterEmployeeRecord, value: string) => {
    let next = { ...record, [field]: value } as MasterEmployeeRecord;

    if (field === 'COMPANY' || field === 'DESIG' || field === 'DEPT_NAME' || field === 'LabDetails' || field === 'JOIN_DT') {
      const enrichment = enrichEmployeeRecord({
        COMPANY: next.COMPANY || '',
        DESIG: next.DESIG || '',
        DEPT_NAME: next.DEPT_NAME || '',
        LabDetails: next.LabDetails || '',
        JOIN_DT: next.JOIN_DT || ''
      });

      next.COMPANY = enrichment.COMPANY;
      next.DESIG_CODE = enrichment.DESIG_CODE;
      next.F_DESIG_CODE = enrichment.F_DESIG_CODE;
      next.DEPT_CODE = enrichment.DEPT_CODE;
      next.F_DEPT_CODE = enrichment.F_DEPT_CODE;
      next.SECTION_CODE = enrichment.SECTION_CODE;
      next.F_SECTION_CODE = enrichment.F_SECTION_CODE;
      
      // Auto-recalculate PRB_DT and CONF_DT when JOIN_DT or DESIG changes
      if (field === 'DESIG' || field === 'JOIN_DT') {
        const autoPrb = calculateProbationDate(next.JOIN_DT, next.DESIG);
        const autoConf = autoPrb !== '-' ? calculateConfirmationDate(autoPrb) : '-';
        next.PRB_DT = autoPrb;
        next.CONF_DT = autoConf;
      }
      next.codeMappingStatus = enrichment.codeMappingStatus;
    } else if (field === 'PRB_DT') {
      // When user edits PRB_DT directly, auto-update CONF_DT to PRB_DT + 6 months
      if (value && value !== '-') {
        const autoConf = calculateConfirmationDate(value);
        if (autoConf !== '-') {
          next.CONF_DT = autoConf;
        }
      }
    }

    // Auto update experience when JOIN_DT, PreviousEmployment, or PresentEmployment changes
    if (field === 'JOIN_DT' || field === 'PreviousEmployment' || field === 'PresentEmployment') {
      const exp = calculateEmployeeTotalExperience(next);
      next.PreviousExperience = exp.previousExperienceText;
      next.CurrentExperience = exp.currentExperienceText;
      next.TotalExperience = exp.totalExperienceText;
      next.PreviousExperienceMonths = exp.previousExperienceMonths;
      next.CurrentExperienceMonths = exp.currentExperienceMonths;
      next.TotalExperienceMonths = exp.totalExperienceMonths;
    }

    onUpdateRecord(next);
  };

  const handleForceRecalculate = () => {
    const autoPrb = calculateProbationDate(record.JOIN_DT, record.DESIG);
    const autoConf = autoPrb !== '-' ? calculateConfirmationDate(autoPrb) : '-';
    const exp = calculateEmployeeTotalExperience(record);
    
    const updated: MasterEmployeeRecord = {
      ...record,
      PRB_DT: autoPrb,
      CONF_DT: autoConf,
      PreviousExperience: exp.previousExperienceText,
      CurrentExperience: exp.currentExperienceText,
      TotalExperience: exp.totalExperienceText,
      PreviousExperienceMonths: exp.previousExperienceMonths,
      CurrentExperienceMonths: exp.currentExperienceMonths,
      TotalExperienceMonths: exp.totalExperienceMonths
    };
    onUpdateRecord(applySortedBulletedFormatting(updated) as MasterEmployeeRecord);
    setJustRecalculated(true);
    setTimeout(() => setJustRecalculated(false), 2000);
  };

  const handleAddPreviousJob = () => {
    const existing = record.extendedDetails?.previousEmployments || [];
    const newJob: PreviousJob = {
      organizationName: 'Previous Employer',
      duration: '01/01/2020 to 01/01/2022',
      fromDate: '01/01/2020',
      toDate: '01/01/2022',
      lastDesignation: 'Associate',
      emoluments: '25,000 / mo',
      industry: 'Industry',
      reasonForLeaving: 'Career Growth'
    };
    const updatedJobs = [...existing, newJob];
    const updatedExtended = { ...record.extendedDetails, previousEmployments: updatedJobs };
    const nextRecord = { ...record, extendedDetails: updatedExtended };
    const exp = calculateEmployeeTotalExperience(nextRecord);
    nextRecord.PreviousExperience = exp.previousExperienceText;
    nextRecord.CurrentExperience = exp.currentExperienceText;
    nextRecord.TotalExperience = exp.totalExperienceText;
    nextRecord.PreviousExperienceMonths = exp.previousExperienceMonths;
    nextRecord.CurrentExperienceMonths = exp.currentExperienceMonths;
    nextRecord.TotalExperienceMonths = exp.totalExperienceMonths;
    nextRecord.PreviousEmployment = formatPreviousEmploymentsList(updatedJobs, nextRecord.PreviousEmployment);
    onUpdateRecord(nextRecord);
  };

  const handleUpdatePreviousJob = (idx: number, patch: Partial<PreviousJob>) => {
    const existing = [...(record.extendedDetails?.previousEmployments || [])];
    if (existing[idx]) {
      existing[idx] = { ...existing[idx], ...patch };
      const updatedExtended = { ...record.extendedDetails, previousEmployments: existing };
      const nextRecord = { ...record, extendedDetails: updatedExtended };
      const exp = calculateEmployeeTotalExperience(nextRecord);
      nextRecord.PreviousExperience = exp.previousExperienceText;
      nextRecord.CurrentExperience = exp.currentExperienceText;
      nextRecord.TotalExperience = exp.totalExperienceText;
      nextRecord.PreviousExperienceMonths = exp.previousExperienceMonths;
      nextRecord.CurrentExperienceMonths = exp.currentExperienceMonths;
      nextRecord.TotalExperienceMonths = exp.totalExperienceMonths;
      nextRecord.PreviousEmployment = formatPreviousEmploymentsList(existing, nextRecord.PreviousEmployment);
      onUpdateRecord(nextRecord);
    }
  };

  const handleDeletePreviousJob = (idx: number) => {
    const existing = [...(record.extendedDetails?.previousEmployments || [])];
    existing.splice(idx, 1);
    const updatedExtended = { ...record.extendedDetails, previousEmployments: existing };
    const nextRecord = { ...record, extendedDetails: updatedExtended };
    const exp = calculateEmployeeTotalExperience(nextRecord);
    nextRecord.PreviousExperience = exp.previousExperienceText;
    nextRecord.CurrentExperience = exp.currentExperienceText;
    nextRecord.TotalExperience = exp.totalExperienceText;
    nextRecord.PreviousExperienceMonths = exp.previousExperienceMonths;
    nextRecord.CurrentExperienceMonths = exp.currentExperienceMonths;
    nextRecord.TotalExperienceMonths = exp.totalExperienceMonths;
    nextRecord.PreviousEmployment = formatPreviousEmploymentsList(existing, nextRecord.PreviousEmployment);
    onUpdateRecord(nextRecord);
  };

  // Helper to highlight missing/required master fields
  const renderFieldInput = (
    label: string,
    field: keyof MasterEmployeeRecord,
    placeholder: string = '',
    required: boolean = false,
    readOnly: boolean = false,
    helperText?: string,
    accentColor?: 'blue' | 'purple' | 'emerald'
  ) => {
    const val = String(record[field] || '');
    const isMissing = required && (!val || val === '-' || val.trim() === '');

    let borderStyles = 'border-slate-300 bg-white text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20';
    if (isMissing) {
      borderStyles = 'border-amber-300 bg-amber-50/40 text-amber-900 focus:ring-2 focus:ring-amber-500/20';
    }

    return (
      <div>
        <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
          <span>{label}</span>
          {isMissing ? (
            <span className="inline-flex items-center text-[10px] text-amber-600 font-semibold">
              <AlertTriangle className="w-3 h-3 mr-0.5" /> Missing
            </span>
          ) : (
            <span className="text-[10px] text-emerald-600 font-medium">Mapped</span>
          )}
        </label>
        <input
          type="text"
          value={val}
          onChange={(e) => handleChange(field, e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`w-full px-3 py-1.5 text-xs rounded-lg border transition-all ${borderStyles}`}
        />
        {helperText && (
          <p className="text-[10px] text-slate-500 mt-0.5 font-normal">{helperText}</p>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[700px]">
      {/* Tab Selector */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 pt-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('master')}
            className={`inline-flex items-center px-3.5 py-2 text-xs font-bold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
              activeTab === 'master'
                ? 'bg-white text-emerald-800 border-emerald-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            Master Excel Format (38 Fields)
          </button>

          <button
            onClick={() => setActiveTab('personal')}
            className={`inline-flex items-center px-3.5 py-2 text-xs font-bold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
              activeTab === 'personal'
                ? 'bg-white text-emerald-800 border-emerald-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
            }`}
          >
            <User className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Personal & Address
          </button>

          <button
            onClick={() => setActiveTab('family')}
            className={`inline-flex items-center px-3.5 py-2 text-xs font-bold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
              activeTab === 'family'
                ? 'bg-white text-emerald-800 border-emerald-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Family & Dependents
          </button>

          <button
            onClick={() => setActiveTab('employment')}
            className={`inline-flex items-center px-3.5 py-2 text-xs font-bold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
              activeTab === 'employment'
                ? 'bg-white text-emerald-800 border-emerald-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Qualification & Job
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 p-5 overflow-auto space-y-5">
        {/* TAB 1: MASTER EXCEL FORMAT ALL 38 FIELDS */}
        {activeTab === 'master' && (
          <div className="space-y-4">
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900 flex items-start justify-between gap-3">
              <div>
                <span className="font-bold">Master Format Column Mapping:</span> All 38 master fields are bound with real-time two-way synchronization. PRB_DT and CONF_DT update automatically as you adjust dates or designation.
              </div>
              <span className="bg-emerald-800 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shrink-0">
                38 / 38 Mapped
              </span>
            </div>

            {/* Grid of 38 fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Company</label>
                <select
                  value={record.COMPANY || ''}
                  onChange={(e) => handleChange('COMPANY', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Unknown / Select</option>
                  <option value="KF">KF Bioplants</option>
                  <option value="FUTURA">Futura</option>
                </select>
              </div>
              {renderFieldInput('1. NAME', 'NAME', 'Employee Full Name', true)}
              {renderFieldInput('2. BIRTH_DT', 'BIRTH_DT', 'DD/MM/YYYY', true)}
              {renderFieldInput('3. Gender', 'Gender', 'M / F', true)}
              {renderFieldInput('4. Marital Status', 'MaritalStatus', 'SINGLE / MARRIED')}
              {renderFieldInput('5. DESIG', 'DESIG', 'Designation / Position', false, false, 'Sets Probation Period bucket')}
              {renderFieldInput('Designation Code', 'DESIG_CODE', 'KF Code', false, true)}
              {renderFieldInput('F_Designation Code', 'F_DESIG_CODE', 'Futura Code', false, true)}
              {renderFieldInput('6. JOIN_DT', 'JOIN_DT', 'DD/MM/YYYY', false, false, 'Triggers Probation Date calculation')}
              {renderFieldInput('7. PRB_DT (Probation Date)', 'PRB_DT', 'DD/MM/YYYY')}
              {renderFieldInput('8. CONF_DT (Confirmation Date)', 'CONF_DT', 'DD/MM/YYYY')}
              {renderFieldInput('9. DEPT_NAME', 'DEPT_NAME', 'Department / Function')}
              {renderFieldInput('Department Code', 'DEPT_CODE', 'KF Code', false, true)}
              {renderFieldInput('F_Department Code', 'F_DEPT_CODE', 'Futura Code', false, true)}
              {renderFieldInput('10. Lab Details / Section', 'LabDetails', 'Lab 01 / Lab 02 / Staff')}
              {renderFieldInput('Section Code', 'SECTION_CODE', 'KF Code', false, true)}
              {renderFieldInput('F_Section Code', 'F_SECTION_CODE', 'Futura Code', false, true)}
              {renderFieldInput('11. EPAN_NO', 'EPAN_NO', 'PAN Card Number')}
              {renderFieldInput('12. EMAILID', 'EMAILID', 'Email Address', true)}
              {renderFieldInput('13. Address 1 (Permanent)', 'Address1', 'Full Permanent Address', true)}
              {renderFieldInput('14. Address2 (Mailing)', 'Address2', 'Full Mailing Address')}
              {renderFieldInput('15. Pin 1', 'Pin1', 'PIN Code', true)}
              {renderFieldInput('16. Pin 2', 'Pin 2', 'PIN Code')}
              {renderFieldInput('17. ADHAR_NO', 'ADHAR_NO', 'Aadhaar Number')}
              {renderFieldInput('18. PF_UAN', 'PF_UAN', 'PF UAN Number')}
              {renderFieldInput('19. ESI Number', 'ESI_Number', 'ESI Number')}
              {renderFieldInput('20. EMP_Mobile Number', 'EMP_MobileNumber', '10-digit Mobile', true)}
              {renderFieldInput('21. Alternate_Mobile Number', 'Alternate_MobileNumber', 'Landline / Alt')}
              {renderFieldInput('22. Father Name', 'FatherName', "Father's Full Name")}
              {renderFieldInput('23. DOB (Father)', 'FatherDOB', 'DD/MM/YYYY')}
              {renderFieldInput('24. Mother Name', 'MotherName', "Mother's Full Name")}
              {renderFieldInput('25. DOB (Mother)', 'MotherDOB', 'DD/MM/YYYY')}
              {renderFieldInput('26. Spouse_Name', 'SpouseName', 'Spouse Name')}
              {renderFieldInput('27. DOB (Spouse)', 'SpouseDOB', 'DD/MM/YYYY')}
              {renderFieldInput('28. Child_1', 'Child1', 'Child 1 Name')}
              {renderFieldInput('29. DOB (Child 1)', 'Child1DOB', 'DD/MM/YYYY')}
              {renderFieldInput('30. Child_2', 'Child2', 'Child 2 Name')}
              {renderFieldInput('31. DOB (Child 2)', 'Child2DOB', 'DD/MM/YYYY')}
              {renderFieldInput('32. Qualification', 'Qualification', 'Degrees & Institutions')}
              {renderFieldInput('33. Previous Employement', 'PreviousEmployment', 'Previous Companies & Roles')}
              {renderFieldInput('34. Present Employement', 'PresentEmployment', 'Current Company Details')}
              {renderFieldInput('35. Reference Name', 'ReferenceName', 'Reference / Manager Name')}
            </div>
          </div>
        )}

        {/* TAB 2: PERSONAL & ADDRESS */}
        {activeTab === 'personal' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              Personal Identity & Address Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {renderFieldInput('Full Name', 'NAME', '', true)}
              {renderFieldInput('Date of Birth', 'BIRTH_DT', 'DD/MM/YYYY', true)}
              {renderFieldInput('Gender', 'Gender', 'M/F', true)}
              {renderFieldInput('Marital Status', 'MaritalStatus', '')}
              {renderFieldInput('Primary Mobile', 'EMP_MobileNumber', '', true)}
              {renderFieldInput('Alternate Mobile / Landline', 'Alternate_MobileNumber', '')}
              {renderFieldInput('Email Address', 'EMAILID', '', true)}
              {renderFieldInput('PAN Card Number', 'EPAN_NO', '')}
              {renderFieldInput('Aadhaar Number', 'ADHAR_NO', '')}
              {renderFieldInput('PF UAN Number', 'PF_UAN', '')}
              {renderFieldInput('ESI Number', 'ESI_Number', '')}
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Address Records
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-emerald-900 block">Permanent Address</span>
                  {renderFieldInput('Street / Landmark / District', 'Address1', '', true)}
                  {renderFieldInput('Permanent PIN Code', 'Pin1', '', true)}
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-800 block">Mailing / Present Address</span>
                  {renderFieldInput('Street / Landmark / District', 'Address2', '')}
                  {renderFieldInput('Mailing PIN Code', 'Pin 2', '')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FAMILY & DEPENDENTS */}
        {activeTab === 'family' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              Family Member Records & Dependents
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-900 block border-b pb-1">Father's Details</span>
                {renderFieldInput("Father's Name", 'FatherName')}
                {renderFieldInput("Father's Date of Birth", 'FatherDOB')}
              </div>

              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-900 block border-b pb-1">Mother's Details</span>
                {renderFieldInput("Mother's Name", 'MotherName')}
                {renderFieldInput("Mother's Date of Birth", 'MotherDOB')}
              </div>

              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-900 block border-b pb-1">Spouse Details</span>
                {renderFieldInput("Spouse Name", 'SpouseName')}
                {renderFieldInput("Spouse Date of Birth", 'SpouseDOB')}
              </div>

              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-900 block border-b pb-1">Children Details</span>
                {renderFieldInput('Child 1 Name', 'Child1')}
                {renderFieldInput('Child 1 Date of Birth', 'Child1DOB')}
                {renderFieldInput('Child 2 Name', 'Child2')}
                {renderFieldInput('Child 2 Date of Birth', 'Child2DOB')}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: QUALIFICATIONS & EMPLOYMENT */}
        {activeTab === 'employment' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                Academic Qualifications & Work Experience
              </h3>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Experience Counted Till Today ({new Date().toLocaleDateString('en-GB')})
              </span>
            </div>

            {/* EXPERIENCE SUMMARY STATS CARDS */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-xl shadow-md border border-slate-700 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-wide uppercase">
                      Total Experience Calculation Engine
                    </h4>
                    <p className="text-[11px] text-slate-300">
                      Previous Job Durations + Current Job Duration (From Joining Date till Today)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleForceRecalculate}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${justRecalculated ? 'animate-spin' : ''}`} />
                    {justRecalculated ? 'Recalculated!' : 'Recalculate Experience'}
                  </button>
                </div>
              </div>

              {/* Total Experience Highlight Card */}
              <div className="bg-emerald-950/70 p-4 rounded-lg border border-emerald-700/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Total Work Experience
                    </span>
                    <div className="text-2xl font-black text-emerald-200">
                      {record.TotalExperience || experienceDetails.totalExperienceText || '0 Mos (Fresher)'}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-emerald-300/80 bg-emerald-900/40 px-3 py-1.5 rounded-lg border border-emerald-700/40">
                  Calculated from previous job timeline + present job till today
                </div>
              </div>

              {/* Explanatory Formula Banner */}
              <div className="p-2.5 bg-slate-800/90 rounded-lg border border-slate-700 text-[11px] text-slate-300 flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Excel Integration Active:</strong> When exporting to Excel, <span className="text-emerald-300 font-semibold">Total Experience</span> is placed directly beside <span className="text-white font-medium">Present Employement</span>.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {renderFieldInput('Designation', 'DESIG', 'e.g. Trainee Executive')}
              {renderFieldInput('Joining Date', 'JOIN_DT', 'DD/MM/YYYY')}
              {renderFieldInput('Probation Date (PRB_DT)', 'PRB_DT', 'DD/MM/YYYY')}
              {renderFieldInput('Confirmation Date (CONF_DT)', 'CONF_DT', 'DD/MM/YYYY')}
              {renderFieldInput('Department', 'DEPT_NAME', 'e.g. HR & Admin')}
              {renderFieldInput('Lab Details', 'LabDetails', 'Staff / Lab 01')}
              {renderFieldInput('Reference Name', 'ReferenceName', 'Manager / Reference')}
              {renderFieldInput('Total Exp', 'TotalExperience', 'e.g. 7 Yrs 2 Mos')}
            </div>

            {/* PREVIOUS EMPLOYMENT ITEM LIST (EXTENDED) */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-700" />
                  <h4 className="text-xs font-bold text-slate-800">
                    Individual Previous Employment Records ({record.extendedDetails?.previousEmployments?.length || 0})
                  </h4>
                </div>
                <button
                  onClick={handleAddPreviousJob}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Job
                </button>
              </div>

              {(record.extendedDetails?.previousEmployments || []).length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">
                  No structured previous employment items logged. Enter summary in Field 33 below or click "Add Job" to add specific date ranges.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {record.extendedDetails?.previousEmployments?.map((job, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 items-center">
                      <div className="lg:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500">Company / Organization</label>
                        <input
                          type="text"
                          value={job.organizationName || ''}
                          onChange={e => handleUpdatePreviousJob(idx, { organizationName: e.target.value })}
                          className="w-full px-2 py-1 text-xs rounded border border-slate-300 font-medium text-slate-900"
                          placeholder="e.g. Acme Corp"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500">From Date</label>
                        <input
                          type="text"
                          value={job.fromDate || ''}
                          onChange={e => handleUpdatePreviousJob(idx, { fromDate: e.target.value })}
                          className="w-full px-2 py-1 text-xs rounded border border-slate-300 font-medium text-slate-900"
                          placeholder="DD/MM/YYYY or YYYY"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500">To Date</label>
                        <input
                          type="text"
                          value={job.toDate || ''}
                          onChange={e => handleUpdatePreviousJob(idx, { toDate: e.target.value })}
                          className="w-full px-2 py-1 text-xs rounded border border-slate-300 font-medium text-slate-900"
                          placeholder="DD/MM/YYYY or YYYY"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-slate-500">Designation / Role</label>
                          <input
                            type="text"
                            value={job.lastDesignation || ''}
                            onChange={e => handleUpdatePreviousJob(idx, { lastDesignation: e.target.value })}
                            className="w-full px-2 py-1 text-xs rounded border border-slate-300 font-medium text-slate-900"
                            placeholder="e.g. Associate"
                          />
                        </div>
                        <button
                          onClick={() => handleDeletePreviousJob(idx)}
                          className="p-1.5 mt-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                          title="Delete Job"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Academic Qualification Summary (Master Field 32)
                </label>
                <textarea
                  rows={2}
                  value={record.Qualification}
                  onChange={(e) => handleChange('Qualification', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Previous Employment Summary (Master Field 33)
                </label>
                <textarea
                  rows={2}
                  value={record.PreviousEmployment}
                  onChange={(e) => handleChange('PreviousEmployment', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Present Employment Summary (Master Field 34)
                </label>
                <textarea
                  rows={2}
                  value={record.PresentEmployment}
                  onChange={(e) => handleChange('PresentEmployment', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Master Probation Rules Reference Table */}
      {showRulesModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Table className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm">Official Master Probation & Confirmation Rules Table</h3>
                  <p className="text-[11px] text-slate-300">Designation lookup rules for PRB_DT & CONF_DT</p>
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
                  Calculation Logic Overview:
                </div>
                <div>• <strong>Step A & B:</strong> System checks candidate Designation against the 3 buckets below.</div>
                <div>• <strong>Step C (PRB_DT):</strong> <code>PRB_DT = JOIN_DT + Probation Duration (3 Months, 6 Months, or 1 Year)</code></div>
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
                    <tr 
                      key={r.designationDesc} 
                      className={`hover:bg-slate-50 ${
                        calculationDetails.ruleMatch?.canonicalName === r.designationDesc ? 'bg-emerald-100/70 font-semibold' : ''
                      }`}
                    >
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
