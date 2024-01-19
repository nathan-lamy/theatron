import { EventInfo, Member, Reminder } from "./sheets";
import { sign } from "hono/jwt";
import nodemailer from "nodemailer";

// TODO: Retrieve from sheets config
const MAX_DAYS_TO_CONFIRM = 4;
const [SMTP_HOST, SMTP_USER, SMTP_PASSWORD] = [
  "smtp.gmail.com",
  process.env.SMTP_USER,
  process.env.SMTP_PASSWORD,
];

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
  // Load mail template
  const { text, html } = await loadMailTemplate(
    "mails/" + (reminder.optional ? "reminder" : "confirm"),
    {
      member,
      event,
      reminder,
      token,
    }
  );
  // Send mail
  await sendMail(
    member.email,
    `${reminder.optional ? "[RAPPEL]" : "[CONFIRMATION]"} ${event.title} ${
      event.details
    }`,
    { text, html }
  );
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

function numberToWordsInFrench(number: number) {
  const units = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept"];
  return units[number];
}

function getRelativeTimeInFrench(numberOfDays: number) {
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

async function loadMailTemplate(
  fileName: string,
  {
    member,
    event,
    reminder,
    token,
  }: { member: Member; event: EventInfo; reminder: Reminder; token: string }
) {
  let templates = [
    await Bun.file(fileName + ".txt").text(),
    await Bun.file(fileName + ".html").text(),
  ];
  const variables = {
    "{{user.name}}": member.firstName + " " + member.lastName,
    "{{event.name}}": event.title,
    "{{event.details}}": event.details,
    "{{event.confirmBeforeDate}}": dateToFrenchString(
      calculateConfirmBeforeDate()
    ),
    "{{link}}":
      removeTrailingSlash(Bun.env.FRONTEND_URL!) + "/confirm?token=" + token,
    "{{event.relativeDate}}": getRelativeTimeInFrench(reminder.daysNumber!),
  };
  templates = templates.map((template) =>
    Object.entries(variables).reduce(
      (template, [key, value]) => template.replaceAll(key, value),
      template
    )
  );
  return { text: templates[0], html: templates[1] };
}

const removeTrailingSlash = (str: string) => str.replace(/\/$/, "");

export let transporter: nodemailer.Transporter;

export function boot() {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: 465,
    secure: true,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  });
}

export async function sendMail(
  email: string,
  subject: string,
  { text, html }: { text: string; html: string }
) {
  const message = await transporter.sendMail({
    from: SMTP_USER,
    to: email,
    subject,
    text,
    html,
  });
  console.log("Message sent: %s", message.messageId);
}
