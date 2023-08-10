async function writeApplies(gsapi, data, sheetId, range) {
  const opt = {
    spreadsheetId: sheetId,
    range: range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    resource: {
      values: data,
    },
  };
  await gsapi.spreadsheets.values.append(opt);
  console.log("Data written to sheet successfully.");
  return "Data written to sheet successfully.";
}

module.exports = writeApplies;
