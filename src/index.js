const express = require("express");
const collectorFunction = require("./utils/functions/collectorFunction");
const paymentFunction = require("./utils/functions/paymentFunction");
const getIds = require("./utils/functions/getId");
const { google } = require("googleapis");
const keys = require("../keyss.json");
const app = express();
const cors = require("cors");
const sequelize = require("./utils/sequelize");
const model = require("./model");
const authMiddleware = require("./middlewares/auth.middleware");
const router = require("./routes");
const PORT = process.env.PORT || 3007;
const ClientModel = require("./model/client.model");
const DealModel = require("./model/deal.model");
const OrderModel = require("./model/order.model");
const PaymentModel = require("./model/payment.model");
const SellerModel = require("./model/seller.model");
const ModelModel = require("./model/model.model");
const FurnitureTypeModel = require("./model/furnitureType.model");
const ApplyModel = require("./model/apply.model");
const DeliveryModel = require("./model/delivery.model");

const sellerController = require("./controllers/seller.controller");
const deliveryFunction = require("./utils/functions/deliveryFunction");
const ApprovalModel = require("./model/approval.model");
const WalletModel = require("./model/wallet.model");
const CompanyModel = require("./model/company.model");
const approvalFunction = require("./utils/functions/approvalFunction");

const cron = require('node-cron');
const scheduledFunctions = require("./utils/scheduledFunctions");


const client = new google.auth.JWT(keys.client_email, null, keys.private_key, [
  "https://www.googleapis.com/auth/spreadsheets",
]);

client.authorize(async function (err, tokens) {
  if (err) {
    console.log(err);
    return;
  } else {
    console.log("Connected!");
    const sheets = google.sheets({ version: "v4", auth: client });
    app.get("/sheet-data", async (_, res) => {
      const idArray = await getIds(
        sheets,
        "1yPBE1DbALfP89PV5JaL7Ax2TrlmPRdX4E4am2d6bO5Y",
        "idList!A2:A"
      );
      const mappedRow = idArray.map((id, i) => {
        return {
          order_id: id,
          cathegory: "заказ",
          tissue: "copy tissue",
          title: "copy title",
          cost: 0,
          sale: 0,
          qty: 0,
          sum: 0,
        };
      });
      const copiedIds = await OrderModel.bulkCreate(mappedRow);
      res.json(copiedIds);
    });
    setInterval(async () => {
      try {
        const sendData = await CompanyModel.findAll({
          attributes: [
            "company_id",
            [sequelize.fn("count", sequelize.col("*")), "count"],
          ],
          group: ["company_id"],
        });
        const deals = await DealModel.findAll({
          where: { copied: false },
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
        const applies = await ApplyModel.findAll({
          where: { copied: false },
          include: [SellerModel],
          order: [["apply_id", "ASC"]],
        });
        const payments = await PaymentModel.findAll({
          where: { copied: false },
          include: [
            {
              model: DealModel,
              include: [
                { model: OrderModel },
                { model: ClientModel },
                { model: SellerModel },
              ],
            },
            { model: DeliveryModel, attributes: ["increment_id"] },
            { model: SellerModel },
          ],
        });
        const deliveries = await DeliveryModel.findAll({
          where: { copied: false },
          include: [
            {
              model: OrderModel,
            },
            { model: SellerModel, attributes: ["name", "company_id"] },
          ],
        });
        const approvals = await ApprovalModel.findAll({
          where: { copied: false },
          include: [
            {
              model: ApplyModel,
              include: [{ model: SellerModel, attributes: ["name"] }],
            },
            { model: WalletModel },
            { model: CompanyModel },
          ],
        });
        collectorFunction(deals, applies, sendData, sheets);
        paymentFunction(sheets, payments, "Доплаты!A2:K", sendData);
        if (deliveries?.length) {
          deliveryFunction(
            sheets,
            deliveries,
            "Рейсы из базы данных!A2:F",
            sendData
          );
          const delivery_ids = deliveries.map((delivery) => delivery?.id);
          const updatedDeliveries = await DeliveryModel.update(
            { copied: true },
            { where: { id: delivery_ids } }
          );
        }
        if (payments?.length) {
          const payment_ids = payments.map((payment) => payment?.id);
          const updatedPayments = await PaymentModel.update(
            { copied: true },
            { where: { id: payment_ids } }
          );
        }
        if (approvals?.length) {
          approvalFunction(
            sheets,
            approvals,
            "Оплаты на Заяавку!A1:P2",
            "1QP4zyQKa0rzpwYjz_oIt7_uJkpwL330sPPKVdePoJYs"
          );
          const approval_ids = approvals.map((approval) => approval?.id);
          const updatedApprovals = await ApprovalModel.update(
            { copied: true },
            { where: { id: approval_ids } }
          );
        }
      } catch (error) {
        console.log(error);
      }
    }, 1000 * 60);
  }
});

const corsOptions = {
  origin: [
    "http://localhost:3030",
    "http://localhost:3001",
    "https://woodline-delivery-with-google-sheets-client.vercel.app",
    "https://woodline-selling-with-google-sheets-client.vercel.app",
  ],
};

app.use(express.json());
app.use(cors(corsOptions));

// sequelize.authenticate().then(() => console.log("Connection is on")).catch(err => console.log(err));

sequelize
    .authenticate()
    .then(() => {
        console.log("Connection has been established successfully database");
    })
    .catch((error) => {
        console.error("Unable to connect to the database:", error);
    });

// Run migrations to create or update the database schema
(async () => {
    await sequelize.sync({ force: false }); // Set force to true to recreate the tables (use with caution in production)
})();

app.post("/login", sellerController.LOG_IN);

app.use(authMiddleware);

app.use(router);

cron.schedule('* * * * *', async () => {
  await scheduledFunctions.ACTIVATE_BOOKED_ORDER()
})

app.listen(PORT, console.log(`Server is listening on port ${PORT}`));


/* woodline@nodejs-gs-395411.iam.gserviceaccount.com */