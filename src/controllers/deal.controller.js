const { Op } = require("sequelize");
const DealModel = require("../model/deal.model");
const OrderModel = require("../model/order.model");
const PaymentModel = require("../model/payment.model");
const SellerModel = require("../model/seller.model");
const ClientModel = require("../model/client.model");
const sequelize = require("../utils/sequelize");
const WareHouseProduct = require("../model/warehouseProduct.model");
const Client = require("../model/client.model");
const Models = require("../model/model.model");
const logOrderChanged = require("../utils/triggerFunction");

module.exports = {
    GET: async (_, res) => {
        try {
            const deals = await DealModel.findAll({
                where: { is_active: true },
                order: [["createdAt", "DESC"]],
            });
            res.json(deals);
        } catch (error) {
            console.log(error);
        }
    },
    EDIT_REST: async (req, res) => {
        try {
            const { user_id } = req;
            const requester = await SellerModel.findOne({ where: { id: user_id } });

            if (requester?.role != "SUPER_ADMIN" && requester?.role != "ACCOUNTANT") {
                return res.status(401).json("You are not allowed user!");
            }

            const { rest } = req.body;
            const { deal } = req.params;

            const updated_deal = await DealModel.update({ rest }, { where: { id: deal } });
            res.json(updated_deal);
        } catch (error) {
            res.status(500).json("Error: " + error.message);
            console.log(error);
        }
    },

    ADD_ORDER: async (req, res) => {
        try {
            const { user_id } = req;
            const { deal_rest, order_id, cathegory, tissue, title, cost, sale, qty, sum, deal_id, model_id } = req.body;
            const requester = await SellerModel.findOne({ where: { id: user_id } });
            if (requester?.role != "ACCOUNTANT" && requester?.role != "SUPER_ADMIN") {
                return res.status(401).json("You are not teller!");
            }

            const newOrder = await OrderModel.create({
                order_id,
                cathegory,
                tissue,
                title,
                cost,
                sale,
                qty,
                sum,
                deal_id,
                model_id,
                copied: true,
            });
            const updatedDeal = await DealModel.update({ rest: deal_rest * 1 + sum * 1 }, { where: { id: deal_id } });
            res.json(newOrder);
        } catch (error) {
            res.status(500).json("Internal Server Error");
            console.log(error);
        }
    },
    GET_DEPT: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1; // Current page number
            const limit = parseInt(req.query.limit) || 10; // Number of applies per page
            const offset = (page - 1) * limit; // Offset for pagination

            const { count, rows: depts } = await DealModel.findAndCountAll({
                where: { is_active: true, rest: { [Op.gt]: 0 } },
                order: [["createdAt", "DESC"]],
                include: [
                    {
                        model: OrderModel,
                        attributes: ["order_id"],
                    },
                    { model: ClientModel, attributes: ["name", "phone"] },
                    // { model: PaymentModel},
                    { model: SellerModel, attributes: ["name"] },
                ],
                offset,
                limit,
            });

            res.json({ depts, totalAmount: count });
        } catch (error) {
            res.status(500).json("Internal Server Error");
            console.log(error);
        }
    },
    SEARCH_DEAL: async (req, res) => {
        try {
            const search = req.query.search
            let options = {}
            if (search) {
                
            }
        } catch (error) {
            console.log(error);
            res.status(500).json(error.message)
        }
    },
    SEARCH_DEPT: async (req, res) => {
        try {
            const { phone } = req.params;
            const depts = await DealModel.findAll({
                where: { is_active: true, rest: { [Op.gt]: 0 } },
                order: [["createdAt", "DESC"]],
                include: [
                    {
                        model: OrderModel,
                        attributes: ["order_id"],
                        where: { is_active: true },
                    },
                    {
                        model: ClientModel,
                        where: { is_active: true, phone: { [Op.iLike]: `%${phone}%` } },
                    },
                    { model: SellerModel },
                ],
            });
            res.json({ depts });
        } catch (error) {
            res.status(500).json("Internal Server Error");
            console.log(error);
        }
    },
    POST: async (req, res) => {
        try {
            const { id_number, rest, status, client_id, seller_id } = req.body.data;
            const [newDeal] = await DealModel.create({
                id_number,
                rest,
                status,
                client_id,
                seller_id,
            });
            res.json(newDeal);
        } catch (error) {
            res.status(500).json("Internal server error");
            console.log(error);
        }
    },
    CREATE_DEAL_WITH_ORDER: async (req, res) => {
        const { user_id } = req;
        let transaction;

        try {
            transaction = await sequelize.transaction();
            const data = req.body;
            const user = await SellerModel.findOne({ where: { id: user_id } });

            if (!user) {
                return res.status(401).json("User not found");
            }

            const totalSum = data.orders.reduce((sum, order) => sum + +order.sum, 0);
            const totalPayment = data.payments.reduce((sum, payment) => sum + ((+payment.payment_sum + +payment.amount_by_kurs) - +payment.change), 0);

            
            let client = await ClientModel.findOne({
                where: { name: data.formData.clientName, phone: data.formData.phone },
                transaction,
            });

            if (!client) {
                client = await ClientModel.create(
                    {
                        name: data.formData.clientName,
                        phone: data.formData.phone,
                        where_from: data.formData.whereFrom,
                        status: data.formData.status,
                    },
                    { transaction }
                );
            }

            if (!client) {
                await transaction.rollback();
                return response.status(500).json("Client qo'shilmadi");
            }

            const deal = await DealModel.create(
                {
                    rest: totalSum ? totalSum : 0 - totalPayment ? totalPayment : 0,
                    delevery_date: data.formData.deliveryDate ? data.formData.deliveryDate : new Date(),
                    seller_id: user_id,
                    client_id: client.id,
                    is_active: true,
                    status: "NEW",
                },
                { transaction }
            );
            console.log(deal);
            const orderCreationPromises = data.orders.map(async (order) => {
                if (!order.id) {
                    await OrderModel.create(
                        {
                            order_id: order.cathegory == "заказ" ? data.formData.id : order.order_id,
                            cathegory: order.cathegory,
                            tissue: order.tissue ? order.tissue : "---",
                            title: order.title,
                            cost: order.price,
                            sale: order.sale,
                            qty: order.qty,
                            sum: order.sum,
                            deal_id: deal?.id,
                            model_id: order.model,
                        },
                        { transaction }
                    );
                } else {
                    if (order.status !== "SOLD") {
                        if (order.status === "BOOKED" && order.seller_id !== user_id) {
                            await transaction.rollback();
                            return res.status(403).json("You not sold this order");
                        }
                        const updateOrder = await OrderModel.update(
                            {
                                title: order.title,
                                cost: order.price,
                                sale: order.sale,
                                sum: order.sum,
                                qty: order.qty,
                                deal_id: deal.id,
                                status: "SOLD"
                            },
                            { where: { id: order.id }, returning: true, plain: true, transaction }
                        );

                        await logOrderChanged(updateOrder[1].id, updateOrder[1].dataValues);
                    } else {
                        await transaction.rollback();
                        return res.status(403).json("This order is already sold");
                    }
                }
            });

            await Promise.all(orderCreationPromises);

            const mappedPayment = data.payments.map((payment) => {
                return {
                    payment_type: payment.payment_type,
                    payment_sum: payment.payment_sum,
                    payment_dollar: payment.payment_$,
                    dollar_to_sum: payment.amount_by_kurs,
                    change: payment.change,
                    deal_id: deal.id,
                    teller_id: user_id,
                    is_first: payment.is_first === false ? false : true,
                    wallet_id: payment.wallet_id,
                    company_id: user.comp_id,
                    delivery_id: payment.delivery_id,
                    is_active: payment.is_active === false ? false : true,
                    status: payment.status || "NEW",
                };
            });

            await PaymentModel.bulkCreate(mappedPayment, { transaction });

            await transaction.commit();

            res.status(200).json("Created successfully");
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            console.error(error);
            res.status(500).json(error.message);
        }
    },

    DELETE: async (req, res) => {
        try {
            const { user_id } = req;
            const requester = await SellerModel.findOne({ where: { id: user_id } });

            if (requester?.role != "ACCOUNTANT" && requester?.role != "SUPER_ADMIN") {
                return res.status(401).json("You are not allowed user!");
            }
            const condidate = await DealModel.findOne({where: {id: req.params.id}});
            if (!condidate) {
                return res.status(404).json("No data found for this id");
            }
            let payments = await PaymentModel.findAll({ where: { deal_id: condidate.id } });
            let orders = await OrderModel.findAll({ where: { deal_id: condidate.id } });
            payments = payments.map((pay) => pay.id);
            orders = orders.map((order) => order.id);

            await OrderModel.destroy({
                where: {
                    id: orders,
                },
            });

            await PaymentModel.destroy({
                where: {
                    id: payments,
                },
            });

            await condidate.destroy();

            res.json("Data deleted successfully");
        } catch (error) {
            res.status(500).json(error.message);
            console.log(error);
        }
    },
};
