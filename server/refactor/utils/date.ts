import { MAX_DAYS_TO_CONFIRM } from "../old/services/mail";
import { REMINDERS } from "../old/services/sheets";

// Calculate the date in french format (DD/MM/YYYY) in x days from now
export function calculateConfirmBeforeDate() {
  const confirmBefore = new Date();
  confirmBefore.setUTCDate(confirmBefore.getDate() + MAX_DAYS_TO_CONFIRM);
  confirmBefore.setUTCHours(0, 0, 0, 0);
  return dateToFrenchString(confirmBefore);
}

export function calculateConfirmBeforeFromEventDate(eventDate: Date) {
  const confirmBefore = new Date(eventDate);
  const daysBefore = parseReminderDate(REMINDERS["0"]);
  confirmBefore.setUTCDate(
    confirmBefore.getDate() - daysBefore + MAX_DAYS_TO_CONFIRM
  );
  confirmBefore.setUTCHours(0, 0, 0, 0);
  // Check if the confirmBefore date is not greater than the event date
  return dateToFrenchString(
    confirmBefore > eventDate ? eventDate : confirmBefore
  );
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

// Convert a date string (DD/MM/YYYY) to a Date object
export function convertDateStringToDate(dateString: string) {
  // Split the date string into day, month, and year
  const dateParts = dateString.split("/");
  const day = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1; // Months in JavaScript are zero-indexed (0-11)
  const year = parseInt(dateParts[2], 10);

  // Create a Date object from the UTC date parts
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month, day);
  return date;
}

// Parse a reminder date string (ex: "J-2") and return the number of days (ex: 2)
export function parseReminderDate(date: string) {
  date = date.replace(/ /g, "").replace("J-", "");
  const numberOfDays = parseInt(date, 10);
  return numberOfDays;
}
