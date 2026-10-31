import { MasterEmployeeRecord } from '../types';

export const SAMPLE_EMPLOYEE_RECORD: MasterEmployeeRecord = {
  id: 'rec_sample_abhimanyu_001',
  fileName: 'KF_Bioplants_Personal_Data_Form_Abhimanyu_Nair.pdf',
  uploadedAt: new Date().toISOString(),
  confidenceScore: 98.4,
  COMPANY: 'KF',
  DESIG_CODE: '57',
  F_DESIG_CODE: '06',
  DEPT_CODE: '24',
  F_DEPT_CODE: '21',
  SECTION_CODE: '05',
  F_SECTION_CODE: '04',
  codeMappingStatus: 'MAPPED',
  previewImages: [
    '/sample_page1.png',
    '/sample_page2.png',
    '/sample_page3.png'
  ],

  // Exact 35 Master Format Fields (3 Months Bucket Example)
  NAME: 'ABHIMANYU NAIR',
  BIRTH_DT: '25/09/1999',
  Gender: 'M',
  MaritalStatus: 'SINGLE',
  DESIG: 'Trainee Executive',
  JOIN_DT: '01/02/2023',
  PRB_DT: '01/05/2023', // Step C: JOIN_DT (01/02/2023) + 3 Months
  CONF_DT: '01/11/2023', // Step D: PRB_DT (01/05/2023) + 6 Months
  DEPT_NAME: 'HR & Admin',
  LabDetails: 'Staff',
  EPAN_NO: 'ABCDE1234F',
  EMAILID: 'abhimanyunair25@gmail.com',
  Address1: 'B-5, 32, UJWAL PARK, NIBM ROAD, KAUSAR BAUGH, KONDHWA, PUNE, MAHARASHTRA, INDIA',
  Address2: 'B-5, 32, UJWAL PARK, NIBM ROAD, KAUSAR BAUGH, KONDHWA, PUNE, MH, INDIA',
  Pin1: '411048',
  'Pin 2': '411048',
  ADHAR_NO: '9876 5432 1098',
  PF_UAN: '100987654321',
  ESI_Number: '31234567890',
  EMP_MobileNumber: '8075187727',
  Alternate_MobileNumber: '-',
  FatherName: 'SREEKANDAM NAIR',
  FatherDOB: '25/04/1964',
  MotherName: 'USHADEVI NAIR',
  MotherDOB: '10/03/1973',
  SpouseName: '-',
  SpouseDOB: '-',
  Child1: '-',
  Child1DOB: '-',
  Child2: '-',
  Child2DOB: '-',
  Qualification: '• X STD - Secondary School (SABARI CENTRAL / CBSE) [2015, 8.4 CGPA]\n• XII STD - Higher Secondary (DUHSS THOOTHA / STATE BOARD) [2017, 85%]\n• Graduation: BACHELORS IN HOSPITALITY MANAGEMENT (UEI GLOBAL / BHARATHIAR) [2021, 70%]\n• Post Graduation: MASTERS IN HUMAN RESOURCE MANAGEMENT (Pt. D.Y. PATIL / DEEMED UNIV) [2025, 8.71 CGPA]',
  PreviousEmployment: '• AUSTIN 40 CAFEHOUSE - TEAM LEADER (01/04/2019 to 31/11/2022) [Salary: 15,000 / 18,000, Industry: HOSPITALITY, Reason: COVID]',
  PresentEmployment: '• KF BIOPLANTS PVT. LTD. - TRAINEE EXECUTIVE (Joining: 01/02/2023, Reporting: ARCHANA NAR - ASST MANAGER)',
  PreviousExperience: '3 Yrs 8 Mos',
  CurrentExperience: '3 Yrs 7 Mos',
  TotalExperience: '7 Yrs 3 Mos',
  PreviousExperienceMonths: 44,
  CurrentExperienceMonths: 43,
  TotalExperienceMonths: 87,
  ReferenceName: 'ARCHANA NAR (ASST MANAGER)',

  extendedDetails: {
    lastName: 'NAIR',
    firstName: 'ABHIMANYU',
    middleInitial: '',
    placeOfBirth: 'Pune, MH',
    age: '25',
    nationality: 'INDIAN',
    religion: 'HINDU',
    category: 'Gen',
    domicileState: 'KERALA',
    bloodGroup: 'O+ve',
    heightFt: '5.7 FT',
    weightKg: '73 KG',
    identificationMarks: 'BIRTH MARK ON NECK',
    majorAreaOfExperience: 'HUMAN RESOURCE / PMS / APPRAISAL',
    organizationChart: 'HR-HEAD -> ASST. MANAGER -> EXECUTIVE -> ASSOCIATE -> TRAINEE',
    ctcGrossPerAnnum: 'Rs. 3,80,000 / ANNUM',
    expectedSalary: 'AS PER COMPANY NORMS',
    joiningAvailability: 'IMMEDIATE JOINER',

    academics: [
      {
        level: 'X STD',
        courseName: 'Secondary School',
        institute: 'SABARI CENTRAL',
        boardUniversity: 'CBSE',
        cityState: 'KERALA, INDIA',
        passYear: '2015',
        percentageOrCgpa: '8.4 CGPA'
      },
      {
        level: 'XII STD',
        courseName: 'Higher Secondary',
        institute: 'DUHSS THOOTHA',
        boardUniversity: 'STATE BOARD',
        cityState: 'KERALA, INDIA',
        passYear: '2017',
        percentageOrCgpa: '85%'
      },
      {
        level: 'Graduation',
        courseName: 'BACHELORS IN HOSPITALITY MANAGEMENT',
        institute: 'UEI GLOBAL',
        boardUniversity: 'BHARATHIAR',
        cityState: 'PUNE, MH, INDIA',
        passYear: '2021',
        percentageOrCgpa: '70%'
      },
      {
        level: 'Post Graduation',
        courseName: 'MASTERS IN HUMAN RESOURCE MANAGEMENT',
        institute: 'Pt. D.Y. PATIL',
        boardUniversity: 'DEEMED UNIV',
        cityState: 'PUNE, MH, INDIA',
        passYear: '2025',
        percentageOrCgpa: '8.71 CGPA'
      }
    ],

    familyMembers: [
      {
        relationship: 'Father',
        name: 'SREEKANDAM NAIR',
        dob: '25/04/1964',
        occupation: '-',
        dependent: 'Y'
      },
      {
        relationship: 'Mother',
        name: 'USHADEVI NAIR',
        dob: '10/03/1973',
        occupation: '-',
        dependent: 'Y'
      },
      {
        relationship: 'Sister',
        name: 'LAKSHMI SREEKANDAM NAIR',
        dob: '21/05/1995',
        occupation: 'ACQUIA',
        dependent: 'N'
      },
      {
        relationship: 'Guardian',
        name: 'USHADEVI NAIR',
        dob: '10/03/1973',
        occupation: '-',
        dependent: 'Y'
      }
    ],

    previousEmployments: [
      {
        organizationName: 'AUSTIN 40 CAFEHOUSE',
        duration: '01/04/2019 to 31/11/2022',
        lastDesignation: 'TEAM LEADER',
        emoluments: '15,000 / 18,000',
        industry: 'HOSPITALITY',
        reasonForLeaving: 'COVID'
      }
    ],

    languages: [
      { language: 'ENGLISH', read: true, write: true, speak: true },
      { language: 'HINDI', read: true, write: true, speak: true },
      { language: 'MALAYALAM', read: true, write: true, speak: true },
      { language: 'MARATHI', read: false, write: false, speak: true }
    ]
  }
};

export const SAMPLE_EMPLOYEE_RECORD_2: MasterEmployeeRecord = {
  id: 'rec_sample_priya_002',
  fileName: 'KF_Bioplants_Personal_Data_Form_Priya_Sharma.pdf',
  uploadedAt: new Date().toISOString(),
  confidenceScore: 99.1,
  COMPANY: 'KF',
  DESIG_CODE: '52',
  F_DESIG_CODE: '07',
  DEPT_CODE: '39',
  F_DEPT_CODE: '07',
  SECTION_CODE: '03',
  F_SECTION_CODE: '01',
  codeMappingStatus: 'MAPPED',
  previewImages: [
    '/sample_page1.png',
    '/sample_page2.png',
    '/sample_page3.png'
  ],
  // Exact 35 Master Format Fields (6 Months Bucket Example)
  NAME: 'PRIYA RAMESH SHARMA',
  BIRTH_DT: '14/11/1996',
  Gender: 'F',
  MaritalStatus: 'MARRIED',
  DESIG: 'Trainee Supervisor',
  JOIN_DT: '15/03/2023',
  PRB_DT: '15/09/2023', // Step C: JOIN_DT (15/03/2023) + 6 Months
  CONF_DT: '15/03/2024', // Step D: PRB_DT (15/09/2023) + 6 Months
  DEPT_NAME: 'Production',
  LabDetails: 'Lab 01',
  EPAN_NO: 'PQRS5678K',
  EMAILID: 'priyasharma.biotech@gmail.com',
  Address1: 'Flat 402, Green Meadows, Magarpatta City, Hadapsar, Pune, Maharashtra',
  Address2: 'Flat 402, Green Meadows, Magarpatta City, Hadapsar, Pune, Maharashtra',
  Pin1: '411028',
  'Pin 2': '411028',
  ADHAR_NO: '4532 8901 2345',
  PF_UAN: '100458923412',
  ESI_Number: '31298451230',
  EMP_MobileNumber: '9822334455',
  Alternate_MobileNumber: '020-26890012',
  FatherName: 'RAMESH SHARMA',
  FatherDOB: '18/06/1960',
  MotherName: 'SARITA SHARMA',
  MotherDOB: '22/08/1965',
  SpouseName: 'AMIT JOSHI',
  SpouseDOB: '05/01/1994',
  Child1: 'AARAV JOSHI',
  Child1DOB: '12/10/2021',
  Child2: '-',
  Child2DOB: '-',
  Qualification: '• Graduation: B.Sc. Botany (Fergusson College / SPPU) [2017, 78%]\n• Post Graduation: M.Sc. Biotechnology (Dept of Biotech / SPPU) [2019, 82%]',
  PreviousEmployment: '• NATIONAL CHEMICAL LABORATORY (NCL) - PROJECT ASSISTANT (01/06/2020 to 28/02/2023) [Salary: 25,000 / mo, Industry: BIOTECH, Reason: CAREER GROWTH]',
  PresentEmployment: '• KF BIOPLANTS PVT. LTD. - TRAINEE SUPERVISOR (Reporting: DR. V. KULKARNI)',
  PreviousExperience: '3 Yrs',
  CurrentExperience: '3 Yrs 5 Mos',
  TotalExperience: '6 Yrs 5 Mos',
  PreviousExperienceMonths: 36,
  CurrentExperienceMonths: 41,
  TotalExperienceMonths: 77,
  ReferenceName: 'DR. VIJAY KULKARNI (VP BIOTECH)',
  extendedDetails: {
    lastName: 'SHARMA',
    firstName: 'PRIYA',
    middleInitial: 'R',
    placeOfBirth: 'Pune, MH',
    age: '29',
    nationality: 'INDIAN',
    religion: 'HINDU',
    category: 'Gen',
    domicileState: 'MAHARASHTRA',
    bloodGroup: 'B+ve',
    heightFt: '5.4 FT',
    weightKg: '58 KG',
    identificationMarks: 'MOLE ON RIGHT WRIST',
    majorAreaOfExperience: 'TISSUE CULTURE / STERILIZATION / ROOTING',
    organizationChart: 'VP BIOTECH -> PRINCIPAL SCIENTIST -> RESEARCH SCIENTIST',
    ctcGrossPerAnnum: 'Rs. 6,50,000 / ANNUM',
    expectedSalary: 'AS PER COMPANY STANDARDS',
    joiningAvailability: 'JOINED 15/03/2023',
    academics: [
      {
        level: 'Graduation',
        courseName: 'B.Sc Botany',
        institute: 'Fergusson College',
        boardUniversity: 'SPPU',
        cityState: 'Pune, MH',
        passYear: '2017',
        percentageOrCgpa: '78%'
      },
      {
        level: 'Post Graduation',
        courseName: 'M.Sc Biotechnology',
        institute: 'Dept of Biotech, SPPU',
        boardUniversity: 'SPPU',
        cityState: 'Pune, MH',
        passYear: '2019',
        percentageOrCgpa: '82%'
      }
    ],
    languages: [
      { language: 'ENGLISH', read: true, write: true, speak: true },
      { language: 'HINDI', read: true, write: true, speak: true },
      { language: 'MARATHI', read: true, write: true, speak: true }
    ]
  }
};

export const SAMPLE_EMPLOYEE_RECORD_3: MasterEmployeeRecord = {
  id: 'rec_sample_rahul_003',
  fileName: 'KF_Bioplants_Personal_Data_Form_Rahul_Deshmukh.pdf',
  uploadedAt: new Date().toISOString(),
  confidenceScore: 97.8,
  COMPANY: 'KF',
  DESIG_CODE: '71',
  F_DESIG_CODE: '16',
  DEPT_CODE: '45',
  F_DEPT_CODE: '18',
  SECTION_CODE: '05',
  F_SECTION_CODE: '04',
  codeMappingStatus: 'MAPPED',
  previewImages: [
    '/sample_page1.png',
    '/sample_page2.png',
    '/sample_page3.png'
  ],
  // Exact 35 Master Format Fields (1 Year Bucket Example)
  NAME: 'RAHUL SURESH DESHMUKH',
  BIRTH_DT: '03/05/1993',
  Gender: 'M',
  MaritalStatus: 'SINGLE',
  DESIG: 'Trainee Store Assistant',
  JOIN_DT: '10/01/2023',
  PRB_DT: '10/01/2024', // Step C: JOIN_DT (10/01/2023) + 1 Year (12 Months)
  CONF_DT: '10/07/2024', // Step D: PRB_DT (10/01/2024) + 6 Months
  DEPT_NAME: 'Stores',
  LabDetails: 'Staff',
  EPAN_NO: 'WXYZ9012L',
  EMAILID: 'rahul.deshmukh.scm@gmail.com',
  Address1: 'Row House 12, Nisarg Park, Sinhagad Road, Vadgaon BK, Pune, Maharashtra',
  Address2: 'Row House 12, Nisarg Park, Sinhagad Road, Vadgaon BK, Pune, Maharashtra',
  Pin1: '411051',
  'Pin 2': '411051',
  ADHAR_NO: '7612 3456 9081',
  PF_UAN: '100789012345',
  ESI_Number: '31278129034',
  EMP_MobileNumber: '9765432109',
  Alternate_MobileNumber: '-',
  FatherName: 'SURESH DESHMUKH',
  FatherDOB: '11/02/1961',
  MotherName: 'SUNITA DESHMUKH',
  MotherDOB: '04/09/1966',
  SpouseName: '-',
  SpouseDOB: '-',
  Child1: '-',
  Child1DOB: '-',
  Child2: '-',
  Child2DOB: '-',
  Qualification: '• Graduation: B.E. Mechanical (Pune University) [2015, 68%]\n• Post Graduation: MBA Operations & SCM (Sinhgad Institute / SPPU) [2018, 74%]',
  PreviousEmployment: '• MAHINDRA LOGISTICS - SENIOR ASSOCIATE (01/07/2018 to 31/12/2022) [Salary: 32,000 / mo, Industry: SUPPLY CHAIN, Reason: ADVANCEMENT]',
  PresentEmployment: '• KF BIOPLANTS PVT. LTD. - TRAINEE STORE ASSISTANT (Reporting: SANDEEP PATIL - SCM HEAD)',
  PreviousExperience: '4 Yrs',
  CurrentExperience: '3 Yrs 7 Mos',
  TotalExperience: '7 Yrs 7 Mos',
  PreviousExperienceMonths: 48,
  CurrentExperienceMonths: 43,
  TotalExperienceMonths: 91,
  ReferenceName: 'SANDEEP PATIL (HEAD OF SCM)',
  extendedDetails: {
    lastName: 'DESHMUKH',
    firstName: 'RAHUL',
    middleInitial: 'S',
    placeOfBirth: 'Satara, MH',
    age: '32',
    nationality: 'INDIAN',
    religion: 'HINDU',
    category: 'OBC',
    domicileState: 'MAHARASHTRA',
    bloodGroup: 'A+ve',
    heightFt: '5.9 FT',
    weightKg: '76 KG',
    identificationMarks: 'SCAR ON FOREHEAD',
    majorAreaOfExperience: 'SUPPLY CHAIN / EXPORTS / COLD CHAIN LOGISTICS',
    organizationChart: 'SCM HEAD -> SR. MANAGER -> EXECUTIVE -> OFFICER',
    ctcGrossPerAnnum: 'Rs. 5,20,000 / ANNUM',
    expectedSalary: 'AS PER OFFER',
    joiningAvailability: 'JOINED 10/01/2023',
    languages: [
      { language: 'ENGLISH', read: true, write: true, speak: true },
      { language: 'HINDI', read: true, write: true, speak: true },
      { language: 'MARATHI', read: true, write: true, speak: true }
    ]
  }
};

export const SAMPLE_EMPLOYEE_RECORDS: MasterEmployeeRecord[] = [
  SAMPLE_EMPLOYEE_RECORD,
  SAMPLE_EMPLOYEE_RECORD_2,
  SAMPLE_EMPLOYEE_RECORD_3
];
