export interface MasterEmployeeRecord {
  id: string;
  fileName: string;
  uploadedAt: string;
  confidenceScore: number; // 0 - 100
  previewImages?: string[]; // base64 or object URLs for pages

  COMPANY?: 'KF' | 'FUTURA' | '';
  DESIG_CODE?: string;
  F_DESIG_CODE?: string;
  DEPT_CODE?: string;
  F_DEPT_CODE?: string;
  SECTION_CODE?: string;
  F_SECTION_CODE?: string;
  codeMappingStatus?: 'MAPPED' | 'REVIEW_REQUIRED';

  // The Master Excel Columns
  NAME: string;                     // 1. NAME
  BIRTH_DT: string;                 // 2. BIRTH_DT (DD/MM/YYYY)
  Gender: string;                   // 3. Gender (M/F)
  MaritalStatus: string;            // 4. Marital Status
  DESIG: string;                    // 5. DESIG
  JOIN_DT: string;                  // 6. JOIN_DT
  PRB_DT: string;                   // 7. PRB_DT
  CONF_DT: string;                  // 8. CONF_DT
  DEPT_NAME: string;                // 9. DEPT_NAME
  LabDetails: string;               // 10. Lab Details
  EPAN_NO: string;                  // 11. EPAN_NO
  EMAILID: string;                  // 12. EMAILID
  Address1: string;                 // 13. Address 1 (Permanent)
  Address2: string;                 // 14. Address2 (Mailing)
  Pin1: string;                     // 15. Pin 1
  'Pin 2': string;                    // 16. Pin 2
  ADHAR_NO: string;                 // 17. ADHAR_NO
  PF_UAN: string;                   // 18. PF_UAN
  ESI_Number: string;               // 19. ESI Number
  EMP_MobileNumber: string;         // 20. EMP_Mobile Number
  Alternate_MobileNumber: string;   // 21. Alternate_Mobile Number
  FatherName: string;               // 22. Father Name
  FatherDOB: string;                // 23. DOB (Father)
  MotherName: string;               // 24. Mother Name
  MotherDOB: string;                // 25. DOB (Mother)
  SpouseName: string;               // 26. Spouse_Name
  SpouseDOB: string;                // 27. DOB (Spouse)
  Child1: string;                   // 28. Child_1
  Child1DOB: string;                // 29. DOB (Child 1)
  Child2: string;                   // 30. Child_2
  Child2DOB: string;                // 31. DOB (Child 2)
  Qualification: string;            // 32. Qualification
  PreviousEmployment: string;       // 33. Previous  Employement
  PresentEmployment: string;        // 34. Present Employement
  PreviousExperience?: string;      // Calculated: e.g. "3 Yrs 8 Mos"
  CurrentExperience?: string;       // Calculated: e.g. "3 Yrs 6 Mos" (From start date till today)
  TotalExperience?: string;         // Calculated: e.g. "7 Yrs 2 Mos" (Previous + Current)
  PreviousExperienceMonths?: number;
  CurrentExperienceMonths?: number;
  TotalExperienceMonths?: number;
  ReferenceName: string;            // 35. Reference Name

  // Additional Detailed Extracted Fields from Scanned Form
  extendedDetails?: ExtendedDetails;
}

export interface ExtendedDetails {
  lastName?: string;
  firstName?: string;
  middleInitial?: string;
  placeOfBirth?: string;
  age?: string;
  nationality?: string;
  religion?: string;
  category?: string;
  domicileState?: string;
  bloodGroup?: string;
  heightFt?: string;
  weightKg?: string;
  identificationMarks?: string;
  majorAreaOfExperience?: string;
  organizationChart?: string;
  ctcGrossPerAnnum?: string;
  expectedSalary?: string;
  joiningAvailability?: string;
  academics?: AcademicQualification[];
  familyMembers?: FamilyMemberDetail[];
  previousEmployments?: PreviousJob[];
  languages?: LanguageProficiency[];
}

export interface AcademicQualification {
  level: string;
  courseName: string;
  institute: string;
  boardUniversity: string;
  cityState: string;
  passYear: string;
  percentageOrCgpa: string;
}

export interface FamilyMemberDetail {
  relationship: string;
  name: string;
  dob: string;
  occupation: string;
  dependent: string;
}

export interface PreviousJob {
  organizationName: string;
  duration?: string;
  fromDate?: string;
  toDate?: string;
  lastDesignation?: string;
  emoluments?: string;
  industry?: string;
  reasonForLeaving?: string;
  calculatedMonths?: number;
  calculatedExp?: string;
}

export interface LanguageProficiency {
  language: string;
  read: boolean;
  write: boolean;
  speak: boolean;
}

export interface FieldExtractionResult {
  value: string;
  confidence: number; // 0 - 100
  locationPage?: number;
}