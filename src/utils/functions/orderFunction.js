async function writeOrders(gsapi, data, sheetId, range) {
  // const idOpt = {
  //   spreadsheetId: sheetId,
  //   range: "ID архив!A1:B",
  //   valueInputOption: "USER_ENTERED",
  //   insertDataOption: "INSERT_ROWS",
  //   resource: {
  //     values: [[formData.id, purchaseSum * 1 - totalPayment * 1]],
  //   },
  // };

  const opt = {
    spreadsheetId: sheetId,
    range: range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    resource: {
      values: data,
    },
  };

  // gsapi.spreadsheets.values.append(idOpt);
  await gsapi.spreadsheets.values.append(opt);
  console.log("Data written to sheet successfully.", data);
  return "Data written to sheet successfully.";
}

module.exports = writeOrders;
