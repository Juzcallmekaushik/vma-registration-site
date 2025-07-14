import { google } from "googleapis";

export async function POST(req) {
  try {
    const bodyText = await req.text();    
    const parsedBody = JSON.parse(bodyText);
    
    const { rowIndex, fullName, gender, idNumber, dob, age, height, weight, clubName } = parsedBody;
    
    if (!clubName || rowIndex === undefined) {
      console.error("Missing required fields in request");
      return new Response(
        JSON.stringify({ error: "Missing required fields: clubName and rowIndex are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    if (!fullName || !idNumber || !age) {
      console.error("Missing required participant fields in request");
      return new Response(
        JSON.stringify({ error: "Missing required fields: fullName, idNumber, and age are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Determine age category based on age
    let ageCategory = "";
    const participantAge = parseInt(age);
    
    if (participantAge >= 4 && participantAge <= 6) {
      ageCategory = "A-H";
    } else if (participantAge >= 7 && participantAge <= 9) {
      ageCategory = "J-Q";
    } else if (participantAge >= 10 && participantAge <= 12) {
      ageCategory = "S-Z";
    } else if (participantAge >= 13 && participantAge <= 15) {
      ageCategory = "AB-AI";
    } else {
      return new Response(
        JSON.stringify({ error: "Age must be between 4-15 years for age categories" }),
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

    // Update the specific row in the Age Categories sheet
    const range = `Age Categories!A${rowIndex + 1}:I${rowIndex + 1}`;
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: range,
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            fullName,
            gender,
            idNumber,
            dob,
            age,
            height,
            weight,
            clubName,
            ageCategory
          ]
        ],
      },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        ageCategory: ageCategory,
        message: `Participant updated in Age Categories sheet, category: ${ageCategory}` 
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
        error: "Failed to update Age Categories sheet",
        details: err.message 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
