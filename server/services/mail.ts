import { EventInfo, Member, Reminder } from "./sheets";
import nodemailer from "nodemailer";
import { generateShortLink } from "../utils/link";
import {
  calculateConfirmBeforeDate,
  getRelativeTimeInFrench,
} from "../utils/date";

// TODO: Retrieve from sheets config
const [SMTP_HOST, SMTP_USER, SMTP_PASSWORD] = [
  "smtp.gmail.com",
  process.env.SMTP_USER,
  process.env.SMTP_PASSWORD,
];

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

export const sendEventReminder = async (
  member: Member,
  event: EventInfo,
  reminder: Reminder
) => {
  // Load mail template
  const { text, html } = await loadMailTemplate(
    "mails/" + (reminder.optional ? "reminder" : "confirm"),
    {
      member,
      event,
      reminder,
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

async function loadMailTemplate(
  fileName: string,
  {
    member,
    event,
    reminder,
  }: { member: Member; event: EventInfo; reminder: Reminder }
) {
  let templates = [
    await Bun.file(fileName + ".txt").text(),
    await Bun.file(fileName + ".html").text(),
  ];
  const variables = {
    "{{user.name}}": member.firstName + " " + member.lastName,
    "{{event.name}}": event.title,
    "{{event.details}}": event.details,
    "{{event.confirmBeforeDate}}": calculateConfirmBeforeDate(),
    "{{link}}": generateShortLink({
      eventId: event.id,
      email: member.email,
      reminder,
    }),
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
