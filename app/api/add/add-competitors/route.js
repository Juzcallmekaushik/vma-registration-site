import { google } from "googleapis";

export async function POST(req) {
  try {
    const bodyText = await req.text();    
    const parsedBody = JSON.parse(bodyText);
    
    const { fullName, idNumber, gender, dob, age, category, height, weight, kupDan, events, schoolClub, schoolName } = parsedBody;
    console.log(parsedBody);
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

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${schoolClub}!A:L`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[ fullName, idNumber, gender, dob, age, category, height, weight, kupDan, events, schoolClub, schoolName ]],
      },
    });
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
