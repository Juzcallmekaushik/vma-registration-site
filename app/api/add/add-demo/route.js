import { google } from "googleapis";

export async function POST(req) {
  try {
    const bodyText = await req.text();
    console.log("Received request body:", bodyText);
    
    const { name, dob, gender, kup, idNumber, schoolClub } = JSON.parse(bodyText);
    
    // Validate required fields
    if (!schoolClub) {
      console.error("Missing schoolClub field in request");
      return new Response(
        JSON.stringify({ error: "Missing required field: schoolClub" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    if (!name || !idNumber) {
      console.error("Missing required fields in request");
      return new Response(
        JSON.stringify({ error: "Missing required fields: name and idNumber are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    console.log("Processing demo participant data:", { name, idNumber, schoolClub });

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    console.log(`Attempting to write to sheet: ${schoolClub}, range: ${schoolClub}!T:Y`);

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${schoolClub}!U:Z`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[ name, dob, gender, kup, idNumber, schoolClub]],
      },
    });

    console.log("Successfully added demo participant to Google Sheet");
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Google Sheets API Error:", err);
    console.error("Error details:", {
      message: err.message,
      code: err.code,
      errors: err.errors
    });
    return new Response(
      JSON.stringify({ 
        error: "Failed to write to Google Sheet",
        details: err.message 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
