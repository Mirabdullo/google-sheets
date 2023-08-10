const moment = require("moment");

async function approvalFunction(gsapi, data, range, sheet_id) {
  let approvalArr = [];
  const filteredData = data.filter((approval) => approval?.apply);
  if (filteredData?.length) {
    filteredData.forEach((approval) =>
      approvalArr.push([
        moment(new Date(approval.createdAt)).format("L"),
        moment(new Date(approval?.apply?.createdAt)).format("L"),
        approval?.apply?.apply_id,
        approval?.apply?.seller?.name,
        approval?.apply?.cathegory,
        approval?.apply?.receiver_department,
        approval?.apply?.receiver_finish,
        approval?.apply?.amount_in_sum,
        approval?.apply?.amount_in_dollar,
        approval?.amount_sum,
        approval?.amount_dollar,
        approval?.kurs,
        approval?.amount_sum * 1 +
          (approval?.amount_dollar * 1 * (approval?.kurs * 1)) / 100,
        approval?.transaction_fee,
        approval?.wallet?.name,
        approval?.company?.name,
      ])
    );

    const opt = {
      spreadsheetId: sheet_id,
      range: range,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      resource: {
        values: approvalArr,
      },
    };

    await gsapi.spreadsheets.values.append(opt);
    approvalArr = [];
  }

  console.log("Data written to sheet successfully.");
  return "Data written to sheet successfully.";
}

module.exports = approvalFunction;
