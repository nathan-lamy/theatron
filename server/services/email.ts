import { usersRepository } from "@/repositories/users";
import { Event, User } from "@prisma/client";
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

export default async function sendEmail(
  template: string,
  {
    user,
    event,
    additionalData,
  }: {
    user: number | User;
    event: Event;
    additionalData?: Record<string, any>;
  }
) {
  if (typeof user === "number") {
    user = (await usersRepository.getUserById(user))!;
  }
  await email.send({
    template,
    message: {
      to: user.email,
    },
    locals: {
      user,
      event,
      ...additionalData,
      functions: {},
    },
  });
}

// TODO: Confirm before date
