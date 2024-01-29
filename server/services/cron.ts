import type { sheets_v4 } from "googleapis";
import { sendEventReminder } from "./mail";
import {
  EventInfo,
  getEventInfo,
  getMembers,
  getReminders,
  insertCheckboxes,
  listSheets,
} from "./sheets";

// Check for reminders to send today and send them
export async function boot() {
  const reminders = await getReminders(); // Request count : 2
  if (!reminders) return console.error("[CRON] No reminders found.");

  const sheets = await listSheets(); // Request count : 3
  if (!sheets) return console.error("[CRON] No sheets found.");

  for (const sheet of sheets) {
    if (!sheet?.title) continue;
    const event = await getEventInfo(sheet.title!); // Request count : 4 (one per sheet)
    if (!event) return console.error("[CRON] No event found.");

    const eventDate = convertDateStringToDate(event.date);
    for (const [i, reminder] of Object.entries(reminders)) {
      await checkForReminder(reminder, i === "0", sheet, event, eventDate);
    }
  }
}

async function checkForReminder(
  reminderName: string,
  isFirstReminder: boolean,
  sheet: sheets_v4.Schema$SheetProperties,
  event: EventInfo,
  eventDate: Date
) {
  // Check if reminder date is today
  const daysNumber = parseReminderDate(reminderName);
  if (!isReminderToday(eventDate, daysNumber)) return;
  console.log(
    `[CRON] Sending reminder ${reminderName} for event ${sheet.title}`
  );

  // Get members for this event
  const members = await getMembers(sheet.title!); // Request count : 5
  if (!members) return console.error("[CRON] No members found.");

  // Insert checkboxes for this reminder (if not already inserted)
  if (isFirstReminder) {
    const reminderStartRow = 14; // constant (row 15; 0-based)
    const reminderEndRow = reminderStartRow + members.length; // variable
    await insertCheckboxes(sheet.sheetId!, {
      // NOTE: Indexes are 0-based and END is EXCLUSIVE
      // NOTE: First value is the row index, second value is the column index
      start: [reminderStartRow, 4],
      end: [reminderEndRow, 6],
    }); // Request count : 6
  }

  // Send emails to members with this reminder
  for (const member of members.filter((m) => !m.onWaitList)) {
    await sendEventReminder(member, event, {
      name: reminderName,
      daysNumber,
      optional: !isFirstReminder,
    });
    // TODO: Mark reminder as sent in local database (to avoid sending it again)
  }

  // TODO: Send job report mail to admin (with the number of emails sent : success / failure / title / date / reminder / timeTaken)
}

function convertDateStringToDate(dateString: string) {
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

function parseReminderDate(date: string) {
  date = date.replace(/ /g, "").replace("J-", "");
  const numberOfDays = parseInt(date, 10);
  return numberOfDays;
}

function isReminderToday(eventDate: Date, reminderDays: number) {
  // Subtract the number of days from the event date
  const reminderDate = new Date(eventDate);
  reminderDate.setUTCDate(reminderDate.getDate() - reminderDays);
  // Get today's date
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  // If the reminder date is today, return true
  return reminderDate.getTime() === today.getTime();
}
