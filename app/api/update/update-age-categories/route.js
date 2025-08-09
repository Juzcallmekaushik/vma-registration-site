import { google } from "googleapis";

export async function POST(req) {
  try {
    const bodyText = await req.text();    
    const parsedBody = JSON.parse(bodyText);
    
    const { oldIdNumber, fullName, gender, idNumber, dob, age, height, weight, clubName } = parsedBody;
    
    if (!clubName || !oldIdNumber) {
      console.error("Missing required fields in request");
      return new Response(
        JSON.stringify({ error: "Missing required fields: clubName and oldIdNumber are required" }),
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

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // First, try to delete the old entry by ID number
    try {
      await fetch("/api/delete/delete-age-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idNumber: oldIdNumber }),
      });
    } catch (err) {
      console.log("Could not delete old entry (may not exist):", err);
    }

    // Then add the new entry using the add API logic
    const participantAge = parseInt(age);
    let columnRange = "";
    let ageCategory = "";
    
    if (participantAge >= 4 && participantAge <= 6) {
      columnRange = "A:I";
      ageCategory = "A-I";
    } else if (participantAge >= 7 && participantAge <= 9) {
      columnRange = "K:S";
      ageCategory = "K-S";
    } else if (participantAge >= 10 && participantAge <= 12) {
      columnRange = "U:AC";
      ageCategory = "U-AC";
    } else if (participantAge >= 13 && participantAge <= 15) {
      columnRange = "AE:AM";
      ageCategory = "AE-AM";
    } else {
      return new Response(
        JSON.stringify({ error: "Age must be between 4-15 years for age categories" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Add the updated participant data to the appropriate column range
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `Age Categories!${columnRange}`,
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
