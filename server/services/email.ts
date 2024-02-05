import { usersRepository } from "@/repositories/users";
import type { Event, User, UserRegistration } from "@prisma/client";
import Email from "email-templates";
import nodemailer from "nodemailer";

const email = new Email({
  preview: Bun.env.NODE_ENV === "development" && {
    open: {
      app: "google-chrome",
      wait: false,
    },
  },
  send: Bun.env.NODE_ENV === "production",
  transport: nodemailer.createTransport({
    host: Bun.env.SMTP_HOST,
    port: 465,
    secure: true,
    auth: {
      user: Bun.env.SMTP_USER,
      pass: Bun.env.SMTP_PASSWORD,
    },
  }),
});

export async function sendEmail(
  template: string,
  {
    user,
    event,
    registration,
    additionalData,
    includeLink = false,
  }: {
    user?: User;
    event: Event;
    registration?: UserRegistration;
    additionalData?: Record<string, any>;
    includeLink?: boolean;
  }
) {
  // If the user is not provided, get it from the registration
  if (!user) {
    user = (await usersRepository.getUserById(registration!.userId))!;
  }
  // Generate the confirmation link
  if (includeLink) {
    const link = usersRepository.generateSignedLink(user, event);
    additionalData = { ...additionalData, link };
  }
  // Send the email
  return email.send({
    template,
    message: {
      to: user.email,
    },
    locals: {
      user,
      event,
      registration,
      ...additionalData,
      functions: { toDateString },
    },
  });
}

function toDateString(date: Date) {
  // Format the date to DD/MM/YYYY
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
