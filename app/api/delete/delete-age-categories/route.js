import { google } from "googleapis";

export async function POST(req) {
  try {
    const bodyText = await req.text();    
    const parsedBody = JSON.parse(bodyText);
    
    const { idNumber } = parsedBody;
    
    if (!idNumber) {
      console.error("Missing idNumber in request");
      return new Response(
        JSON.stringify({ error: "ID number is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Get the Age Categories sheet ID
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const ageCategoriesSheet = meta.data.sheets.find(
      (s) => s.properties.title === "Age Categories"
    );

    if (!ageCategoriesSheet) {
      return new Response(
        JSON.stringify({ error: "Age Categories sheet not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const sheetId = ageCategoriesSheet.properties.sheetId;

    // Get all data from Age Categories sheet across all column ranges
    const columnRanges = ["A:H", "J:Q", "S:Z", "AB:AI"];
    let foundRow = null;
    let foundRange = null;

    for (const range of columnRanges) {
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `Age Categories!${range}`,
        });

        const rows = response.data.values || [];
        
        // Find the row with the matching ID number (column C in each range, index 2)
        const rowIndex = rows.findIndex((row, index) => 
          index > 1 && row && row[2] && row[2].toString().trim() === idNumber.toString().trim()
        );
        
        if (rowIndex !== -1) {
          foundRow = rowIndex;
          foundRange = range;
          break;
        }
      } catch (err) {
        console.log(`Error checking range ${range}:`, err);
        continue;
      }
    }
    
    if (foundRow === null) {
      return new Response(
        JSON.stringify({ 
          error: "Participant with ID number not found in Age Categories sheet",
          details: { searchedId: idNumber }
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get the sheet range data to rebuild without the deleted row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `Age Categories!${foundRange}`,
    });

    const rows = response.data.values || [];
    const updatedRows = rows.filter((row, index) => index !== foundRow);

    // Clear the range and rewrite without the deleted row
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `Age Categories!${foundRange}`,
    });

    if (updatedRows.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Age Categories!${foundRange}`,
        valueInputOption: "RAW",
        requestBody: {
          values: updatedRows,
        },
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Participant deleted from Age Categories sheet" 
      }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Google Sheets API Error:", err);
    console.error("Error details:", {
      message: err.message,
      code: err.code,
      errors: err.errors
    });
    return new Response(
      JSON.stringify({ 
        error: "Failed to delete from Age Categories sheet",
        details: err.message 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
