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
      range: `${schoolClub}!A:L`,
    });

    const rows = response.data.values || [];
    
    let rowIndex = -1;
    let idColumnIndex = -1;
    
    rowIndex = rows.findIndex((row) => row && row[1] && row[1].toString().trim() === idNumber.toString().trim());
    idColumnIndex = 1;
    
    if (rowIndex === -1) {
      rowIndex = rows.findIndex((row) => row && row[4] && row[4].toString().trim() === idNumber.toString().trim());
      idColumnIndex = 4;
    }
    
    if (rowIndex === -1) {
      return new Response(JSON.stringify({ 
        error: "Competitor with ID number not found in the sheet", 
        details: {
          searchedId: idNumber,
          sheetName: schoolClub,
          totalRows: rows.length,
          firstFewRows: rows.slice(0, 3)
        }
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const actualRowNumber = rowIndex + 1;

    const remainingDataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${schoolClub}!A${actualRowNumber + 1}:L`,
    });

    const remainingRows = remainingDataResponse.data.values || [];

    const totalCompetitorRows = rows.length;
    if (totalCompetitorRows > 0) {
      await sheets.spreadsheets.values.clear({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: `${schoolClub}!A${actualRowNumber}:L${actualRowNumber + totalCompetitorRows - 1}`,
      });

      if (remainingRows.length > 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: process.env.GOOGLE_SHEET_ID,
          range: `${schoolClub}!A${actualRowNumber}:L${actualRowNumber + remainingRows.length - 1}`,
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
      JSON.stringify({ error: "Failed to delete competitor from Google Sheet" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
