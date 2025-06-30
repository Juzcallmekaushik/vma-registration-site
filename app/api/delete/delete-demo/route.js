import { google } from "googleapis";

export async function POST(req) {
  try {
    const bodyText = await req.text();
    const { idNumber, schoolClub } = JSON.parse(bodyText);

    if (!idNumber || !schoolClub) {
      return new Response(JSON.stringify({ error: "ID number and school club are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetResponse = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
    });

    const clubSheet = spreadsheetResponse.data.sheets.find(
      (sheet) => sheet.properties.title === schoolClub
    );

    if (!clubSheet) {
      return new Response(JSON.stringify({ error: `Sheet for club "${schoolClub}" not found` }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${schoolClub}!T:Y`,
    });

    const rows = response.data.values || [];
    
    const rowIndex = rows.findIndex((row) => row[4] === idNumber);
    
    if (rowIndex === -1) {
      return new Response(JSON.stringify({ error: "Demo team member with ID number not found in the sheet" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const actualRowNumber = rowIndex + 1;

    const remainingDataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${schoolClub}!T${actualRowNumber + 1}:Y`,
    });

    const remainingRows = remainingDataResponse.data.values || [];

    const totalDemoRows = rows.length;
    if (totalDemoRows > 0) {
      await sheets.spreadsheets.values.clear({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: `${schoolClub}!T${actualRowNumber}:Y${actualRowNumber + totalDemoRows - 1}`,
      });

      if (remainingRows.length > 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: process.env.GOOGLE_SHEET_ID,
          range: `${schoolClub}!T${actualRowNumber}:Y${actualRowNumber + remainingRows.length - 1}`,
          valueInputOption: "RAW",
          requestBody: {
            values: remainingRows,
          },
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Google Sheets API Error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to delete demo team member from Google Sheet" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
