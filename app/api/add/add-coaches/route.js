import { google } from "googleapis";

export async function POST(req) {
  try {
    const bodyText = await req.text();
    console.log("Received request body:", bodyText);
    
    const { fullName, dob, gender, phoneNumber, idNumber, tagType, schoolClub } = JSON.parse(bodyText);
    
    // Validate required fields
    if (!schoolClub) {
      console.error("Missing schoolClub field in request");
      return new Response(
        JSON.stringify({ error: "Missing required field: schoolClub" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    if (!fullName || !idNumber) {
      console.error("Missing required fields in request");
      return new Response(
        JSON.stringify({ error: "Missing required fields: fullName and idNumber are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    console.log("Processing coach data:", { fullName, idNumber, schoolClub });

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    console.log(`Attempting to write to sheet: ${schoolClub}, range: ${schoolClub}!L:R`);

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${schoolClub}!L:R`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[ fullName, dob, gender, phoneNumber, idNumber, tagType, schoolClub ]],
      },
    });

    console.log("Successfully added coach to Google Sheet");
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
