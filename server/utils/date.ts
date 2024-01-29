import { MAX_DAYS_TO_CONFIRM } from "../services/mail";

// Calculate the date in french format (DD/MM/YYYY) in x days from now
export function calculateConfirmBeforeDate(maxDaysToConfirm?: number) {
  const confirmBefore = new Date();
  confirmBefore.setUTCDate(
    confirmBefore.getDate() + (maxDaysToConfirm || MAX_DAYS_TO_CONFIRM)
  );
  confirmBefore.setUTCHours(0, 0, 0, 0);
  return dateToFrenchString(confirmBefore);
}

// Convert a Date object to a french date string (DD/MM/YYYY)
export function dateToFrenchString(date: Date) {
  // FORMAT: DD/MM/YYYY
  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

// Calculate the number of days between two dates and return the result in french (ex: un jour, deux jours, une semaine, deux semaines) (only works for numbers between 0 and 7*7=49)
export function getRelativeTimeInFrench(numberOfDays: number) {
  const daysInWeek = 7;

  if (numberOfDays >= daysInWeek) {
    const numberOfWeeks = Math.floor(numberOfDays / daysInWeek);
    return `${numberToWordsInFrench(numberOfWeeks)} semaine${
      numberOfWeeks > 1 ? "s" : ""
    }`;
  } else {
    return `${numberToWordsInFrench(numberOfDays)} jour${
      numberOfDays > 1 ? "s" : ""
    }`;
  }
}

// Convert a number to a french word (ex: 1 => "un") (only works for numbers between 0 and 7)
function numberToWordsInFrench(number: number) {
  const units = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept"];
  return units[number];
}
