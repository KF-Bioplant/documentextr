export type CompanyCode = 'KF' | 'FUTURA' | '';

export type CodeMap = Record<string, string>;

// ==========================================
// 1. KF BIOPLANTS MASTER CODES
// ==========================================

export const KF_DESIGNATION_CODES: CodeMap = {
  'AC Technician': '01',
  'Accountant': '02',
  'Area Manager': '03',
  'Assistant': '04',
  'Asst. Executive': '05',
  'Asst. Manager': '06',
  'Asst. Manager HR & Admin': '07',
  'Asst. Supervisor': '08',
  'Asst. Tech. Manager': '09',
  'Asst. Vice President': '10',
  'Casual': '11',
  'Cleaner': '12',
  'Computer Operator': '13',
  'Crop Manager': '14',
  'Driver': '15',
  'Dy. General Manager': '16',
  'Electrician': '17',
  'Exe. Secretary': '18',
  'Executive': '19',
  'Field Assistant': '20',
  'Finance Manager': '21',
  'General Manager': '22',
  'General Manager Marketing': '23',
  'GH-Manager': '24',
  'Jr.Manager': '25',
  'Manager': '26',
  'Marketing Cum Technical Execue': '27',
  'Office Boy': '28',
  'Operator': '29',
  'Plumber': '30',
  'Product Manager': '31',
  'Receptionist': '32',
  'Regional Manager': '33',
  'Sales Coordinator': '34',
  'Security': '35',
  'Sr. Executive': '36',
  'Sr. Manager': '37',
  'Sr. Marketing Cum Tech. Execue': '38',
  'Sr. Supervisor': '39',
  'Sr.Technical Executive': '40',
  'Supervisor': '41',
  'Trainee': '42',
  'Trainee Asst. Executive': '43',
  'Trainee Asst. Supervisor': '44',
  'Trainee Comp. Operator': '45',
  'Trainee Driver': '46',
  'Trainee Field Assistant': '47',
  'Trainee Instrument Engineer': '48',
  'Trainee Makt.cum Tech. execute': '49',
  'Trainee Marketing Executive': '50',
  'Trainee Office Boy': '51',
  'Trainee Supervisor': '52',
  'Vice President': '53',
  'Zonal Manager': '54',
  'HK-Officer': '55',
  'Instrumentation Engineer': '56',
  'Trainee Executive': '57',
  'Sr. General Manager': '58',
  'President': '59',
  'Trainee Sales Co-ordinator': '60',
  'Co-ordinator': '61',
  'Sr.Marketing Executive': '62',
  'Apprentice': '63',
  'Director': '64',
  'Breeder': '65',
  'Jr.Breeder': '66',
  'Secretary': '67',
  'Sr.Sales & Marketing Executive': '68',
  'Dy.Green House Manager': '69',
  'Technical Manager': '70',
  'Trainee Store Assistant': '71',
  'Executive Assistant': '72',
  'Sr.Executive Business Develop.': '73',
  'Sales Officer': '74',
  'Market Development Officer': '75',
  'Trainee Research Associate': '76',
  'Research Associate': '77',
  'Sr.Accountant': '78',
  'Sr.Sales Co-ordinator': '79',
  'Deputy Manager': '80'
};

export const KF_DEPARTMENT_CODES: CodeMap = {
  'Accounts': '01',
  'Admin': '02',
  'Admin HSK': '03',
  'BW': '04',
  'Calla GH': '05',
  'Cap-Wash': '06',
  'CN-GH': '07',
  'Contamination': '08',
  'Demo-GH': '09',
  'Initiation': '10',
  'Dispatch': '11',
  'Dress Wash': '12',
  'Embryo': '13',
  'Exim': '14',
  'Garden': '15',
  'GE-GH': '16',
  'GH-Organic Farming': '17',
  'GH -Plug Machine': '18',
  'GH/Mun-GH': '19',
  'GH-HSK': '20',
  'Green House': '21',
  'Gypso GH': '22',
  'House-keeping': '23',
  'HR & Admin': '24',
  'Hypol-Machine': '25',
  'IT': '26',
  'KF-BW': '27',
  'Lab-HSK': '28',
  'LAB-Sealing': '29',
  'Limonium GH': '30',
  'Maintenance': '31',
  'Marketing': '32',
  'MPR': '33',
  'MSR': '34',
  'Operations': '35',
  'PGR': '36',
  'PIR': '37',
  'Pots-GH': '38',
  'Production': '39',
  'R & D': '40',
  'Rose-GH': '41',
  'Security': '42',
  'Seed-GH': '43',
  'ST-GH': '44',
  'Stores': '45',
  'Pot Marketing': '46',
  'Veg.Seed / Seedlings': '47',
  'Pre-Dispatch & Quality': '48',
  'Caper-GH': '49',
  'Dendrobium': '50',
  'DH-PIR': '51',
  'PURCHASE': '52',
  'Media Dispensary Room': '53'
};

export const KF_SECTION_CODES: CodeMap = {
  'Lab 02': '01',
  'Lab 01': '03',
  'Staff': '05',
  'Support Staff': '06',
  'Lab 03': '08'
};

// ==========================================
// 2. FUTURA MASTER CODES
// ==========================================

export const FUTURA_DESIGNATION_CODES: CodeMap = {
  'Sr.Executive': '01',
  'Sr. Supervisor': '02',
  'Asst. Executive': '03',
  'Asst. Supervisor': '04',
  'Sr.Lab Manager': '05',
  'Executive': '06',
  'Supervisor': '07',
  'Operator': '08',
  'Trainee': '09',
  'Casual': '10',
  'Computer Operator': '11',
  'Apprentice': '12',
  'Director': '13',
  'Electrician': '14',
  'System Administrator': '15',
  'Assistant': '16',
  'Assistant Manager': '17',
  'Security': '18',
  'Company Secretary': '19',
  'Driver': '20',
  'Jr.Manager': '21',
  'HK-Officer': '22',
  'Sr. Manager': '23',
  'General Manager': '24',
  'Instrumentation Engineer': '25',
  'Manager': '26',
  'Security Officer': '27',
  'Associate': '28',
  'Plumber': '29',
  'Deputy General Manager': '30',
  'Coordinator': '31'
};

export const FUTURA_DEPARTMENT_CODES: CodeMap = {
  'MPR': '01',
  'PIR': '02',
  'PGR': '03',
  'LAB-HSK': '04',
  'Contamination': '05',
  'Dispatch': '06',
  'Production': '07',
  'HSK': '08',
  'MSR': '09',
  'MDR': '10',
  'BW': '11',
  'Quality': '12',
  'Operations': '13',
  'Admin': '14',
  'Maintenance': '15',
  'IT': '16',
  'Purchase': '17',
  'Store': '18',
  'Exim': '19',
  'Security': '20',
  'HR': '21',
  'Accounts': '22',
  'Dress Wash': '23',
  'R&D': '24',
  'Green House': '25'
};

export const FUTURA_SECTION_CODES: CodeMap = {
  'Lab 01': '01',
  'Lab 02': '02',
  'Staff': '04',
  'Lab 03': '05'
};

const normalize = (value: string | undefined | null): string =>
  String(value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[.\-_\/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// Spelling variants seen on forms, rewritten to one canonical form on both the
// form value and the master name, so "Sr Exec" and "Senior Executive" compare equal.
const CANONICAL_PHRASES: Array<[RegExp, string]> = [
  [/\bco ?ordinator\b/g, 'coordinator'],
  [/\bhouse ?keeping\b|\bhsk\b/g, 'housekeeping'],
  [/\bgreen ?house\b|\bgh\b/g, 'greenhouse'],
  [/\bbottle ?wash(ing)?\b/g, 'bw'],
  [/\bpre ?dispatch\b/g, 'predispatch'],
  [/\bhuman resources?\b/g, 'hr'],
  [/\bresearch and development\b|\br and d\b|\brnd\b/g, 'rd']
];
const CANONICAL_WORDS: Record<string, string> = {
  asst: 'assistant', ast: 'assistant',
  sr: 'senior', snr: 'senior',
  jr: 'junior',
  dy: 'deputy', dep: 'deputy', dept: 'deputy',
  exe: 'executive', exec: 'executive', execue: 'executive', execute: 'executive',
  mgr: 'manager',
  comp: 'computer',
  tech: 'technical',
  makt: 'marketing', mkt: 'marketing',
  develop: 'development',
  administrator: 'admin', administration: 'admin',
  engg: 'engineer'
};

function canonical(value: string | undefined | null): string {
  let text = normalize(value);
  for (const [pattern, repl] of CANONICAL_PHRASES) text = text.replace(pattern, repl);
  return text
    .split(' ')
    .filter(Boolean)
    .map((w) => {
      const word = CANONICAL_WORDS[w] ?? w;
      // Plural forms ("Stores", "Accounts", "Operations") match their singular
      return word.length > 3 && word.endsWith('s') && !word.endsWith('ss') ? word.slice(0, -1) : word;
    })
    .join(' ');
}

const containsWords = (text: string, phrase: string): boolean => ` ${text} `.includes(` ${phrase} `);

export function detectCompany(value?: string, fileName?: string): CompanyCode {
  const text = `${value || ''} ${fileName || ''}`.toLowerCase();
  const isFutura = /futura/.test(text);
  const isKf = /\bkf\b|kf\s*bioplants?|kfbioplants?|kf\s*bio/.test(text);
  // Both companies mentioned is ambiguous, so leave the company blank.
  if (isFutura && isKf) return '';
  if (isFutura) return 'FUTURA';
  if (isKf) return 'KF';
  return '';
}

export function getCode(map: CodeMap, value?: string): string {
  const key = canonical(value);
  if (!key) return '-';
  const names = Object.entries(map).map(([name, code]) => [canonical(name), code] as const);

  const exact = names.find(([name]) => name === key);
  if (exact) return exact[1];

  // Master names written inside the form value: the longest (most specific) wins,
  // so "Senior Executive" maps to Sr. Executive rather than Executive.
  const contained = names.filter(([name]) => containsWords(key, name));
  if (contained.length) {
    return contained.reduce((best, item) => (item[0].length > best[0].length ? item : best))[1];
  }

  // Form value is a shortened master name ("Media Dispensary"): only when unambiguous
  const containing = new Set(names.filter(([name]) => containsWords(name, key)).map(([, code]) => code));
  if (containing.size === 1) return [...containing][0];

  return '-';
}

export function getFuturaDesignationCode(designation?: string): string {
  const norm = normalize(designation);
  if (!norm) return '-';

  const direct = getCode(FUTURA_DESIGNATION_CODES, designation);
  if (direct !== '-') return direct;

  // Futura specific aliases
  if (/sr\s*lab\s*manager|senior\s*lab\s*manager/.test(norm)) return '05';
  if (/sys\s*admin|system\s*admin|system\s*administrator/.test(norm)) return '15';
  if (/asst\s*manager|assistant\s*manager/.test(norm)) return '17';
  if (/company\s*sec|company\s*secretary/.test(norm)) return '19';
  if (/jr\s*manager|junior\s*manager/.test(norm)) return '21';
  if (/hk\s*officer|housekeeping\s*officer|house\s*keeping\s*officer/.test(norm)) return '22';
  if (/sr\s*manager|senior\s*manager/.test(norm)) return '23';
  if (/gen\s*manager|general\s*manager|\bgm\b/.test(norm)) return '24';
  if (/instrument|instrumentation\s*engineer/.test(norm)) return '25';
  if (/sec\s*officer|security\s*officer/.test(norm)) return '27';
  if (/dy\s*gen|deputy\s*gen|deputy\s*general\s*manager|\bdgm\b/.test(norm)) return '30';
  if (/coord|co-ordinator|coordinator|sales\s*coord/.test(norm)) return '31';
  if (/asst\s*exec|assistant\s*exec|trainee\s*asst\s*exec/.test(norm)) return '03';
  if (/asst\s*sup|assistant\s*sup|trainee\s*asst\s*sup/.test(norm)) return '04';
  if (/sr\s*exec|senior\s*exec/.test(norm)) return '01';
  if (/sr\s*sup|senior\s*sup/.test(norm)) return '02';
  if (/comp\s*op|computer\s*operator/.test(norm)) return '11';
  if (/apprentice/.test(norm)) return '12';
  if (/director/.test(norm)) return '13';
  if (/electrician|electric/.test(norm)) return '14';
  if (/assistant|asst\b/.test(norm) && !/manager|executive|supervisor/.test(norm)) return '16';
  if (/security\b/.test(norm) && !/officer/.test(norm)) return '18';
  if (/driver/.test(norm)) return '20';
  if (/manager\b/.test(norm) && !/asst|sr|gen|dy|jr|lab/.test(norm)) return '26';
  if (/associate|research\s*associate/.test(norm)) return '28';
  if (/plumber/.test(norm)) return '29';
  if (/casual/.test(norm)) return '10';
  if (/operator/.test(norm)) return '08';
  if (/supervisor|sup\b/.test(norm)) return '07';
  if (/executive|exec\b/.test(norm)) return '06';
  if (/trainee/.test(norm)) return '09';

  return '-';
}

export function getKFDesignationCode(designation?: string): string {
  const norm = normalize(designation);
  if (!norm) return '-';

  // KF BIOPLANTS Matching
  const direct = getCode(KF_DESIGNATION_CODES, designation);
  if (direct !== '-') return direct;

  // Specific common variations & abbreviations for KF
  if (/asst\s*manager\s*hr|assistant\s*manager\s*hr|hr\s*and\s*admin\s*asst\s*manager/i.test(norm)) return '07';
  if (/asst\s*tech\s*manager|assistant\s*technical\s*manager/i.test(norm)) return '09';
  if (/asst\s*vice\s*president|assistant\s*vp|avp/i.test(norm)) return '10';
  if (/dy\s*general\s*manager|deputy\s*general\s*manager|dgm/i.test(norm)) return '16';
  if (/general\s*manager\s*marketing|gm\s*marketing/i.test(norm)) return '23';
  if (/gh\s*manager|green\s*house\s*manager/i.test(norm)) return '24';
  if (/jr\s*manager|junior\s*manager/i.test(norm)) return '25';
  if (/marketing\s*cum\s*tech/i.test(norm) && /sr/i.test(norm)) return '38';
  if (/trainee\s*makt\s*cum|trainee\s*marketing\s*cum\s*tech/i.test(norm)) return '49';
  if (/marketing\s*cum\s*tech/i.test(norm)) return '27';
  if (/sr\s*tech\s*exec|senior\s*technical\s*executive/i.test(norm)) return '40';
  if (/trainee\s*asst\s*exec|trainee\s*assistant\s*executive/i.test(norm)) return '43';
  if (/trainee\s*asst\s*sup|trainee\s*assistant\s*supervisor/i.test(norm)) return '44';
  if (/trainee\s*comp\s*op|trainee\s*computer\s*operator/i.test(norm)) return '45';
  if (/trainee\s*driver/i.test(norm)) return '46';
  if (/trainee\s*field\s*asst|trainee\s*field\s*assistant/i.test(norm)) return '47';
  if (/trainee\s*instrument\s*eng/i.test(norm)) return '48';
  if (/trainee\s*marketing\s*exec/i.test(norm)) return '50';
  if (/trainee\s*office\s*boy/i.test(norm)) return '51';
  if (/trainee\s*supervisor/i.test(norm)) return '52';
  if (/trainee\s*executive/i.test(norm)) return '57';
  if (/trainee\s*sales\s*coord/i.test(norm)) return '60';
  if (/trainee\s*store\s*asst|trainee\s*store\s*assistant|store\s*assistant/i.test(norm)) return '71';
  if (/trainee\s*research\s*assoc/i.test(norm)) return '76';
  if (/research\s*associate/i.test(norm)) return '77';
  if (/hk\s*officer|housekeeping\s*officer/i.test(norm)) return '55';
  if (/instrumentation\s*engineer|instrument\s*engineer/i.test(norm)) return '56';
  if (/sr\s*general\s*manager|senior\s*general\s*manager/i.test(norm)) return '58';
  if (/sr\s*marketing\s*exec/i.test(norm)) return '62';
  if (/jr\s*breeder/i.test(norm)) return '66';
  if (/breeder/i.test(norm)) return '65';
  if (/sr\s*sales\s*and\s*marketing|sr\s*sales\s*marketing/i.test(norm)) return '68';
  if (/dy\s*green\s*house\s*manager|deputy\s*gh\s*manager/i.test(norm)) return '69';
  if (/technical\s*manager/i.test(norm)) return '70';
  if (/sr\s*exec\s*business\s*dev|business\s*development/i.test(norm)) return '73';
  if (/market\s*development\s*officer|mdo/i.test(norm)) return '75';
  if (/sr\s*accountant/i.test(norm)) return '78';
  if (/sr\s*sales\s*coord/i.test(norm)) return '79';
  if (/deputy\s*manager|dy\s*manager/i.test(norm)) return '80';
  if (/asst\s*manager|assistant\s*manager/i.test(norm)) return '06';
  if (/asst\s*exec|assistant\s*executive/i.test(norm)) return '05';
  if (/asst\s*sup|assistant\s*supervisor/i.test(norm)) return '08';
  if (/sr\s*exec|senior\s*executive/i.test(norm)) return '36';
  if (/sr\s*manager|senior\s*manager/i.test(norm)) return '37';
  if (/sr\s*sup|senior\s*supervisor/i.test(norm)) return '39';
  if (/\bgm\b|gen\s*manager/i.test(norm)) return '22';

  return '-';
}

export function getDesignationCode(company: CompanyCode, designation?: string): string {
  if (company === 'FUTURA') {
    return getFuturaDesignationCode(designation);
  }
  const kfCode = getKFDesignationCode(designation);
  if (kfCode !== '-') return kfCode;
  if (!company) {
    return getFuturaDesignationCode(designation);
  }
  return '-';
}

export function getFuturaDepartmentCode(department?: string): string {
  const norm = normalize(department);
  if (!norm) return '-';

  // Futura has a plain HR department, so "HR & Admin" belongs to HR, not Admin
  if (/\bhr\b|human\s*res/.test(norm)) return '21';

  const direct = getCode(FUTURA_DEPARTMENT_CODES, department);
  if (direct !== '-') return direct;

  if (/mpr/.test(norm)) return '01';
  if (/pir|dh\s*pir/.test(norm)) return '02';
  if (/pgr/.test(norm)) return '03';
  if (/lab\s*hsk/.test(norm)) return '04';
  if (/contam|contamination/.test(norm)) return '05';
  if (/dispatch|pre\s*dispatch/.test(norm)) return '06';
  if (/production|prod/.test(norm)) return '07';
  if (/hsk|house\s*keeping|housekeeping/.test(norm)) return '08';
  if (/msr/.test(norm)) return '09';
  if (/mdr|media\s*disp|media\s*dispensary/.test(norm)) return '10';
  if (/bw|bottle\s*wash|kf\s*bw/.test(norm)) return '11';
  if (/quality|qa|qc/.test(norm)) return '12';
  if (/operation|operations|ops/.test(norm)) return '13';
  if (/admin\s*hsk/.test(norm)) return '14';
  if (/admin/.test(norm) && !/hr/.test(norm)) return '14';
  if (/maint|maintenance/.test(norm)) return '15';
  if (/\bit\b|infotech|information\s*tech/.test(norm)) return '16';
  if (/purchase/.test(norm)) return '17';
  if (/store|stores/.test(norm)) return '18';
  if (/exim|export/.test(norm)) return '19';
  if (/sec|security/.test(norm)) return '20';
  if (/hr|human\s*res|hr\s*and\s*admin|hr\s*admin/.test(norm)) return '21';
  if (/acc|account|accounts|finance/.test(norm)) return '22';
  if (/dress\s*wash|cap\s*wash/.test(norm)) return '23';
  if (/r\s*and\s*d|rnd|r&d|research/.test(norm)) return '24';
  if (/green\s*house|greenhouse|\bgh\b|calla|demo|gypso|rose|seed|pots|st|caper|dendrobium|organic|plug/.test(norm)) return '25';

  return '-';
}

export function getKFDepartmentCode(department?: string): string {
  const norm = normalize(department);
  if (!norm) return '-';

  // KF BIOPLANTS Matching
  const direct = getCode(KF_DEPARTMENT_CODES, department);
  if (direct !== '-') return direct;

  // Specific common department abbreviations & synonyms for KF
  if (/admin\s*hsk/i.test(norm)) return '03';
  if (/hr\s*and\s*admin|hr\s*admin|human\s*res/i.test(norm)) return '24';
  if (/accounts|acc|finance/i.test(norm)) return '01';
  if (/admin/i.test(norm)) return '02';
  if (/calla/i.test(norm)) return '05';
  if (/cap\s*wash/i.test(norm)) return '06';
  if (/cn\s*gh/i.test(norm)) return '07';
  if (/contamination|contam/i.test(norm)) return '08';
  if (/demo\s*gh/i.test(norm)) return '09';
  if (/initiation/i.test(norm)) return '10';
  if (/dispatch/i.test(norm)) return '11';
  if (/dress\s*wash/i.test(norm)) return '12';
  if (/embryo/i.test(norm)) return '13';
  if (/exim|export/i.test(norm)) return '14';
  if (/garden/i.test(norm)) return '15';
  if (/ge\s*gh/i.test(norm)) return '16';
  if (/organic\s*farm/i.test(norm)) return '17';
  if (/plug\s*machine/i.test(norm)) return '18';
  if (/mun\s*gh|gh\s*mun/i.test(norm)) return '19';
  if (/gh\s*hsk/i.test(norm)) return '20';
  if (/gyp\s*gh|gypso/i.test(norm)) return '22';
  if (/house\s*keeping|hsk/i.test(norm)) return '23';
  if (/hypol/i.test(norm)) return '25';
  if (/\bit\b|information\s*tech/i.test(norm)) return '26';
  if (/kf\s*bw/i.test(norm)) return '27';
  if (/lab\s*hsk/i.test(norm)) return '28';
  if (/lab\s*sealing|sealing/i.test(norm)) return '29';
  if (/limon|limonium/i.test(norm)) return '30';
  if (/maintenance|maint/i.test(norm)) return '31';
  if (/marketing/i.test(norm)) return '32';
  if (/mpr/i.test(norm)) return '33';
  if (/msr/i.test(norm)) return '34';
  if (/operations|ops/i.test(norm)) return '35';
  if (/pgr/i.test(norm)) return '36';
  if (/dh\s*pir/i.test(norm)) return '51';
  if (/pir/i.test(norm)) return '37';
  if (/pots\s*gh/i.test(norm)) return '38';
  if (/production|prod/i.test(norm)) return '39';
  if (/r\s*and\s*d|rnd|research/i.test(norm)) return '40';
  if (/rose\s*gh/i.test(norm)) return '41';
  if (/security/i.test(norm)) return '42';
  if (/seed\s*gh/i.test(norm)) return '43';
  if (/st\s*gh/i.test(norm)) return '44';
  if (/stores|store/i.test(norm)) return '45';
  if (/pot\s*marketing/i.test(norm)) return '46';
  if (/seedling|veg\s*seed/i.test(norm)) return '47';
  if (/pre\s*dispatch|quality/i.test(norm)) return '48';
  if (/caper/i.test(norm)) return '49';
  if (/dendrobium/i.test(norm)) return '50';
  if (/purchase/i.test(norm)) return '52';
  if (/media\s*disp|mdr/i.test(norm)) return '53';
  if (/green\s*house|gh/i.test(norm)) return '21';
  if (/bw/i.test(norm)) return '04';

  return '-';
}

export function getDepartmentCode(company: CompanyCode, department?: string): string {
  if (company === 'FUTURA') {
    return getFuturaDepartmentCode(department);
  }
  const kfCode = getKFDepartmentCode(department);
  if (kfCode !== '-') return kfCode;
  if (!company) {
    return getFuturaDepartmentCode(department);
  }
  return '-';
}

// Recruiter short forms "Futura-2", "kf-3", "L-1", "F2" -> "lab 2"; other text unchanged.
function labShortForm(norm: string): string {
  const m = norm.match(/\b(?:lab|l|futura|kf|f)\s*0?([1-3])\b/);
  return m ? `lab ${m[1]}` : norm;
}

export function getFuturaSectionCode(section?: string): string {
  const norm = labShortForm(normalize(section));
  if (!norm) return '-';

  if (/lab\s*0?1\b|lab1\b/i.test(norm)) return '01';
  if (/lab\s*0?2\b|lab2\b/i.test(norm)) return '02';
  if (/support\s*staff|staff/i.test(norm)) return '04';
  if (/lab\s*0?3\b|lab3\b/i.test(norm)) return '05';
  return getCode(FUTURA_SECTION_CODES, section);
}

export function getKFSectionCode(section?: string): string {
  const norm = labShortForm(normalize(section));
  if (!norm) return '-';

  if (/lab\s*0?2\b|lab2\b/i.test(norm)) return '01';
  if (/lab\s*0?1\b|lab1\b/i.test(norm)) return '03';
  if (/support\s*staff/i.test(norm)) return '06';
  if (/staff/i.test(norm)) return '05';
  if (/lab\s*0?3\b|lab3\b/i.test(norm)) return '08';
  return getCode(KF_SECTION_CODES, section);
}

export function getSectionCode(company: CompanyCode, section?: string): string {
  if (company === 'FUTURA') {
    return getFuturaSectionCode(section);
  }
  const kfCode = getKFSectionCode(section);
  if (kfCode !== '-') return kfCode;
  if (!company) {
    return getFuturaSectionCode(section);
  }
  return '-';
}

export interface MasterCodeEntry {
  company: 'KF' | 'FUTURA';
  category: 'Designation' | 'Department' | 'Section (Lab)';
  name: string;
  code: string;
}

export function getMasterDirectory(): {
  kfDesignations: { name: string; code: string }[];
  kfDepartments: { name: string; code: string }[];
  kfSections: { name: string; code: string }[];
  futuraDesignations: { name: string; code: string }[];
  futuraDepartments: { name: string; code: string }[];
  futuraSections: { name: string; code: string }[];
} {
  return {
    kfDesignations: Object.entries(KF_DESIGNATION_CODES).map(([name, code]) => ({ name, code })),
    kfDepartments: Object.entries(KF_DEPARTMENT_CODES).map(([name, code]) => ({ name, code })),
    kfSections: Object.entries(KF_SECTION_CODES).map(([name, code]) => ({ name, code })),
    futuraDesignations: Object.entries(FUTURA_DESIGNATION_CODES).map(([name, code]) => ({ name, code })),
    futuraDepartments: Object.entries(FUTURA_DEPARTMENT_CODES).map(([name, code]) => ({ name, code })),
    futuraSections: Object.entries(FUTURA_SECTION_CODES).map(([name, code]) => ({ name, code }))
  };
}

export interface ProbationRuleDefinition {
  designationDesc: string;
  probationRuleText: string;
  probationMonths: number;
  probationBucket: '3 Months' | '6 Months' | '1 Year';
  confirmationRuleText: string;
  confirmationMonths: number; // Always 6 months from Probation Date
}

export const MASTER_PROBATION_RULES_TABLE: ProbationRuleDefinition[] = [
  { designationDesc: 'Trainee', probationRuleText: 'From Date of Joining 1 Year', probationMonths: 12, probationBucket: '1 Year', confirmationRuleText: 'From Probation Date 6 months', confirmationMonths: 6 },
  { designationDesc: 'Trainee Asst. Executive', probationRuleText: 'From Date of Joining 3 Months', probationMonths: 3, probationBucket: '3 Months', confirmationRuleText: 'From Probation Date 6 months', confirmationMonths: 6 },
  { designationDesc: 'Trainee Asst. Supervisor', probationRuleText: 'From Date of Joining 6 Months', probationMonths: 6, probationBucket: '6 Months', confirmationRuleText: 'From Probation Date 6 months', confirmationMonths: 6 },
  { designationDesc: 'Trainee Comp. Operator', probationRuleText: 'From Date of Joining 6 Months', probationMonths: 6, probationBucket: '6 Months', confirmationRuleText: 'From Probation Date 6 months', confirmationMonths: 6 },
  { designationDesc: 'Trainee Driver', probationRuleText: 'From Date of Joining 6 Months', probationMonths: 6, probationBucket: '6 Months', confirmationRuleText: 'From Probation Date 6 months', confirmationMonths: 6 },
  { designationDesc: 'Trainee Field Assistant', probationRuleText: 'From Date of Joining 6 Months', probationMonths: 6, probationBucket: '6 Months', confirmationRuleText: 'From Probation Date 6 months', confirmationMonths: 6 },
  { designationDesc: 'Trainee Instrument Engineer', probationRuleText: 'From Date of Joining 3 Months', probationMonths: 3, probationBucket: '3 Months', confirmationRuleText: 'From Probation Date 6 months', confirmationMonths: 6 },
  { designationDesc: 'Trainee Makt.cum Tech. execute', probationRuleText: 'From Date of Joining 3 Months', probationMonths: 3, probationBucket: '3 Months', confirmationRuleText: 'From Probation Date 6 months', confirmationMonths: 6 },
  { designationDesc: 'Trainee Marketing Executive', probationRuleText: 'From Date of Joining 3 Months', probationMonths: 3, probationBucket: '3 Months', confirmationRuleText: 'From Probation Date 6 months', confirmationMonths: 6 },
  { designationDesc: 'Trainee Office Boy', probationRuleText: 'From Date of Joining 6 Months', probationMonths: 6, probationBucket: '6 Months', confirmationRuleText: 'From Probation Date 6 months', confirmationMonths: 6 },
  { designationDesc: 'Trainee Supervisor', probationRuleText: 'From Date of Joining 6 Months', probationMonths: 6, probationBucket: '6 Months', confirmationRuleText: 'From Probation Date 6 months', confirmationMonths: 6 },
  { designationDesc: 'Trainee Executive', probationRuleText: 'From Date of Joining 3 Months', probationMonths: 3, probationBucket: '3 Months', confirmationRuleText: 'From Probation Date 6 months', confirmationMonths: 6 },
  { designationDesc: 'Trainee Sales Co-ordinator', probationRuleText: 'From Date of Joining 6 Months', probationMonths: 6, probationBucket: '6 Months', confirmationRuleText: 'From Probation Date 6 months', confirmationMonths: 6 },
  { designationDesc: 'Apprentice', probationRuleText: 'From Date of Joining 1 Year', probationMonths: 12, probationBucket: '1 Year', confirmationRuleText: 'From Probation Date 6 months', confirmationMonths: 6 },
  { designationDesc: 'Trainee Store Assistant', probationRuleText: 'From Date of Joining 1 Year', probationMonths: 12, probationBucket: '1 Year', confirmationRuleText: 'From Probation Date 6 months', confirmationMonths: 6 },
  { designationDesc: 'Trainee Research Associate', probationRuleText: 'From Date of Joining 3 Months', probationMonths: 3, probationBucket: '3 Months', confirmationRuleText: 'From Probation Date 6 months', confirmationMonths: 6 }
];

export const PROBATION_MONTHS: CodeMap = {
  Trainee: '12',
  'Trainee Asst. Executive': '3',
  'Trainee Asst. Supervisor': '6',
  'Trainee Comp. Operator': '6',
  'Trainee Driver': '6',
  'Trainee Field Assistant': '6',
  'Trainee Instrument Engineer': '3',
  'Trainee Makt.cum Tech. execute': '3',
  'Trainee Marketing Executive': '3',
  'Trainee Office Boy': '6',
  'Trainee Supervisor': '6',
  'Trainee Executive': '3',
  'Trainee Sales Co-ordinator': '6',
  Apprentice: '12',
  'Trainee Store Assistant': '12',
  'Trainee Research Associate': '3'
};

export interface ProbationRuleMatch {
  matched: boolean;
  canonicalName: string;
  probationMonths: number;
  probationBucket: '3 Months' | '6 Months' | '1 Year';
  probationRuleText: string;
  confirmationRuleText: string;
  confirmationMonths: number;
}

/**
 * Matches any designation string to its exact rule bucket (3 Months, 6 Months, 1 Year).
 * Supports both exact trainee matches and standard employee designations.
 */
export function getProbationRuleMatch(designation?: string): ProbationRuleMatch | null {
  const norm = normalize(designation);
  if (!norm) {
    return {
      matched: true,
      canonicalName: 'Standard Employee',
      probationMonths: 6,
      probationBucket: '6 Months',
      probationRuleText: 'From Date of Joining 6 Months',
      confirmationRuleText: 'From Probation Date 6 months',
      confirmationMonths: 6
    };
  }

  // 1. Check exact normalized match from table
  for (const rule of MASTER_PROBATION_RULES_TABLE) {
    if (norm === normalize(rule.designationDesc)) {
      return {
        matched: true,
        canonicalName: rule.designationDesc,
        probationMonths: rule.probationMonths,
        probationBucket: rule.probationBucket,
        probationRuleText: rule.probationRuleText,
        confirmationRuleText: rule.confirmationRuleText,
        confirmationMonths: 6
      };
    }
  }

  // 2. Specialized fuzzy matching for the 3 buckets:

  // --- 1 YEAR BUCKET (Store Assistant, Apprentice, General Trainee) ---
  if (/store/i.test(norm)) {
    return {
      matched: true,
      canonicalName: 'Trainee Store Assistant',
      probationMonths: 12,
      probationBucket: '1 Year',
      probationRuleText: 'From Date of Joining 1 Year',
      confirmationRuleText: 'From Probation Date 6 months',
      confirmationMonths: 6
    };
  }

  if (/apprentice/i.test(norm)) {
    return {
      matched: true,
      canonicalName: 'Apprentice',
      probationMonths: 12,
      probationBucket: '1 Year',
      probationRuleText: 'From Date of Joining 1 Year',
      confirmationRuleText: 'From Probation Date 6 months',
      confirmationMonths: 6
    };
  }

  // --- 3 MONTHS BUCKET (Executive, Asst. Executive, Engineer, Marketing, Research Associate, Officers) ---
  // Assistant Executive / Asst. Executive
  if ((/asst/i.test(norm) || /assistant/i.test(norm)) && (/exec/i.test(norm) || /executive/i.test(norm))) {
    return {
      matched: true,
      canonicalName: 'Trainee Asst. Executive',
      probationMonths: 3,
      probationBucket: '3 Months',
      probationRuleText: 'From Date of Joining 3 Months',
      confirmationRuleText: 'From Probation Date 6 months',
      confirmationMonths: 6
    };
  }

  // Instrument Engineer / Instrumentation / Engineer
  if (/instrument/i.test(norm) || /instrumentation/i.test(norm) || /engineer/i.test(norm)) {
    return {
      matched: true,
      canonicalName: 'Trainee Instrument Engineer',
      probationMonths: 3,
      probationBucket: '3 Months',
      probationRuleText: 'From Date of Joining 3 Months',
      confirmationRuleText: 'From Probation Date 6 months',
      confirmationMonths: 6
    };
  }

  // Marketing Cum Technical / Mkt
  if ((/makt/i.test(norm) || /mkt/i.test(norm) || /marketing/i.test(norm)) && (/tech/i.test(norm) || /technical/i.test(norm))) {
    return {
      matched: true,
      canonicalName: 'Trainee Makt.cum Tech. execute',
      probationMonths: 3,
      probationBucket: '3 Months',
      probationRuleText: 'From Date of Joining 3 Months',
      confirmationRuleText: 'From Probation Date 6 months',
      confirmationMonths: 6
    };
  }

  // Marketing Executive / Sales Officer / Market Development
  if ((/marketing/i.test(norm) || /mkt/i.test(norm) || /market\s*dev/i.test(norm)) && (/exec/i.test(norm) || /executive/i.test(norm) || /officer/i.test(norm))) {
    return {
      matched: true,
      canonicalName: 'Trainee Marketing Executive',
      probationMonths: 3,
      probationBucket: '3 Months',
      probationRuleText: 'From Date of Joining 3 Months',
      confirmationRuleText: 'From Probation Date 6 months',
      confirmationMonths: 6
    };
  }

  // Research Associate / Associate
  if (/research/i.test(norm) || /associate/i.test(norm) || /res/i.test(norm)) {
    return {
      matched: true,
      canonicalName: 'Trainee Research Associate',
      probationMonths: 3,
      probationBucket: '3 Months',
      probationRuleText: 'From Date of Joining 3 Months',
      confirmationRuleText: 'From Probation Date 6 months',
      confirmationMonths: 6
    };
  }

  // System Administrator / IT Officer
  if (/system\s*admin/i.test(norm) || /sys\s*admin/i.test(norm) || /\bit\b/i.test(norm)) {
    return {
      matched: true,
      canonicalName: 'System Administrator',
      probationMonths: 3,
      probationBucket: '3 Months',
      probationRuleText: 'From Date of Joining 3 Months',
      confirmationRuleText: 'From Probation Date 6 months',
      confirmationMonths: 6
    };
  }

  // HK-Officer / Officer / Receptionist / Secretary
  if (/officer/i.test(norm) || /secretary/i.test(norm) || /receptionist/i.test(norm) || /accountant/i.test(norm)) {
    return {
      matched: true,
      canonicalName: 'Executive Officer',
      probationMonths: 3,
      probationBucket: '3 Months',
      probationRuleText: 'From Date of Joining 3 Months',
      confirmationRuleText: 'From Probation Date 6 months',
      confirmationMonths: 6
    };
  }

  // General Executive (HR / Sales / Finance / Accounts / etc.)
  if (/executive/i.test(norm) || /exec/i.test(norm)) {
    return {
      matched: true,
      canonicalName: 'Trainee Executive',
      probationMonths: 3,
      probationBucket: '3 Months',
      probationRuleText: 'From Date of Joining 3 Months',
      confirmationRuleText: 'From Probation Date 6 months',
      confirmationMonths: 6
    };
  }

  // --- 6 MONTHS BUCKET (Supervisor, Operator, Driver, Field Assistant, Office Boy, Sales Co-ordinator, Agronomist, Tech) ---
  // Assistant Supervisor
  if ((/asst/i.test(norm) || /assistant/i.test(norm)) && (/sup/i.test(norm) || /supervisor/i.test(norm))) {
    return {
      matched: true,
      canonicalName: 'Trainee Asst. Supervisor',
      probationMonths: 6,
      probationBucket: '6 Months',
      probationRuleText: 'From Date of Joining 6 Months',
      confirmationRuleText: 'From Probation Date 6 months',
      confirmationMonths: 6
    };
  }

  // Computer Operator / Operator
  if (/comp/i.test(norm) || /computer/i.test(norm) || /op/i.test(norm) || /operator/i.test(norm)) {
    return {
      matched: true,
      canonicalName: 'Trainee Comp. Operator',
      probationMonths: 6,
      probationBucket: '6 Months',
      probationRuleText: 'From Date of Joining 6 Months',
      confirmationRuleText: 'From Probation Date 6 months',
      confirmationMonths: 6
    };
  }

  // Driver
  if (/driver/i.test(norm)) {
    return {
      matched: true,
      canonicalName: 'Trainee Driver',
      probationMonths: 6,
      probationBucket: '6 Months',
      probationRuleText: 'From Date of Joining 6 Months',
      confirmationRuleText: 'From Probation Date 6 months',
      confirmationMonths: 6
    };
  }

  // Field Assistant / Lab Assistant / Assistant
  if (/field/i.test(norm) || /lab\s*asst/i.test(norm) || /assistant/i.test(norm) || /asst/i.test(norm)) {
    return {
      matched: true,
      canonicalName: 'Trainee Field Assistant',
      probationMonths: 6,
      probationBucket: '6 Months',
      probationRuleText: 'From Date of Joining 6 Months',
      confirmationRuleText: 'From Probation Date 6 months',
      confirmationMonths: 6
    };
  }

  // Office Boy / Peon / Cleaner / Casual / Attendant
  if (/office\s*boy/i.test(norm) || /officeboy/i.test(norm) || /peon/i.test(norm) || /cleaner/i.test(norm) || /casual/i.test(norm)) {
    return {
      matched: true,
      canonicalName: 'Trainee Office Boy',
      probationMonths: 6,
      probationBucket: '6 Months',
      probationRuleText: 'From Date of Joining 6 Months',
      confirmationRuleText: 'From Probation Date 6 months',
      confirmationMonths: 6
    };
  }

  // Sales Co-ordinator / Coordinator
  if (/sales/i.test(norm) || /coord/i.test(norm) || /co\s*ordinator/i.test(norm)) {
    return {
      matched: true,
      canonicalName: 'Trainee Sales Co-ordinator',
      probationMonths: 6,
      probationBucket: '6 Months',
      probationRuleText: 'From Date of Joining 6 Months',
      confirmationRuleText: 'From Probation Date 6 months',
      confirmationMonths: 6
    };
  }

  // Supervisor
  if (/supervisor/i.test(norm) || /sup/i.test(norm)) {
    return {
      matched: true,
      canonicalName: 'Trainee Supervisor',
      probationMonths: 6,
      probationBucket: '6 Months',
      probationRuleText: 'From Date of Joining 6 Months',
      confirmationRuleText: 'From Probation Date 6 months',
      confirmationMonths: 6
    };
  }

  // Agronomist / Crop / Breeder
  if (/agronom/i.test(norm) || /crop/i.test(norm) || /breed/i.test(norm)) {
    return {
      matched: true,
      canonicalName: 'Trainee Agronomist',
      probationMonths: 6,
      probationBucket: '6 Months',
      probationRuleText: 'From Date of Joining 6 Months',
      confirmationRuleText: 'From Probation Date 6 months',
      confirmationMonths: 6
    };
  }

  // Technician / Electrician / Plumber
  if (/tech/i.test(norm) || /electric/i.test(norm) || /plumb/i.test(norm)) {
    return {
      matched: true,
      canonicalName: 'Trainee Technician',
      probationMonths: 6,
      probationBucket: '6 Months',
      probationRuleText: 'From Date of Joining 6 Months',
      confirmationRuleText: 'From Probation Date 6 months',
      confirmationMonths: 6
    };
  }

  // General Trainee role (fallback to 1 Year if pure trainee)
  if (/trainee/i.test(norm)) {
    return {
      matched: true,
      canonicalName: 'Trainee',
      probationMonths: 12,
      probationBucket: '1 Year',
      probationRuleText: 'From Date of Joining 1 Year',
      confirmationRuleText: 'From Probation Date 6 months',
      confirmationMonths: 6
    };
  }

  // General Employee fallback rule (6 Months standard probation)
  return {
    matched: true,
    canonicalName: designation || 'Standard Employee',
    probationMonths: 6,
    probationBucket: '6 Months',
    probationRuleText: 'From Date of Joining 6 Months',
    confirmationRuleText: 'From Probation Date 6 months',
    confirmationMonths: 6
  };
}

export function getProbationMonths(designation?: string): number | null {
  const match = getProbationRuleMatch(designation);
  return match ? match.probationMonths : 6;
}

export function parseDate(value?: string): Date | null {
  if (!value) return null;
  const raw = String(value).trim();
  if (raw === '-' || raw === '' || raw.toLowerCase() === 'null' || raw.toLowerCase() === 'undefined') return null;

  // Clean extraneous whitespace around slashes/hyphens/dots
  const clean = raw.replace(/\s*([\/\-\.])\s*/g, '$1').trim();

  // match DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const dmyMatch = clean.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (dmyMatch) {
    const day = Number(dmyMatch[1]);
    const month = Number(dmyMatch[2]);
    const year = Number(dmyMatch[3]);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      const maxDaysInMonth = new Date(year, month, 0).getDate();
      const validDay = Math.min(Math.max(1, day), maxDaysInMonth);
      return new Date(year, month - 1, validDay);
    }
  }

  // match DD/MM/YY or DD-MM-YY (2-digit year)
  const dmy2Match = clean.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2})$/);
  if (dmy2Match) {
    const day = Number(dmy2Match[1]);
    const month = Number(dmy2Match[2]);
    let year = Number(dmy2Match[3]);
    year += year < 50 ? 2000 : 1900;
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      const maxDaysInMonth = new Date(year, month, 0).getDate();
      const validDay = Math.min(Math.max(1, day), maxDaysInMonth);
      return new Date(year, month - 1, validDay);
    }
  }

  // match YYYY-MM-DD or YYYY/MM/DD (ISO format)
  const ymdMatch = clean.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/);
  if (ymdMatch) {
    const year = Number(ymdMatch[1]);
    const month = Number(ymdMatch[2]);
    const day = Number(ymdMatch[3]);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      const maxDaysInMonth = new Date(year, month, 0).getDate();
      const validDay = Math.min(Math.max(1, day), maxDaysInMonth);
      return new Date(year, month - 1, validDay);
    }
  }

  // Textual dates e.g. "28 Sep 2024", "28 September 2024", "28-Sep-2024"
  const monthsMap: Record<string, number> = {
    jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4,
    may: 5, jun: 6, june: 6, jul: 7, july: 7, aug: 8, august: 8, sep: 9, sept: 9, september: 9,
    oct: 10, october: 10, nov: 11, november: 11, dec: 12, decimal: 12, december: 12
  };
  const textMatch = clean.match(/^(\d{1,2})[\s\-]+([a-zA-Z]+)[\s\-]+(\d{4})$/);
  if (textMatch) {
    const day = Number(textMatch[1]);
    const mKey = textMatch[2].toLowerCase();
    const year = Number(textMatch[3]);
    if (monthsMap[mKey]) {
      const month = monthsMap[mKey];
      const maxDaysInMonth = new Date(year, month, 0).getDate();
      const validDay = Math.min(Math.max(1, day), maxDaysInMonth);
      return new Date(year, month - 1, validDay);
    }
  }

  const parsed = new Date(clean);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

export function addMonthsToDate(value: string | undefined, months: number): string {
  const date = parseDate(value);
  if (!date) return '-';
  const originalDay = date.getDate();
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(originalDay, lastDay));
  return formatDate(target);
}

export function calculateProbationDate(joinDate?: string, designation?: string): string {
  if (!joinDate || joinDate === '-' || joinDate.trim() === '') return '-';
  const match = getProbationRuleMatch(designation);
  const months = match ? match.probationMonths : 6;
  return addMonthsToDate(joinDate, months);
}

export function calculateConfirmationDate(probationDate?: string): string {
  if (!probationDate || probationDate === '-' || probationDate.trim() === '') return '-';
  return addMonthsToDate(probationDate, 6);
}

export interface ProbationCalculationResult {
  hasRule: boolean;
  ruleMatch: ProbationRuleMatch | null;
  probationDate: string;
  confirmationDate: string;
  calculationBreakdown: string;
}

export function getFullDateCalculation(joinDate?: string, designation?: string): ProbationCalculationResult {
  const ruleMatch = getProbationRuleMatch(designation);
  const prbDate = calculateProbationDate(joinDate, designation);
  const confDate = prbDate !== '-' ? calculateConfirmationDate(prbDate) : '-';

  const bucket = ruleMatch ? ruleMatch.probationBucket : '6 Months';
  const ruleName = ruleMatch ? ruleMatch.canonicalName : (designation || 'Standard Employee');
  const months = ruleMatch ? ruleMatch.probationMonths : 6;

  let breakdown = '';
  if (prbDate !== '-' && confDate !== '-') {
    breakdown = `Bucket: ${bucket} (${ruleName}) | Step C (PRB_DT): ${joinDate} + ${months} mo = ${prbDate} | Step D (CONF_DT): ${prbDate} + 6 mo = ${confDate}`;
  } else if (joinDate && joinDate !== '-') {
    breakdown = `Bucket: ${bucket} (${ruleName}) | Joining Date "${joinDate}" could not be parsed as valid date.`;
  } else {
    breakdown = `Bucket: ${bucket} (${ruleName}) | Awaiting Date of Joining (JOIN_DT).`;
  }

  return {
    hasRule: true,
    ruleMatch: ruleMatch || {
      matched: true,
      canonicalName: designation || 'Standard Employee',
      probationMonths: 6,
      probationBucket: '6 Months',
      probationRuleText: 'From Date of Joining 6 Months',
      confirmationRuleText: 'From Probation Date 6 months',
      confirmationMonths: 6
    },
    probationDate: prbDate,
    confirmationDate: confDate,
    calculationBreakdown: breakdown
  };
}

export interface EnrichmentInput {
  COMPANY?: CompanyCode;
  LabDetails?: string;
  DESIG?: string;
  JOIN_DT?: string;
  DEPT_NAME?: string;
}

export interface EnrichmentOutput {
  COMPANY: CompanyCode;
  DESIG_CODE: string;
  F_DESIG_CODE: string;
  DEPT_CODE: string;
  F_DEPT_CODE: string;
  SECTION_CODE: string;
  F_SECTION_CODE: string;
  PRB_DT: string;
  CONF_DT: string;
  codeMappingStatus: 'MAPPED' | 'REVIEW_REQUIRED';
}

export function enrichEmployeeRecord(input: EnrichmentInput): EnrichmentOutput {
  // Codes are only valid for KF Bioplants or Futura; any other / unknown company gets blank codes.
  const detected = input.COMPANY || detectCompany(input.LabDetails);
  const COMPANY: CompanyCode = detected === 'KF' || detected === 'FUTURA' ? detected : '';
  let desigCode = getKFDesignationCode(input.DESIG);
  let fDesigCode = getFuturaDesignationCode(input.DESIG);
  let deptCode = getKFDepartmentCode(input.DEPT_NAME);
  let fDeptCode = getFuturaDepartmentCode(input.DEPT_NAME);

  const labText = input.LabDetails || '';
  let secCode = getKFSectionCode(labText);
  let fSecCode = getFuturaSectionCode(labText);

  if (COMPANY !== 'KF') {
    desigCode = '';
    deptCode = '';
    secCode = '';
  }
  if (COMPANY !== 'FUTURA') {
    fDesigCode = '';
    fDeptCode = '';
    fSecCode = '';
  }

  const probation = calculateProbationDate(input.JOIN_DT, input.DESIG);
  const confirmation = probation !== '-' ? calculateConfirmationDate(probation) : '-';

  const needsReview = !COMPANY ||
    (Boolean(input.DESIG) && (desigCode === '-' || fDesigCode === '-')) ||
    (Boolean(input.DEPT_NAME) && (deptCode === '-' || fDeptCode === '-')) ||
    (Boolean(input.JOIN_DT) && getProbationMonths(input.DESIG) !== null && probation === '-');

  return {
    COMPANY: COMPANY,
    DESIG_CODE: desigCode,
    F_DESIG_CODE: fDesigCode,
    DEPT_CODE: deptCode,
    F_DEPT_CODE: fDeptCode,
    SECTION_CODE: secCode,
    F_SECTION_CODE: fSecCode,
    PRB_DT: probation,
    CONF_DT: confirmation,
    codeMappingStatus: needsReview ? 'REVIEW_REQUIRED' : 'MAPPED'
  };
}
