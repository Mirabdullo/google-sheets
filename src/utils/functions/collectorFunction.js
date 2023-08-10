const orderFunction = require("./orderFunction");
const applyFunction = require("./applyFunction");
const moment = require("moment");
const DealModel = require("../../model/deal.model");
const ApplyModel = require("../../model/apply.model");
const { where } = require("sequelize");

function collectorFunction(dealData, applyData, company_idData, gsapi) {
  company_idData.forEach(async (e) => {
    let arr = [];
    let applyArr = [];
    const company_id = e.company_id;
    const deals = dealData.filter(
      (deal) => deal.seller.company_id == company_id
    );
    const applies = applyData.filter(
      (apply) => apply.seller.company_id == company_id
    );
    if (deals.length) {
      deals.forEach((deal, dealIndex) => {
        const paymentLength = deal.payments.length;
        const orderLength = deal.orders.length;
        const dealIncome = deal.orders.reduce((a, b) => a + b.sum * 1, 0);
        const totalAdvancedPayment = deal.payments.reduce((a, b) => {
          const sumb =
            Number(b.payment_sum) + Number(b.dollar_to_sum) - Number(b.change);
          return a + sumb * 1;
        }, 0);
        if (paymentLength > orderLength) {
          deal.payments.forEach((payment, paymentIndex) => {
            if (deal.orders[paymentIndex]) {
              arr.push([
                moment(new Date(deal.createdAt)).format("L"),
                deal?.client?.name,
                deal?.client?.phone,
                deal?.client?.where_from,
                deal?.client?.status,
                deal?.orders[paymentIndex]?.cathegory,
                deal?.seller?.name,
                deal?.orders[paymentIndex]?.order_id,
                deal?.orders[paymentIndex]?.model?.furniture_type?.name,
                deal?.orders[paymentIndex]?.model?.name || "",
                deal?.orders[paymentIndex]?.tissue || "",
                moment(new Date(deal?.delivery_date)).format("L"),
                deal?.orders[paymentIndex]?.title,
                deal?.orders[paymentIndex]?.cost,
                deal?.orders[paymentIndex]?.sale,
                deal?.orders[paymentIndex]?.qty,
                deal?.orders[paymentIndex]?.sum,
                payment.payment_type,
                payment.payment_sum,
                payment.payment_dollar,
                ((payment.dollar_to_sum * 1) / (payment.payment_dollar * 1)) *
                  1 || 0,
                payment.dollar_to_sum,
                payment.change,
                payment.payment_sum * 1 +
                  payment.dollar_to_sum * 1 -
                  payment.change * 1,
                paymentIndex == 0
                  ? dealIncome * 1 - totalAdvancedPayment * 1
                  : "",
                deal?.deal_id * 1 + 100000000,
              ]);
            } else {
              arr.push([
                moment(new Date(deal.createdAt)).format("L"),
                deal?.client?.name,
                deal?.client?.phone,
                deal?.client?.where_from,
                deal?.client?.status,
                "-",
                deal?.seller?.name,
                "-",
                "-",
                "-",
                "-",
                "-",
                "-",
                "-",
                "-",
                "-",
                "-",
                payment.payment_type,
                payment.payment_sum,
                payment.payment_dollar,
                ((payment.dollar_to_sum * 1) / (payment.payment_dollar * 1)) *
                  1 || 0,
                payment.dollar_to_sum,
                payment.change,
                payment.payment_sum * 1 +
                  payment.dollar_to_sum * 1 -
                  payment.change * 1,
                paymentIndex == 0
                  ? dealIncome * 1 - totalAdvancedPayment * 1
                  : "",
                deal?.deal_id * 1 + 100000000,
              ]);
            }
          });
        } else {
          deal.orders.forEach((order, orderIndex) => {
            if (deal.payments[orderIndex]) {
              arr.push([
                moment(new Date(deal.createdAt)).format("L"),
                deal?.client?.name,
                deal?.client?.phone,
                deal?.client?.where_from,
                deal?.client?.status,
                order?.cathegory,
                deal?.seller?.name,
                order?.order_id,
                order?.model?.furniture_type?.name || "",
                order?.model?.name || "",
                order?.tissue,
                moment(new Date(deal?.delivery_date)).format("L"),
                order?.title,
                order?.cost,
                order?.sale,
                order?.qty,
                order?.sum,
                deal?.payments[orderIndex]?.payment_type,
                deal?.payments[orderIndex]?.payment_sum,
                deal?.payments[orderIndex]?.payment_dollar,
                ((deal?.payments[orderIndex]?.dollar_to_sum * 1) /
                  (deal?.payments[orderIndex]?.payment_dollar * 1)) *
                  1 || 0,
                deal?.payments[orderIndex]?.dollar_to_sum,
                deal?.payments[orderIndex]?.change,
                deal?.payments[orderIndex]?.payment_sum * 1 +
                  deal?.payments[orderIndex]?.dollar_to_sum * 1 -
                  deal?.payments[orderIndex]?.change * 1,
                orderIndex == 0
                  ? dealIncome * 1 - totalAdvancedPayment * 1
                  : "",
                deal?.deal_id * 1 + 100000000,
              ]);
            } else {
              arr.push([
                moment(new Date(deal.createdAt)).format("L"),
                deal?.client?.name,
                deal?.client?.phone,
                deal?.client?.where_from,
                deal?.client?.status,
                order?.cathegory,
                deal?.seller?.name,
                order?.order_id,
                order?.model?.furniture_type?.name,
                order?.model?.name,
                order?.tissue,
                moment(new Date(deal?.delivery_date)).format("L"),
                order?.title,
                order?.cost,
                order?.sale,
                order?.qty,
                order?.sum,
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                orderIndex == 0
                  ? dealIncome * 1 - totalAdvancedPayment * 1
                  : "",
                deal?.deal_id * 1 + 100000000,
              ]);
            }
          });
        }
      });
    }
    if (applies.length) {
      applies.forEach((apply) => {
        applyArr.push([
          apply.apply_id,
          apply.seller.name,
          apply.cathegory,
          apply.receiver_department,
          apply.receiver_finish,
          apply.amount_in_sum,
          apply.amount_in_dollar,
          moment(new Date(apply?.createdAt)).format("L"),
          apply?.title,
          true,
        ]);
      });
    }
    if (arr.length) {
      const dealIds = deals.map((deal) => deal.id);
      await orderFunction(gsapi, arr, company_id, "Продажи!A746:Z");
      const updateDeals = await DealModel.update(
        { copied: true },
        { where: { id: dealIds } }
      );
    }
    if (applyArr.length) {
      const applyIds = applies.map((apply) => apply.id);
      await applyFunction(gsapi, applyArr, company_id, "Подача заявки!A3:I");
      console.log(company_id, applyArr)

      const updateApplies = await ApplyModel.update(
        { copied: true },
        { where: { id: applyIds } }
      );
    }
  });
}

module.exports = collectorFunction;
