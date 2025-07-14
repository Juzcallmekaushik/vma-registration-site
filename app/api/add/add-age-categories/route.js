import { google } from "googleapis";

export async function POST(req) {
  try {
    const bodyText = await req.text();    
    const parsedBody = JSON.parse(bodyText);
    
    const { fullName, gender, idNumber, dob, age, height, weight, clubName } = parsedBody;
    
    if (!clubName) {
      console.error("Missing clubName field in request");
      return new Response(
        JSON.stringify({ error: "Missing required field: clubName" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    if (!fullName || !idNumber || !age) {
      console.error("Missing required fields in request");
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

    // Check if "Age Categories" sheet exists, if not create it
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    let ageCategoriesSheet = meta.data.sheets.find(
      (s) => s.properties.title === "Age Categories"
    );

    if (!ageCategoriesSheet) {
      // Create the Age Categories sheet
      const addSheetRes = await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: "Age Categories",
                },
              },
            },
          ],
        },
      });

      const newSheetId = addSheetRes.data.replies[0].addSheet.properties.sheetId;

      // Add headers to the new sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Age Categories!A1:I1",
        valueInputOption: "RAW",
        requestBody: {
          values: [
            [
              "Name",
              "Gender", 
              "ID Number",
              "Date of Birth",
              "Age",
              "Height",
              "Weight",
              "Club Name",
            ]
          ],
        },
      });

      // Format the header row
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: newSheetId,
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: 9,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: {
                      red: 0.9,
                      green: 0.9,
                      blue: 0.9,
                    },
                    textFormat: {
                      bold: true,
                    },
                  },
                },
                fields: "userEnteredFormat(backgroundColor,textFormat)",
              },
            },
          ],
        },
      });
    }

    // Add the participant data to the Age Categories sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Age Categories!A:I",
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
        message: `Participant added to Age Categories sheet in category ${ageCategory}` 
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
        error: "Failed to write to Age Categories sheet",
        details: err.message 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
