const moment = require("moment");

async function paymentFunction(gsapi, data, range, companies) {
  companies.forEach(async (company) => {
    let paymentArr = [];
    const filteredData = data.filter(
      (payment) => payment?.seller?.company_id == company?.company_id
    );
    if (filteredData?.length) {
      filteredData.forEach((pay) =>
        paymentArr.push([
          moment(new Date(pay.createdAt)).format("L"),
          pay?.delivery ? pay?.delivery?.increment_id : "",
          pay?.deal?.orders[0]?.order_id,
          pay?.deal?.client?.name,
          pay?.deal?.client?.phone,
          pay?.payment_type,
          pay?.payment_sum,
          pay?.payment_dollar,
          ((100 * pay?.dollar_to_sum) / (1 * pay?.payment_dollar)) * 1,
          pay?.dollar_to_sum,
          pay?.change,
        ])
      );

      const opt = {
        spreadsheetId: company?.company_id,
        range: range,
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        resource: {
          values: paymentArr,
        },
      };

      await gsapi.spreadsheets.values.append(opt);
      paymentArr = [];
    }
  });

  console.log("Data written to sheet successfully.");
  return "Data written to sheet successfully.";
}

module.exports = paymentFunction;
