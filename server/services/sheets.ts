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
// TODO: Move to env variables
const G_SPREADSHEET_ID = "1gHVJM1qo-aWGFBxXWDbd0NtCJY_Gd6_v_NF3SgZ8MZ8";

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
export async function listSheets(auth: OAuth2Client) {
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.get({
    spreadsheetId: G_SPREADSHEET_ID,
  });
  //   TODO: Blacklist sheets (e.g. "Template")
  return res.data.sheets?.map((sheet) => sheet.properties);
}

export async function getSheetValue(
  auth: OAuth2Client,
  sheetTitle: string,
  range: string
) {
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: G_SPREADSHEET_ID,
    range: `${sheetTitle}!${range}`,
  });
  return res.data.values;
}

export async function getSheetValues(
  auth: OAuth2Client,
  sheetTitle: string,
  ranges: string[]
) {
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: G_SPREADSHEET_ID,
    ranges: ranges.map((range) => `${sheetTitle}!${range}`),
  });
  return res.data.valueRanges?.map((v) => v.values);
}

export interface EventInfo {
  id: string;
  title: string;
  date: string;
  details?: string;
  reminders: { [key: number]: string };
}

// TODO: Improve performance by using batchGet for multiple events
export const getEventInfo = async (
  auth: OAuth2Client,
  eventName: string
): Promise<EventInfo | undefined> => {
  const sheetData = await getSheetValues(auth, eventName, ["B3:B9", "F3:F8"]);
  if (sheetData && sheetData[0] && sheetData[1]) {
    // Destructure data for better readability
    const [[title], [date]] = sheetData[0];
    // Reverse the detailsData array for easier access to the last element
    const detailsData = sheetData[0].reverse()[0];
    // Extract details from the reversed detailsData array
    const details = detailsData && detailsData[0]?.split(";")[1];
    // Create reminders object using Object.fromEntries
    const reminders = Object.fromEntries(
      sheetData[1]
        .map(([name], index) => [index, name])
        .filter((entry) => entry[1])
    );
    return {
      id: eventName,
      title,
      date,
      details,
      reminders,
    };
  }
};

export const getMembers = async (auth: OAuth2Client, eventName: string) => {
  // TODO: Add a way to get the range dynamically (not only 100 rows)
  const sheetData = await getSheetValue(auth, eventName, "15:100");
  if (sheetData) {
    return sheetData
      .map(
        ([lastName, firstName, email, isRegistered, _, ...reminders], i) => ({
          lastName,
          firstName,
          email,
          reminders: Object.fromEntries(
            reminders.map((reminder, index) => [index, reminder === "TRUE"])
          ),
          isRegistered: isRegistered === "TRUE",
          uid: 15 + i,
        })
      )
      .filter((member) => member.email);
  }
};

export async function updateCellValue(
  auth: OAuth2Client,
  sheetTitle: string,
  cell: string,
  value: string
) {
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.update({
    spreadsheetId: G_SPREADSHEET_ID,
    range: `${sheetTitle}!${cell}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[value]],
    },
  });
  return res.data;
}

// !CAUTION: index is 0-based and END is EXCLUSIVE
export async function insertCheckboxes(
  auth: OAuth2Client,
  sheetId: number,
  range: { start: number[]; end: number[] }
) {
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.batchUpdate({
    spreadsheetId: G_SPREADSHEET_ID,
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

// TODO: Brouillon
(async () => {
  await boot();
  const [sheet] = (await listSheets(client))!;
  const values = await getMembers(client, sheet?.title!);
  console.log(values);
  //   const data = await getSheetValues(client, sheet?.title!, ["B3:B9", "F3:F8"]);
  // console.log(
  //   await insertCheckboxes(client, sheet?.sheetId!, {
  //     start: [16 - 1, 6 - 1],
  //     // EXCLUSIVE
  //     end: [17, 10],
  //   })
  // );
  // console.log(await updateCellValue(client, sheet?.title!, "F17", "FALSE"));
})();
