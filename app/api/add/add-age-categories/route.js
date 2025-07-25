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

      // Add headers for age categories in their respective column ranges
      const headerUpdates = [
        // 4-6 years: Columns A-H
        {
          range: "Age Categories!A1:H1",
          values: [["4-6 YEARS (A-H)", "", "", "", "", "", "", ""]]
        },
        {
          range: "Age Categories!A2:H2", 
          values: [["Name", "Gender", "ID Number", "DOB", "Age", "Height", "Weight", "Club"]]
        },
        // 7-9 years: Columns J-Q  
        {
          range: "Age Categories!J1:Q1",
          values: [["7-9 YEARS (J-Q)", "", "", "", "", "", "", ""]]
        },
        {
          range: "Age Categories!J2:Q2",
          values: [["Name", "Gender", "ID Number", "DOB", "Age", "Height", "Weight", "Club"]]
        },
        // 10-12 years: Columns S-Z
        {
          range: "Age Categories!S1:Z1", 
          values: [["10-12 YEARS (S-Z)", "", "", "", "", "", "", ""]]
        },
        {
          range: "Age Categories!S2:Z2",
          values: [["Name", "Gender", "ID Number", "DOB", "Age", "Height", "Weight", "Club"]]
        },
        // 13-15 years: Columns AB-AI
        {
          range: "Age Categories!AB1:AI1",
          values: [["13-15 YEARS (AB-AI)", "", "", "", "", "", "", ""]]
        },
        {
          range: "Age Categories!AB2:AI2", 
          values: [["Name", "Gender", "ID Number", "DOB", "Age", "Height", "Weight", "Club"]]
        }
      ];

      // Apply all header updates
      for (const update of headerUpdates) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: update.range,
          valueInputOption: "RAW",
          requestBody: { values: update.values },
        });
      }

      // Format the header rows
      const formatRequests = [
        // Format title rows (row 1) for each age group
        {
          repeatCell: {
            range: {
              sheetId: newSheetId,
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 0, // A
              endColumnIndex: 8,   // H
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.7, green: 0.9, blue: 0.7 },
                textFormat: { bold: true, fontSize: 12 },
                horizontalAlignment: "CENTER"
              },
            },
            fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)",
          },
        },
        {
          repeatCell: {
            range: {
              sheetId: newSheetId,
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 9, // J
              endColumnIndex: 17,  // Q
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.9, green: 0.7, blue: 0.7 },
                textFormat: { bold: true, fontSize: 12 },
                horizontalAlignment: "CENTER"
              },
            },
            fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)",
          },
        },
        {
          repeatCell: {
            range: {
              sheetId: newSheetId,
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 18, // S
              endColumnIndex: 26,   // Z
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.7, green: 0.7, blue: 0.9 },
                textFormat: { bold: true, fontSize: 12 },
                horizontalAlignment: "CENTER"
              },
            },
            fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)",
          },
        },
        {
          repeatCell: {
            range: {
              sheetId: newSheetId,
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 27, // AB
              endColumnIndex: 35,   // AI
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.9, green: 0.9, blue: 0.7 },
                textFormat: { bold: true, fontSize: 12 },
                horizontalAlignment: "CENTER"
              },
            },
            fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)",
          },
        },
        // Format column header rows (row 2) for all groups
        {
          repeatCell: {
            range: {
              sheetId: newSheetId,
              startRowIndex: 1,
              endRowIndex: 2,
              startColumnIndex: 0,
              endColumnIndex: 35,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
                textFormat: { bold: true },
              },
            },
            fields: "userEnteredFormat(backgroundColor,textFormat)",
          },
        },
      ];

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests: formatRequests },
      });
    }

    // Determine the column range based on age category
    let columnRange = "";
    if (participantAge >= 4 && participantAge <= 6) {
      columnRange = "A:H";  // A-H columns
    } else if (participantAge >= 7 && participantAge <= 9) {
      columnRange = "J:Q";  // J-Q columns  
    } else if (participantAge >= 10 && participantAge <= 12) {
      columnRange = "S:Z";  // S-Z columns
    } else if (participantAge >= 13 && participantAge <= 15) {
      columnRange = "AB:AI"; // AB-AI columns
    }

    // Add the participant data to the appropriate column range
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
