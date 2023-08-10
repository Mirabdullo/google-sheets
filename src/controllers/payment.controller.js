const DealModel = require("../model/deal.model");
const { Op } = require("sequelize");
const PaymentModel = require("../model/payment.model");
const SellerModel = require("../model/seller.model");
const OrderModel = require("../model/order.model");

module.exports = {
    GET: async (_, res) => {
        try {
            const payments = await PaymentModel.findAll({
              include: {
                model: SellerModel,
                where: {
                  id: {
                    [Op.not]: null,
                  },
                },
              },
              where: { is_active: true },
              order: [['createdAt', 'DESC']]
            });
            res.json(payments);
            // let payments = await PaymentModel.findAll({ include: { model: SellerModel }, paranoid: false });

            // const sellers = await SellerModel.findAll({ paranoid: false });
            // Promise.all(
            //     payments.map((payment) => {
            //         let comp = sellers.find((seller) => payment.teller_id === seller.id);
            //         console.log(payment?.dataValues);
            //         console.log(comp?.dataValues);
            //         payment.company_id = comp?.dataValues?.comp_id;
            //         return payment.save();
            //     })
            // )
            //     .then(() => console.log("succesfuly"))
            //     .catch((error) => console.log(error));
            // res.json(payments);
        } catch (error) {
            console.log(error);
        }
    },
    GET_BY_DEAL_ID: async (req, res) => {
        try {
            const id = req.params.dealId;
            const order = await OrderModel.findAll({ where: { deal_id: id } });
            const payment = await PaymentModel.findAll({
                where: { deal_id: id },
                attributes: ["payment_type", "payment_sum", "payment_dollar"],
            });
            res.json({ orders: order, payments: payment });
        } catch (error) {
            console.log(error);
        }
    },
    POST: async (req, res) => {
        try {
            const { deal_id, payment_type, payment_sum, payment_dollar, dollar_to_sum, change } = req.body.data;
            const [newPayment] = await PaymentModel.create({
                deal_id,
                payment_type,
                payment_sum,
                payment_dollar,
                dollar_to_sum,
                change,
            });
            res.json(newPayment);
        } catch (error) {
            console.log(error);
        }
    },
    EXTRA_POST: async (req, res) => {
        try {
            const { user_id } = req;
            const { paymentRow, deal } = req.body.data;

            const totalPayment = paymentRow.reduce((a, b) => a + b?.total_sum * 1, 0);

            const mappedPayment = paymentRow.map((payment) => {
                return {
                    payment_type: payment?.payment_type,
                    payment_sum: payment?.payment_sum,
                    payment_dollar: payment?.payment_$,
                    dollar_to_sum: payment?.amount_by_kurs,
                    change: payment?.change,
                    teller_id: user_id,
                    copied: false,
                    is_first: false,
                    deal_id: deal?.id,
                    wallet_id: payment?.wallet_id,
                    teller_id: user_id,
                };
            });

            const newPayment = await PaymentModel.bulkCreate(mappedPayment);
            const changedDeal = await DealModel.update(
                {
                    rest: deal?.rest * 1 - totalPayment * 1,
                },
                { where: { id: deal?.id } }
            );

            res.status(200).json("new payment created!");
        } catch (error) {
            res.status(500).json("database error");
            console.log(error);
        }
    },
    DELETE: async (req, res) => {
        try {
            const { user_id } = req;
            const requester = await SellerModel.findOne({ where: { id: user_id } });

            if (requester?.role != "ACCOUNTANT" && requester?.role != "SUPER_ADMIN") {
                return res.status(401).json("You are not allowed user!");
            }
            const condidate = await PaymentModel.findOne({where: { id: req.params.id}});
            if (!condidate) {
                return res.status(404).json("No data found for this id");
            }
            let deal = await DealModel.findOne({ where: { id: condidate.deal_id } });
            deal.rest = deal.rest + condidate.payment_sum;
            await deal.save();
            await condidate.destroy();

            res.json("Data deleted successfully");
        } catch (error) {
            console.log(error);
        }
    },
};
