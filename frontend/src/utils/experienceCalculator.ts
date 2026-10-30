import { MasterEmployeeRecord, PreviousJob } from '../types';
import { parseDate } from '../companyCodes';

export interface ExperienceBreakdown {
  previousExperienceMonths: number;
  previousExperienceText: string;       // e.g. "3 Yrs 8 Mos"
  previousExperienceFullText: string;   // e.g. "3 Years 8 Months"
  
  currentExperienceMonths: number;
  currentExperienceText: string;        // e.g. "3 Yrs 6 Mos"
  currentExperienceFullText: string;    // e.g. "3 Years 6 Months"
  
  totalExperienceMonths: number;
  totalExperienceText: string;          // e.g. "7 Yrs 2 Mos"
  totalExperienceFullText: string;      // e.g. "7 Years 2 Months"
  totalYearsDecimal: number;            // e.g. 7.2
  
  currentJobStartDate: string;
  isFresher: boolean;
  
  previousJobsBreakdown: Array<{
    organization: string;
    designation?: string;
    period: string;
    months: number;
    formatted: string;
  }>;
}

/**
 * Formats a duration given in months into a clean, human-readable string.
 * @param months Total number of months
 * @param shortFormat If true, outputs "3 Yrs 8 Mos", else "3 Years 8 Months"
 */
export function formatMonthsToExperience(months: number, shortFormat = true): string {
  if (!months || months <= 0) {
    return shortFormat ? '0 Mos (Fresher)' : '0 Months (Fresher)';
  }
  
  const years = Math.floor(months / 12);
  const remainingMonths = Math.round(months % 12);
  
  if (years === 0) {
    if (shortFormat) return `${remainingMonths} ${remainingMonths === 1 ? 'Mo' : 'Mos'}`;
    return `${remainingMonths} ${remainingMonths === 1 ? 'Month' : 'Months'}`;
  }
  
  if (remainingMonths === 0) {
    if (shortFormat) return `${years} ${years === 1 ? 'Yr' : 'Yrs'}`;
    return `${years} ${years === 1 ? 'Year' : 'Years'}`;
  }
  
  if (shortFormat) {
    return `${years} ${years === 1 ? 'Yr' : 'Yrs'} ${remainingMonths} ${remainingMonths === 1 ? 'Mo' : 'Mos'}`;
  }
  return `${years} ${years === 1 ? 'Year' : 'Years'} ${remainingMonths} ${remainingMonths === 1 ? 'Month' : 'Months'}`;
}

/**
 * Calculates exact elapsed months between two Date objects.
 */
export function calculateMonthsDiff(startDate: Date, endDate: Date): number {
  if (startDate > endDate) return 0;
  
  let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
  months += (endDate.getMonth() - startDate.getMonth());
  
  // Account for day differences
  const dayDiff = endDate.getDate() - startDate.getDate();
  if (dayDiff < 0) {
    months -= 1;
    // Add fractional month
    const prevMonthDays = new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate();
    months += Math.max(0, (prevMonthDays + dayDiff) / prevMonthDays);
  } else if (dayDiff > 0) {
    const currentMonthDays = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate();
    months += Math.min(1, dayDiff / currentMonthDays);
  }
  
  return Math.max(0, Math.round(months * 10) / 10);
}

const MONTH_NAMES_MAP: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11
};

/**
 * Parses flexible text formats for from-to dates or durations into months.
 * Supports:
 * - "01/04/2019 to 31/11/2022" or "01/04/2019 - 30/11/2022"
 * - "April 2019 to Nov 2022" or "Apr 2019 - Nov 2022"
 * - "2019 to 2022"
 * - "2 Years 6 Months", "3.5 Years", "18 Months", "2 Yrs"
 */
export function parseExperiencePeriodToMonths(text?: string): number {
  if (!text) return 0;
  const clean = text.trim();
  if (!clean || /^(none|fresher|na|n\/a|-|nil|no)$/i.test(clean)) return 0;

  // 1. Check for standard date range DD/MM/YYYY to DD/MM/YYYY
  const dmyRangeMatch = clean.match(/(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})\s*(?:to|-|till|–|—|\/)\s*(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/i);
  if (dmyRangeMatch) {
    const d1 = parseDate(dmyRangeMatch[1]);
    const d2 = parseDate(dmyRangeMatch[2]);
    if (d1 && d2) {
      const months = calculateMonthsDiff(d1, d2);
      if (months > 0) return months;
    }
  }

  // 2. Check for Month Year range: e.g. "April 2019 to Nov 2022" or "04/2019 to 11/2022"
  const monthYearRangeMatch = clean.match(/([a-zA-Z]{3,9}|\d{1,2})[\/\-.\s]+(\d{4})\s*(?:to|-|till|–|—)\s*([a-zA-Z]{3,9}|\d{1,2})[\/\-.\s]+(\d{4})/i);
  if (monthYearRangeMatch) {
    let m1 = 0;
    const y1 = parseInt(monthYearRangeMatch[2], 10);
    const m1Raw = monthYearRangeMatch[1].toLowerCase();
    if (MONTH_NAMES_MAP[m1Raw] !== undefined) {
      m1 = MONTH_NAMES_MAP[m1Raw];
    } else {
      m1 = Math.max(0, Math.min(11, parseInt(m1Raw, 10) - 1));
    }

    let m2 = 0;
    const y2 = parseInt(monthYearRangeMatch[4], 10);
    const m2Raw = monthYearRangeMatch[3].toLowerCase();
    if (MONTH_NAMES_MAP[m2Raw] !== undefined) {
      m2 = MONTH_NAMES_MAP[m2Raw];
    } else {
      m2 = Math.max(0, Math.min(11, parseInt(m2Raw, 10) - 1));
    }

    const d1 = new Date(y1, m1, 1);
    const d2 = new Date(y2, m2, 28);
    const months = calculateMonthsDiff(d1, d2);
    if (months > 0) return months;
  }

  // 3. Check for simple Year to Year: e.g. "2019 to 2022"
  const yearToYearMatch = clean.match(/\b(19\d\d|20\d\d)\s*(?:to|-|till|–|—)\s*(19\d\d|20\d\d)\b/);
  if (yearToYearMatch) {
    const y1 = parseInt(yearToYearMatch[1], 10);
    const y2 = parseInt(yearToYearMatch[2], 10);
    if (y2 >= y1) {
      return (y2 - y1) * 12;
    }
  }

  // 4. Check for explicit "X years Y months" pattern
  const yrMoMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:years?|yrs?|yr)\s*(?:and\s*)?(?:(\d+(?:\.\d+)?)\s*(?:months?|mos?|mo))?/i);
  if (yrMoMatch) {
    const yrs = parseFloat(yrMoMatch[1] || '0');
    const mos = yrMoMatch[2] ? parseFloat(yrMoMatch[2]) : 0;
    return Math.round((yrs * 12 + mos) * 10) / 10;
  }

  // 5. Check for "X months" only (ensure not salary like /mo)
  const moOnlyMatch = clean.match(/(?:^|[^\/\w])(\d+(?:\.\d+)?)\s*(?:months?|mos?|mo)\b/i);
  if (moOnlyMatch && !/\/\s*mo|per\s*month|ctc|salary|pm\b/i.test(clean)) {
    return parseFloat(moOnlyMatch[1]);
  }

  return 0;
}

/**
 * Extracts from-date of current / present employment.
 * Checks `JOIN_DT` first, then parses date inside `PresentEmployment` string if any.
 */
export function getPresentEmploymentStartDate(record: Partial<MasterEmployeeRecord>): { date: Date | null; raw: string } {
  // 1. Check JOIN_DT
  if (record.JOIN_DT && record.JOIN_DT !== '-') {
    const parsed = parseDate(record.JOIN_DT);
    if (parsed) return { date: parsed, raw: record.JOIN_DT };
  }

  // 2. Check PresentEmployment text for date pattern (e.g. "Joining: 01/02/2023" or "From: 15/07/2022")
  if (record.PresentEmployment && record.PresentEmployment !== '-') {
    const dateMatch = record.PresentEmployment.match(/(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/);
    if (dateMatch) {
      const parsed = parseDate(dateMatch[1]);
      if (parsed) return { date: parsed, raw: dateMatch[1] };
    }
  }

  return { date: null, raw: '-' };
}

/**
 * Calculates current employment experience from start date (or JOIN_DT) till asOfDate (default today).
 */
export function calculateCurrentJobExperience(
  record: Partial<MasterEmployeeRecord>,
  asOfDate: Date = new Date()
): { months: number; text: string; fullText: string; startDate: string } {
  const { date: startDate, raw } = getPresentEmploymentStartDate(record);
  if (!startDate) {
    return {
      months: 0,
      text: '-',
      fullText: '-',
      startDate: '-'
    };
  }

  const months = calculateMonthsDiff(startDate, asOfDate);
  return {
    months,
    text: formatMonthsToExperience(months, true),
    fullText: formatMonthsToExperience(months, false),
    startDate: raw
  };
}

/**
 * Calculates previous employment experience from structured previousEmployments array or text field.
 */
export function calculatePreviousExperienceTotal(record: Partial<MasterEmployeeRecord>): {
  totalMonths: number;
  text: string;
  fullText: string;
  isFresher: boolean;
  jobs: Array<{
    organization: string;
    designation?: string;
    period: string;
    months: number;
    formatted: string;
  }>;
} {
  const jobs: Array<{
    organization: string;
    designation?: string;
    period: string;
    months: number;
    formatted: string;
  }> = [];

  const prevList: PreviousJob[] = record.extendedDetails?.previousEmployments || [];
  let totalMonths = 0;

  if (prevList && prevList.length > 0) {
    for (const job of prevList) {
      let months = 0;
      if (job.fromDate && job.toDate && job.fromDate !== '-' && job.toDate !== '-') {
        const d1 = parseDate(job.fromDate);
        const d2 = parseDate(job.toDate);
        if (d1 && d2) {
          months = calculateMonthsDiff(d1, d2);
        }
      }
      if (months === 0) {
        const durationText = job.duration || (job.fromDate && job.toDate ? `${job.fromDate} to ${job.toDate}` : '') || '';
        months = parseExperiencePeriodToMonths(durationText);
      }
      totalMonths += months;

      jobs.push({
        organization: job.organizationName || 'Previous Employer',
        designation: job.lastDesignation,
        period: job.duration || (job.fromDate && job.toDate ? `${job.fromDate} to ${job.toDate}` : '') || 'Duration Not Specified',
        months,
        formatted: formatMonthsToExperience(months, true)
      });
    }
  }

  // If totalMonths is 0 or prevList was empty, check record.PreviousEmployment
  if (totalMonths === 0 && record.PreviousEmployment && record.PreviousEmployment !== '-') {
    const raw = record.PreviousEmployment;
    // Split by newlines, bullets, or semicolons
    const jobParts = raw
      .split(/(?:\r?\n|•|\n•|\r\n•|;)+/)
      .map(s => s.trim())
      .filter(s => s.length > 2 && !/^(none|fresher|na|n\/a|-|nil|no)$/i.test(s));

    if (jobParts.length > 0) {
      for (const part of jobParts) {
        const months = parseExperiencePeriodToMonths(part);
        totalMonths += months;
        jobs.push({
          organization: part,
          period: part,
          months,
          formatted: formatMonthsToExperience(months, true)
        });
      }
    } else {
      const months = parseExperiencePeriodToMonths(raw);
      totalMonths = months;
      jobs.push({
        organization: raw,
        period: raw,
        months,
        formatted: formatMonthsToExperience(months, true)
      });
    }
  }

  // Fallback: Check if record.PreviousExperience has a duration string (e.g. "3 Yrs 8 Mos")
  if (totalMonths === 0 && record.PreviousExperience && record.PreviousExperience !== '-' && !/fresher/i.test(record.PreviousExperience)) {
    totalMonths = parseExperiencePeriodToMonths(record.PreviousExperience);
  }

  const isFresher = totalMonths === 0 && (
    !record.PreviousEmployment || 
    /^(fresher|none|na|n\/a|-|nil)$/i.test(record.PreviousEmployment.trim())
  );

  return {
    totalMonths: Math.round(totalMonths * 10) / 10,
    text: formatMonthsToExperience(totalMonths, true),
    fullText: formatMonthsToExperience(totalMonths, false),
    isFresher,
    jobs
  };
}

/**
 * Calculates complete employee work experience (Previous + Current + Total).
 */
export function calculateEmployeeTotalExperience(
  record: Partial<MasterEmployeeRecord>,
  asOfDate: Date = new Date()
): ExperienceBreakdown {
  const previous = calculatePreviousExperienceTotal(record);
  const current = calculateCurrentJobExperience(record, asOfDate);

  const totalMonths = Math.round((previous.totalMonths + current.months) * 10) / 10;
  const totalYearsDecimal = Math.round((totalMonths / 12) * 10) / 10;

  return {
    previousExperienceMonths: previous.totalMonths,
    previousExperienceText: previous.text,
    previousExperienceFullText: previous.fullText,

    currentExperienceMonths: current.months,
    currentExperienceText: current.text,
    currentExperienceFullText: current.fullText,

    totalExperienceMonths: totalMonths,
    totalExperienceText: formatMonthsToExperience(totalMonths, true),
    totalExperienceFullText: formatMonthsToExperience(totalMonths, false),
    totalYearsDecimal,

    currentJobStartDate: current.startDate,
    isFresher: previous.isFresher,
    previousJobsBreakdown: previous.jobs
  };
}
