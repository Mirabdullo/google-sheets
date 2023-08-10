const moment = require("moment");

async function deliveryFunction(gsapi, data, range, companies) {
  companies.forEach(async (company) => {
    let deliveryArr = [];
    const filteredData = data.filter(
      (delivery) => delivery?.seller.company_id == company?.company_id
    );
    if (filteredData?.length) {
      filteredData.forEach((deliv) =>
        deliveryArr.push([
          moment(new Date(deliv.createdAt)).format("L"),
          deliv?.increment_id,
          deliv?.order?.order_id,
          deliv?.seller?.name,
          deliv?.price,
          deliv?.title,
        ])
      );

      const opt = {
        spreadsheetId: company?.company_id,
        range: range,
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        resource: {
          values: deliveryArr,
        },
      };

      await gsapi.spreadsheets.values.append(opt);
      deliveryArr = [];
    }
  });

  console.log("Data written to sheet successfully.");
  return "Data written to sheet successfully.";
}

module.exports = deliveryFunction;
