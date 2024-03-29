import { event } from "@/models/event";
import { userRegistration } from "@/models/registation";
import { user } from "@/models/user";
import { PrismaClient } from "@prisma/client";

// Composed of various plugins to be used as a Service Locator
export const prisma = new PrismaClient().$extends({
  model: {
    userRegistration,
    event,
    user,
  },
});
