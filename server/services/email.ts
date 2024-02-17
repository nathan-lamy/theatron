import { usersRepository } from "@/repositories/users";
import type { Event, User, UserRegistration } from "@prisma/client";
import Email from "email-templates";

const email = new Email({
  preview: false,
  // Bun.env.NODE_ENV === "development" && {
  //   open: {
  //     app: "google-chrome",
  //     wait: false,
  //   },
  // },
  send: true,
  // send: Bun.env.NODE_ENV === "production",
  transport: {
    host: Bun.env.SMTP_HOST,
    port: 465,
    secure: true,
    auth: {
      user: Bun.env.SMTP_USER,
      pass: Bun.env.SMTP_PASSWORD,
    },
  },
});

const SMTP_FROM = `${Bun.env.SMTP_FROM_NAME} <${Bun.env.SMTP_FROM_EMAIL}>`;

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
      from: SMTP_FROM,
      to: user.email,
    },
    locals: {
      user,
      event,
      registration: {
        ...registration,
        confirmBefore: toDateString(registration!.confirmBefore!),
      },
      ...additionalData,
    },
  });
}

export async function sendRegistrationConfirmation(user: User) {
  // Retrieve the user's registrations
  const registrations = await usersRepository.getUserRegistrations(user);
  if (!registrations) return;
  // Send the email
  return email.send({
    template: "registered",
    message: {
      from: SMTP_FROM,
      to: user.email,
    },
    locals: {
      user,
      registrations: registrations
        .map((registration) => ({
          ...registration,
          event: {
            ...registration.event,
            date: toDateString(registration.event.date),
          },
        }))
        .sort((a, b) => a.priority - b.priority),
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
