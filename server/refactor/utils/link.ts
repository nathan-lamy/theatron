import { createHmac, timingSafeEqual } from "node:crypto";

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
}: {
  eventId: string;
  email: string;
}) => {
  const url = new URL(Bun.env.FRONTEND_URL!);
  url.pathname = "/confirm/" + eventId;
  url.searchParams.set("token", generateToken({ eventId, email }));
  url.searchParams.set("email", email);
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
