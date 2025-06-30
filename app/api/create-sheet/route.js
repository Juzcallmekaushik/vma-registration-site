import { google } from "googleapis";

export async function POST(req) {
  try {
    const { clubName } = await req.json();

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet1 = meta.data.sheets.find(
      (s) => s.properties.title === "Sheet1"
    );
    if (!sheet1) {
      return new Response(
        JSON.stringify({ error: "Sheet1 not found" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const duplicateRes = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            duplicateSheet: {
              sourceSheetId: sheet1.properties.sheetId,
              newSheetName: clubName,
            },
          },
        ],
      },
    });

    const newSheetId = duplicateRes.data.replies[0].duplicateSheet.properties.sheetId;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            updateSheetProperties: {
              properties: {
                sheetId: newSheetId,
                hidden: false,
              },
              fields: "hidden",
            },
          },
        ],
      },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Google Sheets API Error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to duplicate sheet" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}