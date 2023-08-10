const moment = require("moment/moment");
const ClientModel = require("../model/client.model");
const DealModel = require("../model/deal.model");
const OrderModel = require("../model/order.model");
const PaymentModel = require("../model/payment.model");
const SellerModel = require("../model/seller.model");
const ModelModel = require("../model/model.model");
const FurnitureTypeModel = require("../model/furnitureType.model");
const DeliveryModel = require("../model/delivery.model");
const WalletModel = require("../model/wallet.model");
const sequelize = require("../utils/sequelize");
const { Op } = require("sequelize");

moment.locale("ru");

module.exports = {
  GET: async (_, res) => {
    try {
      let arr = [];
      const sendData = await SellerModel.findAll({
        attributes: [
          "company_id",
          [sequelize.fn("count", sequelize.col("*")), "count"],
        ],
        group: ["company_id"],
      });
      const deals = await DealModel.findAll({
        where: { copied: false },
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: OrderModel,
            include: [
              {
                model: ModelModel,
                include: [FurnitureTypeModel],
              },
            ],
          },
          {
            model: PaymentModel,
          },
          {
            model: SellerModel,
          },
          {
            model: ClientModel,
          },
        ],
      });
      if (deals.length) {
        deals.forEach((deal, dealIndex) => {
          const paymentLength = deal.payments.length;
          const orderLength = deal.orders.length;
          const dealIncome = deal.orders.reduce((a, b) => a + b.sum * 1, 0);
          const totalAdvancedPayment = deal.payments.reduce((a, b) => {
            const sumb =
              Number(b.payment_sum) +
              Number(b.dollar_to_sum) -
              Number(b.change);
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
                ]);
              }
            });
          }
        });
      }
      res.json(deals);
    } catch (error) {
      console.log(error);
    }
  },
  POST: async (req, res) => {
    try {
      const seller_id = req.user_id;
      const { row, paymentRow, formData } = req.body.data;
      const [newClient] = await ClientModel.findOrCreate({
        where: { name: formData.clientName, phone: formData.phone },
        defaults: { where_from: formData.whereFrom, status: formData.status },
      });
      const newDate = new Date(formData?.deliveryDate) || new Date();
      const newDeal = await DealModel.create({
        client_id: newClient?.id,
        seller_id,
        delivery_date: newDate,
      });
      const mappedRow = row.map((e) => {
        return {
          order_id: e?.cathegory == "заказ" ? formData.id : e.orderId,
          cathegory: e?.cathegory,
          tissue: e?.tissue,
          title: e?.title,
          cost: e?.price,
          sale: e?.sale,
          qty: e?.qty,
          sum: e?.sum,
          deal_id: newDeal?.id,
          model_id: e?.model,
        };
      });
      const [newOrders] = await OrderModel.bulkCreate(mappedRow);

      const filteredPayment = paymentRow.filter((pay) => pay?.wallet_id != "");

      const allIncome = mappedRow.reduce((a, b) => {
        return a + Number(b?.sum);
      }, 0);

      if (!filteredPayment?.length) {
        const updatedDeal = await DealModel.update(
          {
            rest: allIncome,
          },
          { where: { id: newDeal.id } }
        );
        return res.json("orders created without payment");
      }

      const mappedPaymentRow = filteredPayment.map((e) => {
        return {
          payment_type: e?.payment_type,
          payment_sum: e?.payment_sum,
          payment_dollar: e?.payment_$,
          dollar_to_sum: e?.amount_by_kurs,
          change: e?.change,
          deal_id: newDeal?.id,
          teller_id: seller_id,
          wallet_id: e?.wallet_id,
        };
      });
      const [newPayments] = await PaymentModel.bulkCreate(mappedPaymentRow);
      const allPayment = mappedPaymentRow.reduce((a, b) => {
        return (
          a +
          Number(b?.payment_sum) +
          Number(b?.dollar_to_sum) -
          Number(b?.change)
        );
      }, 0);
      const updatedDeal = await DealModel.update(
        {
          rest: allIncome - allPayment,
        },
        { where: { id: newDeal.id } }
      );
      res.json({ newClient, newDeal, newOrders, newPayments });

      if (!paymentRow?.length) return;

      const wallets_to_update = await WalletModel.findAll({
        where: {
          id: paymentRow
            .map((pay) => pay?.wallet_id)
            .sort((a, b) => a.localeCompare(b)),
        },
        attributes: ["id", "amount_sum", "amount_dollar"],
      });

      if (!wallets_to_update?.length) return;

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
    } catch (error) {
      console.log(error);
      res.status(500).json(error?.message || "Error");
    }
  },
  POST_DELIVERY: async (req, res) => {
    try {
      const seller_id = req.user_id;
      const { warehouseOrders, deliveryRow, courierId } = req.body;

      const mappedRow = warehouseOrders.map((e) => {
        return {
          id: e?.uuid,
          order_id: e?.orderId,
          cathegory: e?.cathegory,
          tissue: e?.tissue,
          title: e?.title,
          cost: e?.price,
          sale: e?.sale,
          qty: e?.qty,
          sum: e?.sum,
          model_id: e?.model,
          status: e?.status,
          is_first: e?.is_first,
        };
      });

      const mappedDeliveryRow = deliveryRow.map((e) => {
        console.log("sent delivery date - ", e?.delivery_date);
        console.log("in new Date - ", new Date(e?.delivery_date));
        return {
          price: e?.price,
          order_id: e?.order_id,
          courier_id: courierId,
          delivery_date: new Date(e?.delivery_date),
          trip_id: e?.trip_id,
        };
      });

      const [newOrders] = await OrderModel.bulkCreate(mappedRow);
      const [newDelivery] = await DeliveryModel.bulkCreate(mappedDeliveryRow);
      res.json("Written!");
    } catch (error) {
      console.log(error);
      res.status(500).json(error?.message || "Database error");
    }
  },
  GET_STATISTICS: async (req, res) => {
    try {
      const { user_id } = req;
      const sellers = req.body.sellers?.length
        ? req.body.sellers
        : [{ label: "Все продавцы", value: { [Op.not]: null } }];
      const user = await SellerModel.findOne({ where: { id: user_id } });
      if (user?.role != "SUPER_ADMIN" && user?.role != "ACCOUNTANT")
        return res.status(401).json("You are not an allowed user for this!");

      const type = req.query.type || "costs";

      let datasets = [];
      let dateArray = [];

      await Promise.all(
        sellers.map(async (seller) => {
          let dataset = {
            label: seller?.label,
            data: [],
            fill: false,
            backgroundColor: `#${Math.random().toString(16).substring(2, 8)}`,
            borderColor: `#${Math.random().toString(16).substring(2, 8)}`,
          };
          const model = req.body.model || { [Op.not]: null };
          const showroom = req.body.showroom || { [Op.not]: null };
          const furniture_type = req.body.furniture_type || { [Op.not]: null };
          const startDate = !isNaN(new Date(parseInt(req.body.start_date)))
            ? new Date(parseInt(req.body.start_date))
            : new Date().setDate(new Date().getDate() - 30);
          const endDate = !isNaN(new Date(parseInt(req.body.end_date)))
            ? new Date(parseInt(req.body.end_date))
            : new Date();

          const deals = await OrderModel.findAll({
            include: [
              {
                model: DealModel,
                where: {
                  createdAt: {
                    [Op.between]: [startDate, endDate],
                  },
                },
                include: [
                  {
                    model: SellerModel,
                    where: { id: seller?.value, company_id: showroom },
                  },
                ],
              },
              {
                model: ModelModel,
                where: { id: model },
                include: [
                  { model: FurnitureTypeModel, where: { id: furniture_type } },
                ],
              },
            ],
          });

          deals.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);

            // Extract the day component of the dates
            const dayA = dateA.getDate();
            const dayB = dateB.getDate();

            return dayA - dayB; // Compare based on day
          });

          const startingDate = deals.reduce(
            (min, obj) => (obj.createdAt < min ? obj.createdAt : min),
            deals[0]?.createdAt
          );
          const endingDate = deals.reduce(
            (max, obj) => (obj.createdAt > max ? obj.createdAt : max),
            deals[0]?.createdAt
          );

          const currentDate = moment(startDate); // Start with the startDate
          const diffInDays = moment(endDate).diff(currentDate, "days");
          // console.log("diff: ",diffInDays);
          for (let i = 0; i <= diffInDays; i++) {
            if (!dateArray.includes(currentDate.format("YYYY-MM-DD"))) {
              let weekday = currentDate.format("ddd")
              // console.log("current: ",currentDate.format("YYYY-MM-DD"), weekday);
              dateArray.push(currentDate.format("YYYY-MM-DD"));
            }
            currentDate.add(1, "day");
          }

          let costs = [];
          let counts = [];

          for (const date of dateArray) {
            // console.log(date);
            const objectsForDate = deals.filter(
              (obj) => obj.createdAt.toISOString().split("T")[0] === date
            );
            // console.log(objectsForDate);
            costs.push(
              objectsForDate?.length
                ? objectsForDate.reduce((a, b) => a + b?.sum * 1, 0)
                : 0
            );
            counts.push(
              objectsForDate?.length
                ? objectsForDate.reduce((a, b) => a + b?.qty * 1, 0)
                : 0
            );
            // counts.push(objectsForDate?.length);
          }
          dataset.data = type === "costs" ? costs : counts;
          datasets.push(dataset);
        })
      );

      dateArray = dateArray.map(
        (date) => date + " " + moment(date).format("ddd")
      );

      res.json({ datasets, labels: dateArray });

      // const filteredDeals = deals.filter((deal) => deal?.orders?.length);

      // res.json({ datasets, labels: dateArray });
      // res.json(deals);
    } catch (error) {
      res.status(500).json("Internall server error!");
      console.log(error);
    }
  },
  GET_STATISTICS_BY_MODEL: async (req, res) => {
    try {
      const { user_id } = req;
      const models = req.body.models?.length
        ? req.body.models
        : [{ label: "Все модели", value: { [Op.not]: null } }];
      const user = await SellerModel.findOne({ where: { id: user_id } });
      if (user?.role != "SUPER_ADMIN" && user?.role != "ACCOUNTANT")
        return res.status(401).json("You are not an allowed user for this!");

      const type = req.query.type || "costs";

      let datasets = [];
      let dateArray = [];

      await Promise.all(
        models.map(async (model) => {
          let dataset = {
            label: model?.label,
            data: [],
            fill: false,
            backgroundColor: `#${Math.random().toString(16).substring(2, 8)}`,
            borderColor: `#${Math.random().toString(16).substring(2, 8)}`,
          };
          const seller = req?.body?.seller || { [Op.not]: null };
          const myModel = model?.value || { [Op.not]: null };
          const showroom = req.body.showroom || { [Op.not]: null };
          const furniture_type = req.body.furniture_type || { [Op.not]: null };
          const startDate = !isNaN(new Date(parseInt(req.body.start_date)))
            ? new Date(parseInt(req.body.start_date))
            : new Date().setDate(new Date().getDate() - 30);
          const endDate = !isNaN(new Date(parseInt(req.body.end_date)))
            ? new Date(parseInt(req.body.end_date))
            : new Date();

          const deals = await OrderModel.findAll({
            include: [
              {
                model: DealModel,
                where: {
                  createdAt: {
                    [Op.between]: [startDate, endDate],
                  },
                },
                include: [
                  {
                    model: SellerModel,
                    where: { id: seller, company_id: showroom },
                  },
                ],
              },
              {
                model: ModelModel,
                where: { id: myModel },
                include: [
                  { model: FurnitureTypeModel, where: { id: furniture_type } },
                ],
              },
            ],
          });

          deals.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);

            // Extract the day component of the dates
            const dayA = dateA.getDate();
            const dayB = dateB.getDate();

            return dayA - dayB; // Compare based on day
          });

          const startingDate = deals.reduce(
            (min, obj) => (obj.createdAt < min ? obj.createdAt : min),
            deals[0]?.createdAt
          );
          const endingDate = deals.reduce(
            (max, obj) => (obj.createdAt > max ? obj.createdAt : max),
            deals[0]?.createdAt
          );

          const currentDate = moment(startDate); // Start with the startDate
          const diffInDays = moment(endDate).diff(currentDate, "days");

          for (let i = 0; i <= diffInDays; i++) {
            if (!dateArray.includes(currentDate.format("YYYY-MM-DD"))) {
              dateArray.push(currentDate.format("YYYY-MM-DD"));
            }
            currentDate.add(1, "day");
          }

          let costs = [];
          let counts = [];

          for (const date of dateArray) {
            const objectsForDate = deals.filter(
              (obj) => obj.createdAt.toISOString().split("T")[0] === date
            );
            costs.push(
              objectsForDate?.length
                ? objectsForDate.reduce((a, b) => a + b?.sum * 1, 0)
                : 0
            );
            counts.push(
              objectsForDate?.length
                ? objectsForDate.reduce((a, b) => a + b?.qty * 1, 0)
                : 0
            );
            // counts.push(objectsForDate?.length);
          }
          dataset.data = type === "costs" ? costs : counts;
          datasets.push(dataset);
        })
      );

      dateArray = dateArray.map(
        (date) => date + " " + moment(date).format("ddd")
      );

      res.json({ datasets, labels: dateArray });

      // const filteredDeals = deals.filter((deal) => deal?.orders?.length);

      // res.json({ datasets, labels: dateArray });
      // res.json(deals);
    } catch (error) {
      res.status(500).json("Internall server error!");
      console.log(error);
    }
  },
};
