import { Database } from "bun:sqlite";

// interface Job {
//   id: number;
//   eventId: string;
//   userEmail: string;
//   emailId: string;
//   executedDate: string;
// }

const db = new Database("database.sqlite");

// Create jobs table if it doesn't exist
db.query(
  `
  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventId TEXT,
    userEmail TEXT,
    emailId TEXT,
    executedDate TEXT
  )
`
).run();

// Function to insert a job with emailId
export function insertJob(eventId: string, userEmail: string, emailId: string) {
  const currentDate = new Date().toISOString();
  return db
    .query(
      `
    INSERT INTO jobs (eventId, userEmail, emailId, executedDate)
    VALUES (?, ?, ?, ?)
  `
    )
    .run(eventId, userEmail, emailId, currentDate);
}

// Function to check if a job has already been run
export const checkJob = (eventId: string, userEmail: string, emailId: string) =>
  !!getJobDate(eventId, userEmail, emailId);

// Function to retrieve the executed date of a job
export function getJobDate(
  eventId: string,
  userEmail: string,
  emailId: string
) {
  const result = db
    .query(
      `
    SELECT executedDate
    FROM jobs
    WHERE eventId = ? AND userEmail = ? AND emailId = ?
  `
    )
    .get(eventId, userEmail, emailId) as { executedDate: number } | undefined;
  if (result) return new Date(result.executedDate);
  return false;
}
