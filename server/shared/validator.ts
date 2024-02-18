import { t } from "elysia";

/**
 * The validator for the email address
 */
export const email = t.String({
  format: "email",
  default: "saly.adrien@ac-nice.fr",
});
