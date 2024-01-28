import { sign } from "hono/jwt";
import { createHmac, timingSafeEqual } from "node:crypto";
import { Member, Reminder } from "../services/sheets";
import { calculateConfirmBeforeDate } from "./date";

// Use HMAC to generate a token (SHA1)
const generateToken = ({
  eventId,
  email,
}: {
  eventId: string;
  email: string;
}) =>
  createHmac("sha1", Bun.env.HMAC_KEY!)
    .update(eventId + ":" + email)
    .digest("hex");

// Generate short link for email (ex: https://example.fr/confirm/1234567890?email=foo%40bar.com&token=1234567890abcdef&i=1)
export const generateShortLink = ({
  eventId,
  email,
  reminder,
}: {
  eventId: string;
  email: string;
  reminder: Reminder;
}) => {
  const url = new URL(Bun.env.FRONTEND_URL!);
  url.pathname = "/confirm/" + eventId;
  url.searchParams.set("token", generateToken({ eventId, email }));
  url.searchParams.set("email", email);
  url.searchParams.set("i", reminder.daysNumber!.toString());
  return url.toString();
};

// Verify token from short link
export const verifyShortLink = ({
  eventId,
  email,
  token,
}: {
  eventId: string;
  email: string;
  token: string;
}) =>
  timingSafeEqual(
    Buffer.from(token),
    Buffer.from(generateToken({ eventId, email }))
  );

// // Generate JWT token (after clicking on short link) with event, reminder and user data, used by frontend to display event details
// export const generateJWT = (member: Member, event: Event, reminder: Reminder) =>
//   // TODO: Encode only the necessary data (to reduce token size)
//   sign(
//     {
//       event,
//       reminder: {
//         ...reminder,
//         confirmBeforeDate: calculateConfirmBeforeDate(),
//       },
//       user: {
//         name: `${member.firstName} ${member.lastName}`,
//         email: member.email,
//         uid: member.uid,
//       },
//     },
//     Bun.env.JWT_SECRET!
//   );
