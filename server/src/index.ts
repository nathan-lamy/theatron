import runner from "@/services/runner";
import app from "./app";
import { prisma } from "./setup";

// Connect to the database
prisma.$connect().then(() => {
  console.log("🦊 Database connected");

  // Start the job runner
  runner();

  // Start the server
  app.listen(3333, () =>
    console.log(
      `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
    )
  );
});
