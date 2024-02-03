import { EventInfo, Member, Reminder, getMailSettings } from "./sheets";
import nodemailer from "nodemailer";
import { generateShortLink } from "../../utils/link";
import {
  calculateConfirmBeforeDate,
  getRelativeTimeInFrench,
} from "../../utils/date";
import { checkJob, insertJob } from "./database";

export let transporter: nodemailer.Transporter;
export let MAX_DAYS_TO_CONFIRM: number;
export let SMTP_USER: string;
export let CRON_HOUR: string;

export async function boot() {
  const settings = await getMailSettings();
  if (!settings) throw new Error("Missing mail settings");
  MAX_DAYS_TO_CONFIRM = settings.maxDaysToConfirm;
  SMTP_USER = settings.user;
  CRON_HOUR = settings.jobTime;
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
  const emailId = reminder.optional ? "reminder" : "confirm";
  // Check if mail has already been sent
  if (checkJob(event.id, member.email, emailId)) return;
  // Load mail template
  const { text, html } = await loadMailTemplate("mails/" + emailId, {
    member,
    event,
    reminder,
  });
  // Send mail
  await sendMail(
    member.email,
    `${reminder.optional ? "[RAPPEL]" : "[CONFIRMATION]"} ${event.title} ${
      event.details
    }`,
    { text, html }
  );
  insertJob(event.id, member.email, emailId);
};

export const sendWaitListReminder = async (
  member: Member,
  event: EventInfo
) => {
  // Check if mail has already been sent
  if (checkJob(event.id, member.email, "on_wait_list")) return;
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
  insertJob(event.id, member.email, "on_wait_list");
};

export const sendWaitListAlert = async (member: Member, event: EventInfo) => {
  // Check if mail has already been sent
  if (checkJob(event.id, member.email, "confirm")) return;
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
  insertJob(event.id, member.email, "confirm");
};

export const sendEventExpired = async (member: Member, event: EventInfo) => {
  // Load mail template
  const { text } = await loadMailTemplate("mails/expired", {
    member,
    event,
    textOnly: true,
  });
  // Send mail
  await sendMail(member.email, `[ANNULATION] ${event.title} ${event.details}`, {
    text,
  });
  insertJob(event.id, member.email, "expired");
};

async function loadMailTemplate(
  fileName: string,
  {
    member,
    event,
    reminder,
    isOnWaitList,
    textOnly,
  }: {
    member: Member;
    event: EventInfo;
    reminder?: Reminder;
    isOnWaitList?: boolean;
    textOnly?: boolean;
  }
) {
  let templates = [await Bun.file(fileName + ".txt").text()];
  if (!textOnly) templates.push(await Bun.file(fileName + ".html").text());

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
  { text, html }: { text: string; html?: string }
) {
  const message = await transporter.sendMail({
    from: SMTP_USER,
    to: email,
    subject,
    text,
    html,
  });
  console.log("[MAIL] Message sent: %s", message.messageId);
}