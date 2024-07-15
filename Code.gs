// const sheetName = 'Sheet1'
const scriptProp = PropertiesService.getScriptProperties()

function initialSetup() {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  scriptProp.setProperty('key', activeSpreadsheet.getId())
 
}


function doPost(e) {
  const lock = LockService.getScriptLock();

  try {
    if (lock.tryLock(10000)) {
      const key = PropertiesService.getScriptProperties().getProperty('key');
      const doc = SpreadsheetApp.openById(key);
      const params = e.parameter;
      const pageParam = params.page;

      let sheet1, sheet2, newRow1, newRow2, nextRow1, nextRow2;

      sheet1 = doc.getSheetByName('Form Responses 1');
      sheet2 = doc.getSheetByName('Sheet2');

      Logger.log("Paramssss", params);

      if (pageParam === 'form') {
        const headers1 = sheet1.getRange(1, 1, 1, sheet1.getLastColumn()).getValues()[0];
        // Add new row in Sheet1 with current date
        newRow1 = headers1.map(header => header === 'Timestamp' ? new Date() : (params[header] || ''));
        nextRow1 = sheet1.getLastRow() + 1;
        sheet1.getRange(nextRow1, 1, 1, newRow1.length).setValues([newRow1]);

        const headers2 = sheet2.getRange(1, 1, 1, sheet2.getLastColumn()).getValues()[0];
        // Add new row in Sheet2 with the row number as ID from Sheet1 and current date
        newRow2 = headers2.map(header => {
          if (header === 'ID') {
            return nextRow1.toString(); // The ID is the row number from Sheet1
          } else if (header === 'Date') {
            return new Date(); // Set the current date
          } else {
            return params[header] || '';
          }
        });
        nextRow2 = sheet2.getLastRow() + 1;
        sheet2.getRange(nextRow2, 1, 1, newRow2.length).setValues([newRow2]);
      } 
      else if (pageParam === 'verify') {
        // Call the function to update guest information
        return updateGuestInformation(params, sheet1, sheet2);
      } 
      else {
        // Handle other page parameters or errors
        Logger.log('Invalid page parameter.');
        return createErrorResponse('Invalid page parameter.');
      }

      // Return success result
      return createSuccessResponse(nextRow1);
    } else {
      // Lock could not be obtained
      Logger.log('Could not obtain lock after 10 seconds.');
      return createErrorResponse('Server too busy. Try again later.');
    }
  } catch (err) {
    // Log and return any exceptions
    Logger.log(err);
    return createErrorResponse('An error occurred: ' + err);
  } finally {
    // Release the lock no matter what happens
    lock.releaseLock();
  }
}

function getGuestDetails(fname, lname, dateOfBirth) {
  const sheetName = 'Form Responses 1';
  const doc = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('key'));
  const sheet = doc.getSheetByName(sheetName);

  // Get all rows in the sheet
  const rows = sheet.getRange(2, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  
  // Get the header row
  const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  // Find the index of the relevant columns
  const dobIndex = header.indexOf('Date of Birth:');
  const dateIndex = header.indexOf('Timestamp');
  const firstNameIndex = header.indexOf('First Name:');
  const lastNameIndex = header.indexOf('Last Name:');
  const genderIndex = header.indexOf('Gender/Sex');

  const havePhoneIndex = header.indexOf('Do you have a cell phone?');
  const phoneNumberIndex = header.indexOf('If yes, what is your cell phone number?');
  const noPhoneNumMethodIndex = header.indexOf('If no, how can we contact you?');
  const altContactIndex = header.indexOf('Do you have an alternative/emergency contact?');
  const altContactNameIndex = header.indexOf('Alternative/emergency contact name:');
  const altContactPhoneIndex = header.indexOf('Alternative/Emergency contact phone number:');




  const sleepingSpotIndex = header.indexOf('Current sleeping spot:');
  const stableHousingIndex = header.indexOf('How long has it been since you were last stably housed?');
  // const whyHomelessIndex = header.indexOf('Why Homeless');
  const zipIndex = header.indexOf('Most recent zip code:');

  const highschoolIndex = header.indexOf('Where did you attend high school?');


  const receiveMailIndex = header.indexOf('Where do you receive mail?');
  const receivemailInBroadwayIndex = header.indexOf('Would you like to begin receiving mail at Broadway Christian Parish?');

  const servedInMillitaryIndex = header.indexOf('Have you served in the military or armed services? If yes, what branch?');
  
  const fosterSystemIndex = header.indexOf('Were you ever or are you currently in foster care?');



  const birthCertificateIndex = header.indexOf('Birth certificate in hand?');
  const socialSecurityCardIndex = header.indexOf('Social Security card in hand?');
  const proofOfIncomeIndex = header.indexOf('Proof of income or awards/benefit letter in hand?');

  const idInHandIndex = header.indexOf('State ID in hand?');
  const insuranceIndex = header.indexOf('What medical insurance do you have?');


  const employmentIndex = header.indexOf('Are you employed?');
  const supplementalIncomeIndex = header.indexOf('Do you have any supplemental income?');
  const carIndex = header.indexOf('Will you have a car at the motel?');

  const needHandicapRoomIndex = header.indexOf('Will you need a handicap-accessible room?');
  const kidsPetsIndex = header.indexOf('Do you anticipate your spouse and/or pets coming with you to the motel?');
 


  const militaryIndex = header.indexOf('Have you served in the military or armed services? If yes, what branch?');

  const roommatePreferenceIndex = header.indexOf('Any roommate preferences?');

  const suppIncomeTypeIndex = header.indexOf('If yes, what kind of supplemental income?');
  const spousePetsExplanationIndex = header.indexOf('If yes, please explain.');


  // Add other necessary column indices here...

  let guestDetails = {};

  // Search for the guest by name and date of birth
  for(let i = 0; i < rows.length; i++) {
    let row = rows[i];
    let rowFirstName = row[firstNameIndex];
    let rowLastName = row[lastNameIndex];
    let rowDOB = new Date(row[dobIndex]);
    let rowDate = new Date(row[dateIndex]);
    const formattedRowDOB = `${rowDOB.getFullYear()}-${String(rowDOB.getMonth() + 1).padStart(2, '0')}-${String(rowDOB.getDate()).padStart(2, '0')}`;
      const formattedRowDate = `${rowDate.getFullYear()}-${String(rowDate.getMonth() + 1).padStart(2, '0')}-${String(rowDate.getDate()).padStart(2, '0')}`;

    if (rowFirstName === fname && rowLastName === lname && formattedRowDOB === dateOfBirth) {
      guestDetails = {
        "RowIndex": i + 2,  // adding 2 since rows array is 0-indexed and we skipped the header
        "Zip": row[zipIndex],
        "PhoneNumber": row[phoneNumberIndex],
        "FName": rowFirstName,
        "LName": rowLastName,
        "DOB": formattedRowDOB,
        "Date": formattedRowDate,
        "Gender/Sex": row[genderIndex],
        "havephone": row[havePhoneIndex],
        "noPhoneNumMethod": row[noPhoneNumMethodIndex],
        "AltContact": row[altContactIndex],
        "AltContactName": row[altContactNameIndex],
        "AltContactPhone": row[altContactPhoneIndex],
        "SleepingSpot": row[sleepingSpotIndex],
        "StableHousing": row[stableHousingIndex],
        "ReceiveMail": row[receiveMailIndex],
        "ReceivemailInBroadway": row[receivemailInBroadwayIndex],
        "ServedInMillitary": row[servedInMillitaryIndex],
        "Foster system": row[fosterSystemIndex],
        "BirthCertificate": row[birthCertificateIndex],
        "SocialSecurityCard": row[socialSecurityCardIndex],
        "ProofOfIncome": row[proofOfIncomeIndex],
        "IDInHand": row[idInHandIndex],
        "Insurance": row[insuranceIndex],
        "Employment": row[employmentIndex],
        "SupplementalIncome": row[supplementalIncomeIndex],
        "SuppIncomeType": row[suppIncomeTypeIndex],
        "Car": row[carIndex],
        "NeedHandicapRoom": row[needHandicapRoomIndex],
        "KidsPetsSpouse": row[kidsPetsIndex],
        "Military": row[militaryIndex],
        "HighSchool": row[highschoolIndex],
        "RoommatePreference": row[roommatePreferenceIndex],
        "SpousePetsExplanation": row[spousePetsExplanationIndex]
        // Add other necessary columns here...
      };
      break;
    }
  }
  
  return guestDetails;
}



// Helper functions to create success and error responses
function createSuccessResponse(row) {
  return ContentService
    .createTextOutput(JSON.stringify({ 'result': 'success', 'row': row }))
    .setMimeType(ContentService.MimeType.JSON);
}

function createErrorResponse(message) {
  return ContentService
    .createTextOutput(JSON.stringify({ 'result': 'error', 'error': message }))
    .setMimeType(ContentService.MimeType.JSON);
}



function getAllGuestNames() {
  const sheetName = 'Form Responses 1';
  const doc = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('key'));
  const sheet = doc.getSheetByName(sheetName);
  const fnameIndex = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].indexOf('First Name:');
  const lnameIndex = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].indexOf('Last Name:');
  const dataRange = sheet.getDataRange().getValues();
  let namesList = [];

  // Start from the second row to skip the header
  for (let i = 1; i < dataRange.length; i++) {
    let firstName = dataRange[i][fnameIndex];
    let lastName = dataRange[i][lnameIndex];
    if (firstName && lastName) { // Ensure both first and last name cells are not empty
      namesList.push(firstName + " " + lastName);
    }
  }

  return namesList;
}



function doGet(e) {
  var template;
  
  // Check the page parameter and serve the appropriate page
  switch(e.parameter.page) {
    case 'data':
      template = HtmlService.createTemplateFromFile('data');
      break;
    case 'form':
      template = HtmlService.createTemplateFromFile('form');
      break;
    case 'verify':
      template = HtmlService.createTemplateFromFile('verify');
      // Pass the Name and DOB to the template
      template.selectedFirstName = e.parameter.FName || '';
      template.selectedLastName = e.parameter.LName || '';
      template.selectedDOB = e.parameter.DOB || '';
      break;
    case 'verify-i':
      template = HtmlService.createTemplateFromFile('verify-i');
      // Similarly, pass parameters if needed
      break;
    case 'position':
      template = HtmlService.createTemplateFromFile('position');
      // Similarly, pass parameters if needed
      break;
    case 'assign-id':
      template = HtmlService.createTemplateFromFile('assign-id');
      // Similarly, pass parameters if needed
      break;
    case 'check-in':
      template = HtmlService.createTemplateFromFile('check-in');
      // Similarly, pass parameters if needed
      break;
    default:
      template = HtmlService.createTemplateFromFile('index'); // Serve the index.html file
  }
  
  
  // Evaluate the template to resolve the variables within it
  var evaluate = template.evaluate();
  evaluate.setTitle('Motels4Now Guest Intake');
  evaluate.addMetaTag('viewport','width=device-width, initial-scale=1');
  return evaluate;
}






function navigateToPage(page) {
  var template;
  if (page === 'data') {
    template = HtmlService.createHtmlOutputFromFile('data');
  }
  else if (page === 'verify-i') {
    template = HtmlService.createHtmlOutputFromFile('verify-i');
  }
  else if (page === 'verify') {
    template = HtmlService.createHtmlOutputFromFile('verify');
  }
   else if (page === 'position') {
    template = HtmlService.createHtmlOutputFromFile('position');
  }
  else if (page === 'assign-id') {
    template = HtmlService.createHtmlOutputFromFile('assign-id');
  }
  else if (page === 'check-in') {
    template = HtmlService.createHtmlOutputFromFile('check-in');
  }
   else {
    template = HtmlService.createHtmlOutputFromFile('form');
  }
  var evaluate = template.evaluate();
  evaluate.setTitle('Your Web App Title');
  evaluate.addMetaTag('viewport','width=device-width, initial-scale=1');
  return evaluate;
}


function updateSpreadsheetWithUniqueId(name, uniqueId) {
  const sheetName = 'Form Responses 1';
  const doc = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('key'));
  const sheet = doc.getSheetByName(sheetName);
  const dataRange = sheet.getDataRange().getValues();

  // Find the index of the First Name, Last Name, and Unique ID columns
  const headerRow = dataRange[0];
  const fnameIndex = headerRow.indexOf('First Name:');
  const lnameIndex = headerRow.indexOf('Last Name:');
  const uniqueIdIndex = headerRow.indexOf('Unique ID'); // Assuming there's a 'Unique ID' column

  if (fnameIndex < 0 || lnameIndex < 0 || uniqueIdIndex < 0) {
    return { success: false, message: "Required columns not found." };
  }

  // Check if the Unique ID is already taken by any guest
  let highestUniqueId = 0;
  for (let i = 1; i < dataRange.length; i++) {
    const currentId = dataRange[i][uniqueIdIndex];
    if (currentId) {
      highestUniqueId = Math.max(highestUniqueId, currentId);
      if (currentId == uniqueId) {
        return { success: false, message: "Unique ID " + uniqueId + " is already taken. Try something higher than " + highestUniqueId + "." };
      }
    }
  }

  // Split the full name into first name and last name
  const nameParts = name.trim().split(" ");
  const fname = nameParts[0];
  const lname = nameParts.slice(1).join(" ");

  // Loop through the rows to find the guest
  for (let i = 1; i < dataRange.length; i++) {
    const row = dataRange[i];
    const guestFName = row[fnameIndex];
    const guestLName = row[lnameIndex];

    if (guestFName === fname && guestLName === lname) {
      const existingId = row[uniqueIdIndex];
      // Check if the guest already has a Unique ID
      if (existingId) {
        return { success: false, message: "Guest " + fname + " " + lname + " already has a Unique ID assigned: " + existingId };
      } else {
        // Assign the Unique ID and update the sheet
        sheet.getRange(i + 1, uniqueIdIndex + 1).setValue(uniqueId);
        return { success: true, message: "Unique ID " + uniqueId + " assigned successfully to " + fname + " " + lname + "." };
      }
    }
  }

  return { success: false, message: "Guest not found. Unable to assign Unique ID." };
}



function updateGuestInformation(formData) {
  const sheetName = 'Form Responses 1'; // Adjust the sheet name as needed
  const doc = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('key'));
  const sheet = doc.getSheetByName(sheetName);

  // Find the guest row based on first name, last name, and date of birth
  const data = sheet.getDataRange().getValues();
  const fnameIndex = data[0].indexOf('First Name:');
  const lnameIndex = data[0].indexOf('Last Name:');
  const dobIndex = data[0].indexOf('Date of Birth:'); // Ensure this matches your column header

  for (let i = 1; i < data.length; i++) {
    let row = data[i];
    if (row[fnameIndex] === formData['First Name:'] && 
        row[lnameIndex] === formData['Last Name:'] &&
        Utilities.formatDate(new Date(row[dobIndex]), Session.getScriptTimeZone(), "yyyy-MM-dd") === formData['Date of Birth:']) {
      // Update the row with new data
      for (let key in formData) {
        let colIndex = data[0].indexOf(key);
        if (colIndex !== -1) {
          sheet.getRange(i + 1, colIndex + 1).setValue(formData[key]);
        }
      }
      return { success: true, message: "Guest information updated successfully." };
    }
  }
  return { success: false, message: "Guest not found." };
}



function getDataByDate(date) {
  const sheetName = 'Sheet2';
 
  const doc = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('key'));
  const sheet = doc.getSheetByName(sheetName);

  // Get all rows in the sheet
  const rows = sheet.getRange(2, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  
  // Get the header row
  const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  

  // Find the index of the columns by name
  const dateIndex = header.indexOf('Timestamp');
  const genderIndex = header.indexOf('Gender/Sex');
  const fnameIndex = header.indexOf('First Name:');
  const lnameIndex = header.indexOf('Last Name:');
  const unIndex = header.indexOf('Position');
  const phoneNumber = header.indexOf('If yes, what is your cell phone number?');

  const groupedData = {
    'Male': [],
    'Female': []
  };

  // Filter and group rows by date and gender
  rows.forEach((row, index) => {
  const rowId = index + 2; // Since rows start from the second row in the sheet
  console.log("Processing row ID:", rowId); // You can log it to check
    let rowDate = new Date(row[dateIndex]);

    // Convert both dates to yyyy-mm-dd format for comparison
    const formattedRowDate = `${rowDate.getFullYear()}-${String(rowDate.getMonth() + 1).padStart(2, '0')}-${String(rowDate.getDate()).padStart(2, '0')}`;

    const formattedInputDate = date; // Use the input date string as-is
    console.log("Formatted input date:", formattedInputDate);
  
    const gender = row[genderIndex];
  
    if (formattedRowDate === formattedInputDate) {
      const personData = { ID: row[unIndex], Name: row[fnameIndex] + " " + row[lnameIndex], Phone: row[phoneNumber] };
      if (gender === 'Male') {
        groupedData.Male.push(personData);
      } else if (gender === 'Female') {
        groupedData.Female.push(personData);
      }
    }
  });

  ['Male', 'Female'].forEach(gender => {
    groupedData[gender].sort((a, b) => a.ID - b.ID);
  });

  console.log(groupedData); // Server-side log to view in the Apps Script editor

  return groupedData;
}

function checkInGuest(fname, lname, dob) {
  const sheetName = 'Form Responses 1';
  const doc = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('key'));
  const sheet = doc.getSheetByName(sheetName);
  const dataRange = sheet.getDataRange().getValues();
  const sheet2 = doc.getSheetByName('Sheet2');

  // Find the index of the Name and DOB columns
  const fnameIndex = dataRange[0].indexOf('First Name:');
  const lnameIndex = dataRange[0].indexOf('Last Name:');
  const dobIndex = dataRange[0].indexOf('Date of Birth:');
  const checkInIndex = dataRange[0].indexOf('Latest Check-In');

  for (let i = 1; i < dataRange.length; i++) {
    const row = dataRange[i];
    if (row[fnameIndex] === fname && row[lnameIndex] === lname && formatDate(row[dobIndex]) === dob) {
      // Update 'Latest Check-In' in 'Form Responses 1'
      sheet.getRange(i + 1, checkInIndex + 1).setValue(new Date());

      // Retrieve details and write to 'Sheet2'
      const details = [i + 1, row[fnameIndex], row[lnameIndex], row[dataRange[0].indexOf('If yes, what is your cell phone number?')], row[dataRange[0].indexOf('Gender/Sex')], new Date()];
      sheet2.appendRow(details);

      return true; // Return true to indicate success
    }
  }
  return false; // Return false if the guest was not found
}

// Helper function to format dates as 'yyyy-mm-dd'
function formatDate(date) {
  return Utilities.formatDate(new Date(date), Session.getScriptTimeZone(), "yyyy-MM-dd");
}




function getGuestPosition(fname, lname, dateOfBirth) {
  const sheetName = 'Form Responses 1';
  const doc = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('key'));
  const sheet = doc.getSheetByName(sheetName);
  const dataRange = sheet.getDataRange().getValues();


  // Find the index of the Name and DOB columns
  const headerRow = dataRange[0];
  const fnameIndex = headerRow.indexOf('First Name:');
  const lnameIndex = headerRow.indexOf('Last Name:');
  const dobIndex = headerRow.indexOf('Date of Birth:');

  // Loop through the rows to find the guest
  for (let i = 1; i < dataRange.length; i++) { // Start from 1 to skip header
    const row = dataRange[i];
    const guestFName = row[fnameIndex];
    const guestLName = row[lnameIndex];
    const guestDOB = row[dobIndex] && Utilities.formatDate(new Date(row[dobIndex]), Session.getScriptTimeZone(), "yyyy-MM-dd");

    if (guestFName === fname && guestLName === lname && guestDOB === dateOfBirth) {
      // Return the row index (position in the spreadsheet)
      return i + 1; // +1 because array is 0-indexed and spreadsheet rows start at 1
    }
  }
  return null; // Return null if the guest is not found
}





