const DeliveryModel = require("../model/delivery.model");
const SellerModel = require("../model/seller.model");
const OrderModel = require("../model/order.model");
const PaymentModel = require("../model/payment.model");
const DealModel = require("../model/deal.model");
const { where } = require("sequelize");
const WalletModel = require("../model/wallet.model");

const fakeData = {
  id: 2,
  payment_type: "нал. другой",
  payment_sum: 1000000,
  payment_$: 0,
  kurs: 0,
  amount_by_kurs: 0,
  change: 0,
  total_sum: 1000000,
  rest_money: 0,
  deal_id: "e2d252d1-90e2-491d-9ad9-fd8562d46d45",
  order_id: "f1d09f79-d0c1-4298-99bc-d8c6bf687631",
};

module.exports = {
  D2C_DELIVERY_CREATE: async (req, res) => {
    try {
      const { delivery_row, paymentRow, courier } = req.body;
      console.log(delivery_row, paymentRow, courier);
      const delivery_data = delivery_row
        .map((e) => {
          return {
            id: e?.delivery_uuid,
            price: e?.price,
            title: e?.title,
            order_id: e?.order?.id,
            courier_id: courier,
            delivery_date: new Date(e?.delivery_date),
            trip_id: e?.trip_id,
          };
        })
        .filter((deliv) => deliv.order_id && deliv.courier_id);

      if (!delivery_data?.length)
        return res.status(500).json("no delivery sent!");

      const newDelivery = await DeliveryModel.bulkCreate(delivery_data);

      const payment_data = paymentRow
        .map((p) => {
          return {
            payment_type: p?.payment_type,
            payment_sum: p?.payment_sum,
            payment_dollar: p?.payment_$,
            dollar_to_sum: p?.amount_by_kurs,
            change: p?.change,
            deal_id: p?.deal_id,
            teller_id: req?.user_id,
            wallet_id: p?.wallet_id,
            delivery_id: p?.delivery_uuid,
            copied: false,
          };
        })
        .filter((pay) => pay.deal_id && pay.teller_id);

      const newPayment = await PaymentModel.bulkCreate(payment_data);

      res.json({ payment_data });

      if (payment_data?.length) {
        const deals_to_update = await DealModel.findAll({
          where: {
            id: payment_data
              .map((pay) => pay?.deal_id)
              .sort((a, b) => a.localeCompare(b)),
          },
          attributes: ["id", "rest"],
        });

        const wallets_to_update = await WalletModel.findAll({
          where: {
            id: payment_data
              .map((pay) => pay?.wallet_id)
              .sort((a, b) => a.localeCompare(b)),
          },
          attributes: ["id", "amount_sum", "amount_dollar"],
        });

        wallets_to_update.forEach(async (wallet) => {
          const total_payment_sum = paymentRow
            .filter((pay) => pay?.wallet_id == wallet?.id)
            .reduce((a, b) => a + b?.payment_sum * 1, 0);

          const total_payment_$ = paymentRow
            .filter((pay) => pay?.wallet_id == wallet?.id)
            .reduce((a, b) => a + b?.payment_$ * 1, 0);

          const updatedWallet = await WalletModel.update(
            {
              amount_sum: wallet?.amount_sum * 1 + total_payment_sum * 1,
              amount_dollar: wallet?.amount_dollar * 1 + total_payment_$ * 1,
            },
            { where: { id: wallet?.id } }
          );
        });

        deals_to_update.forEach(async (deal) => {
          const total_payment = paymentRow
            .filter((pay) => pay?.deal_id == deal?.id)
            .reduce((a, b) => a + b?.total_sum * 1, 0);
          const updatedDeal = await DealModel.update(
            {
              rest: deal?.rest * 1 - total_payment * 1,
            },
            { where: { id: deal?.id } }
          );
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json("Internal server error!");
    }
  },
};
