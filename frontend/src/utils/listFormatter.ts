import { AcademicQualification, PreviousJob, MasterEmployeeRecord } from '../types';
import { parseDate } from '../companyCodes';

/**
 * Educational Hierarchy Ranking:
 * 1st: 10th / SSC / Matriculation (Rank 1)
 * 2nd: 12th / HSC / Intermediate (Rank 2)
 * 3rd: Diploma / Polytechnic (Rank 3)
 * 4th: Bachelors / Graduation (B.Sc, B.Tech, B.A, B.Com, B.E, etc.) (Rank 4)
 * 5th: Masters / Post Graduation (M.Sc, M.Tech, MBA, M.Com, M.A, etc.) (Rank 5)
 * 6th: PhD or Higher / Doctorate (Rank 6)
 */
export function getQualificationRank(item: AcademicQualification | string): number {
  let text = '';
  let level = '';
  let course = '';

  if (typeof item === 'string') {
    text = item.toLowerCase();
    level = text;
    course = text;
  } else {
    level = (item.level || '').toLowerCase();
    course = (item.courseName || '').toLowerCase();
    text = `${level} ${course} ${item.institute || ''} ${item.boardUniversity || ''}`.toLowerCase();
  }

  // 1. PhD / Doctorate / Post-Doc (Rank 6)
  if (
    /\b(ph\.?d|doctorate|doctor of philosophy|post\s*doc|d\.?sc|d\.?litt)\b/i.test(text) ||
    level.includes('phd') || level.includes('doctorate')
  ) {
    return 6;
  }

  // 2. Masters / Post Graduation / PG (Rank 5)
  if (
    /\b(m\.?sc|msc|m\.?tech|mtech|mba|pgdm|m\.?com|mcom|m\.?a|m\.?e|mca|m\.?pharm|mpharm|ms|m\.?phil|m\.?des|llm|post\s*grad|post\s*graduate|pg|master|masters)\b/i.test(text) ||
    /\b(post\s*graduation|post\s*graduate|pg)\b/i.test(level) ||
    /\b(master|masters)\b/i.test(course) ||
    /\b(master|masters)\b/i.test(level)
  ) {
    return 5;
  }

  // 3. Bachelors / Graduation / UG (Rank 4)
  if (
    /\b(b\.?sc|bsc|b\.?tech|btech|b\.?e\b|be\b|b\.?a\b|ba\b|b\.?com|bcom|bba|bca|b\.?pharm|bpharm|b\.?ed|b\.?des|bhm|b\.?arch|llb|graduation|graduate|under\s*grad|undergraduate|ug|bachelor|bachelors)\b/i.test(text) ||
    /\b(graduation|graduate|ug|under\s*graduation)\b/i.test(level) ||
    /\b(bachelor|bachelors)\b/i.test(course) ||
    /\b(bachelor|bachelors)\b/i.test(level)
  ) {
    return 4;
  }

  // 4. Diploma / Polytechnic (Rank 3)
  if (
    /\b(diploma|polytechnic|iti|d\.?pharm|d\.?ed|d\.?el\.?ed|post\s*diploma)\b/i.test(text) ||
    level.includes('diploma') || course.includes('diploma')
  ) {
    return 3;
  }

  // 5. 12th / HSC / Intermediate / Higher Secondary (Rank 2)
  if (
    /\b(12th|12\b|xii\b|xii\s*std|hsc|intermediate|inter|higher\s*secondary|plus\s*two|\+2|junior\s*college|10\+2)\b/i.test(text) ||
    level.includes('12') || level.includes('xii') || level.includes('hsc') || level.includes('inter')
  ) {
    return 2;
  }

  // 6. 10th / SSC / Matriculation / Secondary (Rank 1)
  if (
    /\b(10th|10\b|x\b|x\s*std|ssc|sslc|matric|matriculation|secondary|high\s*school)\b/i.test(text) ||
    level.includes('10') || level.includes('x std') || level.includes('ssc') || level.includes('matric')
  ) {
    return 1;
  }

  // Unclassified fallback: Default to rank 3.5
  return 3.5;
}

/**
 * Extracts a numeric passing year if available for secondary sorting.
 */
function extractPassYear(item: AcademicQualification | string): number {
  if (typeof item !== 'string' && item.passYear) {
    const y = parseInt(item.passYear.replace(/\D/g, ''), 10);
    if (!isNaN(y) && y > 1950 && y < 2100) return y;
  }
  const str = typeof item === 'string' ? item : `${item.courseName} ${item.level} ${item.institute}`;
  const match = str.match(/\b(19\d{2}|20\d{2})\b/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return 9999;
}

/**
 * Sorts Academic Qualifications from lowest to highest:
 * 10th -> 12th -> Diploma -> Bachelors -> Masters -> PhD
 */
export function sortAcademicQualifications(academics: AcademicQualification[]): AcademicQualification[] {
  if (!Array.isArray(academics) || academics.length <= 1) return academics || [];

  return [...academics].sort((a, b) => {
    const rankA = getQualificationRank(a);
    const rankB = getQualificationRank(b);

    if (rankA !== rankB) {
      return rankA - rankB; // Ascending: lowest rank (1) to highest rank (6)
    }

    // Secondary sort: Year of passing ascending
    const yearA = extractPassYear(a);
    const yearB = extractPassYear(b);
    return yearA - yearB;
  });
}

/**
 * Formats a single AcademicQualification into a clean bullet line.
 */
export function formatSingleAcademicLine(item: AcademicQualification): string {
  const parts: string[] = [];

  // Determine Title / Course
  let title = (item.courseName || item.level || 'Degree').trim();
  const levelNorm = (item.level || '').trim();

  // If level adds clear educational hierarchy context (e.g. 10th / 12th / Diploma / Masters) and isn't already in course name
  if (levelNorm && !title.toLowerCase().includes(levelNorm.toLowerCase())) {
    if (/^(10th|10|x|xii|12th|12|ssc|hsc|diploma|graduation|post\s*graduation|phd)/i.test(levelNorm)) {
      title = `${levelNorm}: ${title}`;
    }
  }
  parts.push(title);

  // Institution & University / Board
  const instParts = [item.institute?.trim(), item.boardUniversity?.trim()].filter(
    (p): p is string => Boolean(p && p !== '-')
  );
  // Remove duplicates
  const uniqueInst = Array.from(new Set(instParts)).join(' / ');
  if (uniqueInst) {
    parts.push(`(${uniqueInst})`);
  }

  // Passing year & Score
  const meta: string[] = [];
  if (item.passYear && item.passYear !== '-') meta.push(item.passYear.trim());
  if (item.percentageOrCgpa && item.percentageOrCgpa !== '-') meta.push(item.percentageOrCgpa.trim());
  if (meta.length > 0) {
    parts.push(`[${meta.join(', ')}]`);
  }

  return `• ${parts.join(' ')}`;
}

/**
 * Formats Qualifications into a sorted, newline-separated bulleted list within a single cell.
 */
export function formatQualificationsList(
  academics?: AcademicQualification[],
  fallbackText?: string
): string {
  // If structured academics array exists and has valid items
  if (Array.isArray(academics) && academics.length > 0) {
    const validItems = academics.filter(a => (a.courseName || a.level || a.institute));
    if (validItems.length > 0) {
      const sorted = sortAcademicQualifications(validItems);
      return sorted.map(formatSingleAcademicLine).join('\n');
    }
  }

  // Fallback: parse raw comma/semicolon/newline separated text
  if (!fallbackText || fallbackText === '-' || fallbackText.trim() === '') {
    return '';
  }

  // Split by newline, bullet point, or semicolons/commas between degrees
  const rawLines = fallbackText
    .split(/\r?\n|•|;|,(?=\s*(?:10th|12th|ssc|hsc|diploma|b\.?sc|b\.?tech|b\.?e|b\.?a|b\.?com|bachelor|m\.?sc|m\.?tech|mba|m\.?com|m\.?a|master|ph\.?d))/i)
    .map(s => s.trim().replace(/^[•\-\*\s]+/, ''))
    .filter(Boolean);

  if (rawLines.length === 0) return fallbackText;

  // Sort raw lines using getQualificationRank
  const sortedRaw = [...rawLines].sort((a, b) => {
    const rankA = getQualificationRank(a);
    const rankB = getQualificationRank(b);
    if (rankA !== rankB) return rankA - rankB;
    return extractPassYear(a) - extractPassYear(b);
  });

  return sortedRaw.map(line => `• ${line}`).join('\n');
}

/**
 * Helper to extract an approximate start timestamp/year for chronological sorting.
 */
function extractJobStartValue(job: PreviousJob | string): number {
  if (typeof job === 'string') {
    // Look for 4-digit years or dates
    const dmy = job.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
    if (dmy) {
      const d = parseDate(dmy[0]);
      if (d) return d.getTime();
    }
    const yr = job.match(/\b(19\d{2}|20\d{2})\b/);
    if (yr) return new Date(parseInt(yr[1], 10), 0, 1).getTime();
    return 9999999999999;
  }

  // 1. Check fromDate
  if (job.fromDate && job.fromDate !== '-') {
    const parsed = parseDate(job.fromDate);
    if (parsed) return parsed.getTime();
    const yr = job.fromDate.match(/\b(19\d{2}|20\d{2})\b/);
    if (yr) return new Date(parseInt(yr[1], 10), 0, 1).getTime();
  }

  // 2. Check duration string for earliest date/year
  if (job.duration && job.duration !== '-') {
    const dmy = job.duration.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
    if (dmy) {
      const d = parseDate(dmy[0]);
      if (d) return d.getTime();
    }
    const yr = job.duration.match(/\b(19\d{2}|20\d{2})\b/);
    if (yr) return new Date(parseInt(yr[1], 10), 0, 1).getTime();
  }

  // 3. Fallback to toDate
  if (job.toDate && job.toDate !== '-') {
    const parsed = parseDate(job.toDate);
    if (parsed) return parsed.getTime();
  }

  return 9999999999999;
}

/**
 * Sorts Previous Employments in Chronological Order:
 * 1st: The oldest company (the first company they joined).
 * 2nd: The next company in the timeline.
 * Last: Their most recent previous employer.
 */
export function sortPreviousEmployments(jobs: PreviousJob[]): PreviousJob[] {
  if (!Array.isArray(jobs) || jobs.length <= 1) return jobs || [];

  return [...jobs].sort((a, b) => {
    const timeA = extractJobStartValue(a);
    const timeB = extractJobStartValue(b);
    return timeA - timeB; // Ascending chronological order (oldest first)
  });
}

/**
 * Formats a single PreviousJob into a clean bullet line.
 */
export function formatSinglePreviousJobLine(job: PreviousJob): string {
  const parts: string[] = [];

  // Company Name
  const org = (job.organizationName || 'Previous Company').trim();
  parts.push(org);

  // Designation
  if (job.lastDesignation && job.lastDesignation !== '-') {
    parts.push(`- ${job.lastDesignation.trim()}`);
  }

  // Dates / Duration
  let durationStr = '';
  if (job.fromDate && job.toDate && job.fromDate !== '-' && job.toDate !== '-') {
    durationStr = `${job.fromDate} to ${job.toDate}`;
  } else if (job.duration && job.duration !== '-') {
    durationStr = job.duration.trim();
  } else if (job.fromDate && job.fromDate !== '-') {
    durationStr = `From ${job.fromDate}`;
  }
  if (durationStr) {
    parts.push(`(${durationStr})`);
  }

  // Emoluments & Reason for leaving
  const meta: string[] = [];
  if (job.emoluments && job.emoluments !== '-') meta.push(`CTC: ${job.emoluments.trim()}`);
  if (job.industry && job.industry !== '-') meta.push(`Industry: ${job.industry.trim()}`);
  if (job.reasonForLeaving && job.reasonForLeaving !== '-') meta.push(`Reason: ${job.reasonForLeaving.trim()}`);
  if (meta.length > 0) {
    parts.push(`[${meta.join(', ')}]`);
  }

  return `• ${parts.join(' ')}`;
}

/**
 * Formats Previous Employments into a chronologically sorted, newline-separated bulleted list within a single cell.
 */
export function formatPreviousEmploymentsList(
  jobs?: PreviousJob[],
  fallbackText?: string
): string {
  // If structured previousEmployments array exists
  if (Array.isArray(jobs) && jobs.length > 0) {
    const validJobs = jobs.filter(j => j.organizationName || j.lastDesignation || j.duration || j.fromDate);
    if (validJobs.length > 0) {
      const sorted = sortPreviousEmployments(validJobs);
      return sorted.map(formatSinglePreviousJobLine).join('\n');
    }
  }

  // Fallback: parse raw text
  if (!fallbackText || fallbackText === '-' || fallbackText.trim() === '') {
    return '';
  }

  // Split by newline or bullet
  const rawLines = fallbackText
    .split(/\r?\n|•|;/)
    .map(s => s.trim().replace(/^[•\-\*\s]+/, ''))
    .filter(Boolean);

  if (rawLines.length === 0) return fallbackText;

  // Sort raw lines chronologically
  const sortedRaw = [...rawLines].sort((a, b) => {
    return extractJobStartValue(a) - extractJobStartValue(b);
  });

  return sortedRaw.map(line => `• ${line}`).join('\n');
}

/**
 * Formats Present Employment with a bullet point for consistency.
 */
export function formatPresentEmployment(present?: string): string {
  if (!present || present === '-' || present.trim() === '') return '';
  const lines = present
    .split(/\r?\n/)
    .map(s => s.trim().replace(/^[•\-\*\s]+/, ''))
    .filter(Boolean);

  if (lines.length === 0) return present;
  return lines.map(l => `• ${l}`).join('\n');
}

/**
 * Normalizes and applies sorted, bulleted formatting to an employee record's
 * Qualification, PreviousEmployment, and PresentEmployment fields.
 */
export function applySortedBulletedFormatting<T extends Partial<MasterEmployeeRecord>>(record: T): T {
  const academics = record.extendedDetails?.academics;
  const previousJobs = record.extendedDetails?.previousEmployments;

  // Sort the underlying arrays in place / returned copies
  const sortedAcademics = academics ? sortAcademicQualifications(academics) : undefined;
  const sortedPreviousJobs = previousJobs ? sortPreviousEmployments(previousJobs) : undefined;

  const formattedQualification = formatQualificationsList(sortedAcademics, record.Qualification);
  const formattedPrevious = formatPreviousEmploymentsList(sortedPreviousJobs, record.PreviousEmployment);
  const formattedPresent = formatPresentEmployment(record.PresentEmployment);

  const updatedExtended = {
    ...(record.extendedDetails || {}),
    ...(sortedAcademics ? { academics: sortedAcademics } : {}),
    ...(sortedPreviousJobs ? { previousEmployments: sortedPreviousJobs } : {})
  };

  return {
    ...record,
    Qualification: formattedQualification || record.Qualification || '',
    PreviousEmployment: formattedPrevious || record.PreviousEmployment || '',
    PresentEmployment: formattedPresent || record.PresentEmployment || '',
    extendedDetails: updatedExtended
  };
}
