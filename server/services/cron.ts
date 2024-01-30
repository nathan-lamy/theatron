import type { sheets_v4 } from "googleapis";
import {
  MAX_DAYS_TO_CONFIRM,
  sendEventReminder,
  sendWaitListReminder,
} from "./mail";
import {
  EventInfo,
  getEventInfo,
  getMembers,
  getReminders,
  insertCheckboxes,
  listSheets,
} from "./sheets";
import { convertDateStringToDate, parseReminderDate } from "../utils/date";
import { getJobsByEventId } from "./database";

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

    const jobs = getJobsByEventId(event.id);
    for (const job of jobs) {
      // Check if job date + MAX_DAYS_TO_CONFIRM is today or before (i.e. not yet confirmed)
      const jobTime = (job.executedDate as Date).getTime();
      let maxTime = jobTime + MAX_DAYS_TO_CONFIRM * 24 * 60 * 60 * 1000;
      // Potential bug: This is taking the exact time into account, not just the date (i.e. if the job was executed at 11:59 PM, it will be deleted at 12:00 AM)
      maxTime -= 2 * 60 * 60 * 1000;
      if (maxTime <= Date.now()) {
        // TODO: Désinscription automatique si pas de réponse avec mail !
        //         Bonjour
        // Sans réponse de votre part, votre place a été réattribuée.
        // Bien cordialement
        // A. Saly
      }
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
  for (const member of members) {
    if (member.onWaitList) await sendWaitListReminder(member, event);
    else
      await sendEventReminder(member, event, {
        name: reminderName,
        daysNumber,
        optional: !isFirstReminder,
      });
  }
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
