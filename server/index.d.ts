// Export hono and redefine the type of the request object to add the data property
import { EventInfo, Member } from "./services/sheets";

declare module "hono" {
  export interface HonoRequest {
    data: {
      member: Member;
      event: EventInfo;
    };
  }
}
