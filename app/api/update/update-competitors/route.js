import { google } from "googleapis";

export async function POST(req) {
  try {
    const bodyText = await req.text();
    const { 
      oldIdNumber, 
      fullName, 
      dob, 
      age,
      category,
      gender, 
      idNumber, 
      height,
      weight,
      kup,
      events,
      fee,
      schoolClub 
    } = JSON.parse(bodyText);

    if (!oldIdNumber || !schoolClub) {
      return new Response(JSON.stringify({ error: "Old ID number and school club are required" }), {
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
      range: `${schoolClub}!A:K`,
    });

    const rows = response.data.values || [];
    
    let rowIndex = -1;
    let idColumnIndex = -1;
    
    rowIndex = rows.findIndex((row) => row && row[1] && row[1].toString().trim() === oldIdNumber.toString().trim());
    idColumnIndex = 1;

    if (rowIndex === -1) {
      rowIndex = rows.findIndex((row) => row && row[4] && row[4].toString().trim() === oldIdNumber.toString().trim());
      idColumnIndex = 4;
    }
    
    if (rowIndex === -1) {
      return new Response(JSON.stringify({ 
        error: "Competitor with old ID number not found in the sheet", 
        details: {
          searchedId: oldIdNumber,
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
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${schoolClub}!A${actualRowNumber}:J${actualRowNumber}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[fullName, idNumber, gender, dob, age, category, height, weight, kup, events, schoolClub]],
      },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Google Sheets API Error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to update competitor in Google Sheet" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
