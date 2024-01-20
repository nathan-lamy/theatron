import { timingSafeEqual } from "node:crypto";

// Email short link : /confirm/:eventId?email=:email&token=:token
const eventId = "001";
const email = "test@helloword.com";

// GENERATE TOKEN
function generateToken(eventId: string, email: string) {
  const hasher = new Bun.CryptoHasher("sha1");
  hasher.update(eventId + ":" + email);
  // @ts-expect-error
  return hasher.digest().toString("hex");
}
const token = generateToken(eventId, email);
console.log(token);

// VERIFY TOKEN
const checkToken = generateToken(eventId, email);
// Do not use == or === to compare tokens (timing attack)
console.log(timingSafeEqual(Buffer.from(token), Buffer.from(checkToken)));

// VERIFY TOKEN (invalid)
const checkToken2 = generateToken(eventId, "something else");
console.log(timingSafeEqual(Buffer.from(token), Buffer.from(checkToken2)));
