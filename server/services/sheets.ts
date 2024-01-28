import fs from "fs/promises";
import path from "path";
import process from "process";
import { authenticate } from "@google-cloud/local-auth";
import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");
// TODO: Move credentials.json to a more secure location
// TODO: Add a way to refresh the token

// Reads previously authorized credentials from the save file.
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content.toString());
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

// Serializes credentials to a file compatible with GoogleAuth.fromJSON.
async function saveCredentials(client: OAuth2Client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content.toString());
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

// Load or request or authorization to call APIs.
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client as OAuth2Client;
  }
  const newClient = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (newClient.credentials) {
    await saveCredentials(newClient);
  }
  return newClient;
}

// Global client
export let client!: OAuth2Client;
export async function boot() {
  client = await authorize();
}

// List all sheets in the spreadsheet
export async function listSheets() {
  const sheets = google.sheets({ version: "v4", auth: client });
  const res = await sheets.spreadsheets.get({
    spreadsheetId: Bun.env.G_SPREADSHEET_ID,
  });
  return res.data.sheets
    ?.map((sheet) => sheet.properties)
    .filter(
      (sheet) =>
        sheet &&
        sheet.title !== Bun.env.SETTINGS_SHEET_NAME &&
        sheet.title !== Bun.env.TEMPLATE_SHEET_NAME
    );
}

export async function getSheetValue(sheetTitle: string, range: string) {
  const sheets = google.sheets({ version: "v4", auth: client });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: Bun.env.G_SPREADSHEET_ID,
    range: `${sheetTitle}!${range}`,
  });
  return res.data.values;
}

export async function getSheetValues(sheetTitle: string, ranges: string[]) {
  const sheets = google.sheets({ version: "v4", auth: client });
  const res = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: Bun.env.G_SPREADSHEET_ID,
    ranges: ranges.map((range) => `${sheetTitle}!${range}`),
  });
  return res.data.valueRanges?.map((v) => v.values);
}

export interface EventInfo {
  id: string;
  title: string;
  date: string;
  details: string;
}

// TODO: Improve performance by using batchGet for multiple events
export const getEventInfo = async (
  eventName: string
): Promise<EventInfo | undefined> => {
  const sheetData = await getSheetValue(eventName, "B3:B9");
  if (sheetData) {
    // Destructure data for better readability
    const [[title], [date]] = sheetData;
    // Reverse the detailsData array for easier access to the last element
    const detailsData = sheetData.reverse()[0];
    // Extract details from the reversed detailsData array
    const details = detailsData ? detailsData[0]?.split(";")[1] : null;
    return {
      id: eventName,
      title,
      date,
      details,
    };
  }
};

export type Reminder = {
  name: string;
  optional: boolean;
  daysNumber?: number;
};

export const getReminders = async () => {
  const sheetData = await getSheetValue(Bun.env.SETTINGS_SHEET_NAME!, "B6:C15");
  if (sheetData) {
    return Object.fromEntries(
      sheetData
        .map(
          ([reminder, optional], i) =>
            [i, { name: reminder, optional: optional !== "TRUE" }] as [
              number,
              Reminder
            ]
        )
        .filter(([_, { name }]) => name)
    );
  }
};

export type Member = {
  lastName: string;
  firstName: string;
  email: string;
  reminders: Record<number, boolean>;
  uid: number;
};

export const getMembers = async (eventName: string) => {
  // TODO: Add a way to get the range dynamically (not only 100 rows)
  const sheetData = await getSheetValue(eventName, "15:100");
  if (sheetData) {
    return sheetData
      .map(
        (
          [lastName, firstName, email, priority, onWaitlist, _, ...reminders],
          i
        ) => ({
          lastName,
          firstName,
          email,
          priority,
          onWaitlist,
          reminders: Object.fromEntries(
            reminders.map((reminder, index) => [index, reminder === "TRUE"])
          ),
          uid: 15 + i,
        })
      )
      .filter((member) => member.email);
  }
};

export async function updateCellValue(
  sheetTitle: string,
  cell: string,
  value: string
) {
  const sheets = google.sheets({ version: "v4", auth: client });
  const res = await sheets.spreadsheets.values.update({
    spreadsheetId: Bun.env.G_SPREADSHEET_ID,
    range: `${sheetTitle}!${cell}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[value]],
    },
  });
  return res.data;
}

// CAUTION: index is 0-based and END is EXCLUSIVE
export async function insertCheckboxes(
  sheetId: number,
  range: { start: number[]; end: number[] }
) {
  const sheets = google.sheets({ version: "v4", auth: client });
  const res = await sheets.spreadsheets.batchUpdate({
    spreadsheetId: Bun.env.G_SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: range.start[0],
              endRowIndex: range.end[0],
              startColumnIndex: range.start[1],
              endColumnIndex: range.end[1],
            },
            fields: "dataValidation",
            cell: {
              dataValidation: {
                condition: {
                  type: "BOOLEAN",
                },
              },
            },
          },
        },
      ],
    },
  });
  return res.data;
}

export async function getEventAndMemberInfo({
  email,
  eventId,
}: {
  email: string;
  eventId: string;
}) {
  const members = await getMembers(eventId);
  const member = members?.find((member) => member.email === email);
  const event = await getEventInfo(eventId);
  return { member, event };
}

// TODO: Brouillon
// (async () => {
// console.log(await updateCellValue(client, sheet?.title!, "F17", "FALSE"));
// })();
