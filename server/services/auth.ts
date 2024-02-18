import { createHmac, timingSafeEqual } from "node:crypto";
import type { Event, User } from "@prisma/client";

class AuthService {
  /**
   * Verify token from signed link
   */
  public verifyToken(
    token: string,
    { eventId, email }: { eventId: string; email: string }
  ) {
    return timingSafeEqual(
      Buffer.from(token),
      Buffer.from(this.generateToken(email, eventId))
    );
  }

  /**
   * Generate signed link for confirmation
   */
  public generateSignedLink(user: User, event: Event) {
    const url = new URL(Bun.env.FRONTEND_URL!);
    url.pathname = "/confirm/" + event.id;
    url.searchParams.set("token", this.generateToken(user.email, event.id));
    url.searchParams.set("email", user.email);
    return url.toString();
  }

  /**
   * Generate token for signed link
   */
  private generateToken(email: string, eventId: number | string) {
    return createHmac("sha1", Bun.env.HMAC_KEY!)
      .update(email + ":" + eventId)
      .digest("hex");
  }
}

export const auth = new AuthService();
