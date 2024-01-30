import { EventInfo, Member, Reminder, getMailSettings } from "./sheets";
import nodemailer from "nodemailer";
import { generateShortLink } from "../utils/link";
import {
  calculateConfirmBeforeDate,
  getRelativeTimeInFrench,
} from "../utils/date";

export let transporter: nodemailer.Transporter;
export let MAX_DAYS_TO_CONFIRM: number;
export let SMTP_USER: string;

export async function boot() {
  const settings = await getMailSettings();
  if (!settings) throw new Error("Missing mail settings");
  MAX_DAYS_TO_CONFIRM = settings.maxDaysToConfirm;
  SMTP_USER = settings.user;
  const { host, user, pass } = settings;
  transporter = nodemailer.createTransport({
    host,
    port: 465,
    secure: true,
    auth: {
      user,
      pass,
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

export const sendWaitListReminder = async (
  member: Member,
  event: EventInfo
) => {
  // Load mail template
  const { text, html } = await loadMailTemplate("mails/on_wait_list", {
    member,
    event,
  });
  // Send mail
  await sendMail(
    member.email,
    `[LISTE D'ATTENTE] ${event.title} ${event.details}`,
    {
      text,
      html,
    }
  );
};

export const sendWaitListAlert = async (member: Member, event: EventInfo) => {
  // Load mail template
  const { text, html } = await loadMailTemplate("mails/confirm", {
    member,
    event,
    isOnWaitList: true,
  });
  // Send mail
  await sendMail(
    member.email,
    `[CONFIRMATION] ${event.title} ${event.details}`,
    { text, html }
  );
};

async function loadMailTemplate(
  fileName: string,
  {
    member,
    event,
    reminder,
    isOnWaitList,
  }: {
    member: Member;
    event: EventInfo;
    reminder?: Reminder;
    isOnWaitList?: boolean;
  }
) {
  let templates = [
    await Bun.file(fileName + ".txt").text(),
    await Bun.file(fileName + ".html").text(),
  ];
  const variables = {
    "{{header}}": isOnWaitList
      ? "Des suites d'un désistement, une place a pu vous être attribuée pour le spectacle suivant :"
      : "Vous êtes pré-inscrit au spectacle suivant :",
    "{{user.name}}": member.firstName + " " + member.lastName,
    "{{event.name}}": event.title,
    "{{event.details}}": event.details,
    "{{event.confirmBeforeDate}}": calculateConfirmBeforeDate(),
    "{{link}}": generateShortLink({
      eventId: event.id,
      email: member.email,
    }),
  } as Record<string, string>;
  // REMINDER ONLY
  if (reminder)
    variables["{{event.relativeDate}}"] = getRelativeTimeInFrench(
      reminder.daysNumber!
    );
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
