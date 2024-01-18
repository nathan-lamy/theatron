import { EventInfo, Member, Reminder } from "./sheets";
import { sign } from "hono/jwt";
// export const sendMail

// TODO: Retrieve from sheets config
const MAX_DAYS_TO_CONFIRM = 4;

export const sendEventReminder = async (
  member: Member,
  event: EventInfo,
  reminder: Reminder
) => {
  // Generate JWT token
  const token = await sign(
    {
      event,
      reminder: {
        ...reminder,
        confirmBeforeDate: dateToFrenchString(calculateConfirmBeforeDate()),
      },
      user: {
        name: `${member.firstName} ${member.lastName}`,
        email: member.email,
        uid: member.uid,
      },
    },
    Bun.env.JWT_SECRET!
  );
  console.log(token);
};

function calculateConfirmBeforeDate(
  maxDaysToConfirm: number = MAX_DAYS_TO_CONFIRM
) {
  const confirmBefore = new Date();
  confirmBefore.setUTCDate(confirmBefore.getDate() + maxDaysToConfirm);
  confirmBefore.setUTCHours(0, 0, 0, 0);
  return confirmBefore;
}

function dateToFrenchString(date: Date) {
  // FORMAT: DD/MM/YYYY
  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}
