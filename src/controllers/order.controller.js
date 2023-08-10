const OrderModel = require("../model/order.model");
const DealModel = require("../model/deal.model");
const SellerModel = require("../model/seller.model");
const ClientModel = require("../model/client.model");
const ModelModel = require("../model/model.model");
const PaymentModel = require("../model/payment.model");
const { Op } = require("sequelize");
const Companies = require("../model/company.model");
const WareHouseProduct = require("../model/warehouseProduct.model");
const Warehouse = require("../model/warehouse.model");
const FurnitureType = require("../model/furnitureType.model");
const logOrderChanged = require("../utils/triggerFunction");

function makeSixDigit(number) {
    let arr = [];
    if (number.toString().length < 6) {
        for (let i = 0; i < number.toString().length; i++) {
            const element = number.toString().split("")[i];
            element ? arr.push(element) : "0";
        }
        return arr.join("");
    }
    return number;
}

function getRandomNumberFromArray(arr) {
    // Get a random index from the array
    const randomIndex = Math.floor(Math.random() * arr.length);

    // Get the element at the random index
    const randomElement = arr[randomIndex];

    // Return the random element
    return randomElement;
}

function generateId(idArray) {
    const digits = 5;
    const maxAttempts = 100;
    let attempts = 0;
    let randomNumber = 0;

    const existingIds = idArray;
    const ids = existingIds.length ? existingIds.map((e) => e.order_id) : [];
    do {
        randomStart = getRandomNumberFromArray([1, 3, 4, 5, 8]);
        randomNumber = `${randomStart}${Math.floor(Math.random() * Math.pow(10, digits))}`;
        randomNumber = makeSixDigit(randomNumber);
        attempts++;
    } while (ids.includes(randomNumber.toString()) && attempts < maxAttempts);

    if (attempts === maxAttempts) {
        return "Error";
    }

    return randomNumber;
}

module.exports = {
    GET: async (_, res) => {
        try {
            const orders = await OrderModel.findAll({ where: { is_active: true }, order: [["createdAt", "DESC"]] });
            res.json(orders);
        } catch (error) {
            console.log(error);
        }
    },
    GET_ID: async (_, res) => {
        try {
            const orders = await OrderModel.findAll({
                attributes: ["order_id"],
                order: [["createdAt", "DESC"]],
            });
            const newId = generateId(orders);
            res.json(newId);
        } catch (error) {
            console.log(error);
        }
    },
    GET_BY_ORDER_ID: async (req, res) => {
        try {
            const id = req.params.orderId;
            const order = await OrderModel.findOne({
                where: { order_id: id },
                attributes: ["order_id", "title", "cathegory", "cost", "qty", "tissue", "sale", "is_active"],
            });
            res.json(order);
        } catch (error) {
            console.log(error);
        }
    },
    GET_BY_ID: async (req, res) => {
        try {
            const { user_id } = req;
            const { order_id, tissue } = req.query;
            const user = await SellerModel.findOne({ where: { id: user_id } });
            const { role } = user.dataValues;
            // if (role != "TELLER" && role != "SUPER_ADMIN") {
            //   return res.json([]);
            // }
            console.log(order_id);
            if (order_id || tissue) {
                const orders = await OrderModel.findAll({
                    include: [
                        {
                            model: DealModel,
                            include: [SellerModel, ClientModel, PaymentModel],
                        },
                        ModelModel,
                    ],
                    where: {
                        deal_id: {
                            [Op.not]: null,
                        },
                        [order_id ? "order_id" : "tissue"]: {
                            [Op.iLike]: `%${order_id || tissue}%`,
                        },
                        is_active: true,
                    },
                });
                return res.json(orders);
            }
            return res.json([]);
        } catch (error) {
            res.status(500).json("Internal server error!");
            console.log(error);
        }
    },
    GET_BY_CLIENT: async (req, res) => {
        try {
            const { user_id } = req;
            const { name, phone } = req.query;
            const user = await SellerModel.findOne({ where: { id: user_id } });
            const { role } = user.dataValues;
            // if (role != "TELLER" && role != "SUPER_ADMIN") {
            //   return res.json([]);
            // }
            if (name || phone) {
                const orders = await OrderModel.findAll({
                    include: [
                        {
                            model: DealModel,
                            where: {
                                client_id: {
                                    [Op.not]: null,
                                },
                            },
                            include: [
                                {
                                    model: ClientModel,
                                    where: {
                                        [name ? "name" : "phone"]: {
                                            [Op.iLike]: `%${name || phone}%`,
                                        },
                                    },
                                },
                                SellerModel,
                                PaymentModel,
                            ],
                        },
                        ModelModel,
                    ],
                    where: {
                        deal_id: {
                            [Op.not]: null,
                        },
                        is_active: true,
                    },
                    order: [["createdAt", "DESC"]],
                });
                return res.json(orders);
            }
            return res.json([]);
        } catch (error) {
            res.status(500).json("Internal server error!");
            console.log(error);
        }
    },
    GET_BY_MODEL: async (req, res) => {
        try {
            const { user_id } = req;
            const { model_name } = req.query;
            const user = await SellerModel.findOne({ where: { id: user_id } });
            const { role } = user.dataValues;
            // if (role != "TELLER" && role != "SUPER_ADMIN") {
            //   return res.json([]);
            // }
            if (model_name) {
                const orders = await OrderModel.findAll({
                    include: [
                        {
                            model: DealModel,
                            where: {
                                client_id: {
                                    [Op.not]: null,
                                },
                            },
                            include: [
                                {
                                    model: ClientModel,
                                },
                                SellerModel,
                                PaymentModel,
                            ],
                        },
                        {
                            model: ModelModel,
                            where: {
                                name: {
                                    [Op.iLike]: `%${model_name}%`,
                                },
                            },
                        },
                    ],
                    where: {
                        deal_id: {
                            [Op.not]: null,
                        },
                        model_id: {
                            [Op.not]: null,
                        },
                        is_active: true,
                    },
                    order: [["createdAt", "DESC"]],
                });
                return res.json(orders);
            }
            return res.json([]);
        } catch (error) {
            res.status(500).json("Internal server error!");
            console.log(error);
        }
    },
    GET_BY_DEAL: async (req, res) => {
        try {
            const { user_id } = req;
            const { rest } = req.query;
            const user = await SellerModel.findOne({ where: { id: user_id } });
            const { role } = user.dataValues;
            // if (role != "TELLER" && role != "SUPER_ADMIN") {
            //   return res.json([]);
            // }
            if (rest) {
                const orders = await OrderModel.findAll({
                    include: [
                        {
                            model: DealModel,
                            where: {
                                client_id: {
                                    [Op.not]: null,
                                },
                                rest: Number(rest),
                            },
                            include: [
                                {
                                    model: ClientModel,
                                },
                                SellerModel,
                                PaymentModel,
                            ],
                        },
                        {
                            model: ModelModel,
                        },
                    ],
                    where: {
                        deal_id: {
                            [Op.not]: null,
                        },
                        model_id: {
                            [Op.not]: null,
                        },
                        is_active: true,
                    },
                    order: [["createdAt", "DESC"]],
                });
                return res.json(orders);
            }
            return res.json([]);
        } catch (error) {
            res.status(500).json("Internal server error!");
            console.log(error);
        }
    },
    GET_BY_DEAL_ID: async (req, res) => {
        try {
            const { user_id } = req;
            const { deal_id } = req.query;
            const user = await SellerModel.findOne({ where: { id: user_id } });
            const { role } = user.dataValues;
            // if (role != "TELLER" && role != "SUPER_ADMIN") {
            //   return res.json([]);
            // }
            if (deal_id) {
                const orders = await OrderModel.findAll({
                    include: [
                        {
                            model: DealModel,
                            where: {
                                client_id: {
                                    [Op.not]: null,
                                },
                                id: 100000000 - deal_id,
                            },
                            include: [
                                {
                                    model: ClientModel,
                                },
                                SellerModel,
                            ],
                        },
                        {
                            model: ModelModel,
                        },
                    ],
                    where: {
                        deal_id: {
                            [Op.not]: null,
                        },
                        model_id: {
                            [Op.not]: null,
                        },
                        is_active: true,
                    },
                    order: [["createdAt", "DESC"]],
                });
                return res.json(orders);
            }
            return res.json([]);
        } catch (error) {
            res.status(500).json("Internal server error!");
            console.log(error);
        }
    },
    GET_BY_SELLER: async (req, res) => {
        try {
            const { user_id } = req;
            const orders = await DealModel.findAll({
                where: { seller_id: user_id, is_active: true },
                include: [SellerModel, ClientModel, OrderModel],
                order: [["createdAt", "DESC"]],
                limit: 30,
            });
            res.json(orders);
        } catch (error) {
            console.log(error);
        }
    },
    GET_FOR_PRODUCER: async (req, res) => {
        try {
            const { user_id } = req;
            const status = req.query.status;

            const user = await SellerModel.findOne({ where: { id: user_id } });
            const company = await Companies.findOne({ where: { company_id: user.company_id } });
            let options = {};
            if (user?.role != "PRODUCER" && user?.role != "SUPER_ADMIN") {
                return res.status(401).json(`You are not allowed ${user.name}`);
            }

            if (status != "NEW" && status != "ACCEPTED" && status != "REJECTED") {
                return res.status(401).json(`You are not allowed ${user.name}`);
            }

            if (status === "ACCEPTED") {
                options.status = { [Op.in]: ["ACCEPTED", "CREATED"] };
            } else {
                options.status = status;
            }
            const order = await OrderModel.findAll({
                where: options,
                include: [
                    {
                        model: ModelModel,
                        attributes: ["name"],
                        where: {
                            company_id: company.id,
                        },
                        include: {
                            model: FurnitureType,
                            attributes: ["name"],
                        },
                    },
                    {
                        model: DealModel,
                        attributes: ["delivery_date"],
                        order: [["delivery_date", "DESC"]],
                    },
                ],
                order: [["createdAt", "ASC"]],
            });

            res.json(order);
        } catch (error) {
            console.log(error);
            res.status(500).json(error.message);
        }
    },
    POST: async (req, res) => {
        try {
            const { cathegory, order_id, model, tissue, delivery_date, title, cost, sale, qty, sum, model_id } = req.body.data;
            const [newOrder] = await OrderModel.create(req.body.data);
            res.json(newOrder);
        } catch (error) {
            console.log(error);
        }
    },
    BULK_CREATE_WITH_ID: async (req, res) => {
        try {
            const { orders } = req.body.data;
            const [newOrders] = await OrderModel.bulkCreate(orders);
            res.json(newOrders);
        } catch (error) {
            console.log(error);
        }
    },
    PUT: async (req, res) => {
        try {
            const { order } = req.params;
            const { cost, qty, model, tissue, title } = req.body;
            const oldOrder = await OrderModel.findOne({ where: { id: order } });

            if (!oldOrder) {
                return res.status(400).json("Order not found!");
            }

            const updatedOrder = await OrderModel.update(
                {
                    title: title || oldOrder?.title,
                    cost: cost || oldOrder?.cost,
                    qty: qty || oldOrder?.qty,
                    model_id: model || oldOrder?.model_id,
                    tissue: tissue || oldOrder?.tissue,
                },
                { where: { id: order }, returning: true, plain: true }
            );

            await logOrderChanged(updatedOrder[1].id, updatedOrder[1].dataValues);

            if (cost || qty) {
                const DealOfOrder = await DealModel.findOne({
                    where: { id: oldOrder?.deal_id },
                    attributes: ["id", "rest"],
                });

                const oldRest = DealOfOrder?.rest * 1;
                const newRest = oldRest - oldOrder?.sum * 1 + (cost || oldOrder?.cost) * 1 * (qty || oldOrder?.qty) * 1;

                const changeDeal = await DealModel.update({ rest: newRest }, { where: { id: DealOfOrder?.id } });
            }

            res.json(updatedOrder);
        } catch (error) {
            console.log(error);
            res.status(501).json("Internall server error!");
        }
    },
    DISACTIVATE: async (req, res) => {
        try {
            const { user_id } = req;
            const { order } = req.params;
            const { is_active, deal_rest } = req.body;
            const requester = await SellerModel.findOne({ where: { id: user_id } });
            if (requester?.role != "ACCOUNTANT" && requester?.role != "SUPER_ADMIN") {
                return res.status(401).json("You are not allowed user!");
            }

            const foundOrder = await OrderModel.findOne({ where: { id: order } });

            if (!foundOrder) {
                return res.status(400).json("Order not found!");
            }

          const updatedOrder = await OrderModel.update({ is_active }, { where: { id: order }, returning: true, plain: true });
          
            await logOrderChanged(updatedOrder[1].id, updatedOrder[1].dataValues);
            const updatedDeal = await DealModel.update(
                {
                    rest: deal_rest * 1 - foundOrder?.sum * 1,
                },
                { where: { id: foundOrder?.deal_id } }
            );
            res.json(updatedOrder);
        } catch (error) {
            console.log(error);
        }
    },
    CHANGE_STATUS: async (req, res) => {
        try {
            const { user_id } = req;
            const id = req.params.id;
            const status = req.query.status;

            const user = await SellerModel.findOne({ where: { id: user_id } });

            const order = await OrderModel.findOne({ where: { id: id, status: { [Op.ne]: "BOOKED" } } });
            if (!order) {
                return res.status(404).json(`WARNING: Not found order for this id: ${id} or this order <<BOOKED>>`);
            }

            if (status === "NEW") {
                if (
                    user.role != "PRODUCER" &&
                    user.role != "STOREKEEPER" &&
                    user.role != "MAIN_STOREKEEPER" &&
                    user.role != "SELLER" &&
                    user.role != "SUPER_ADMIN"
                ) {
                    return res.status(401).json(`WARNING: You are not allowed ${user.name}`);
                }
            } else if (status === "ACCEPTED" || status === "REJECTED") {
                if (user.role != "PRODUCER" && user.role != "SUPER_ADMIN" && user.role != "MAIN_STOREKEEPER") {
                    return res.status(401).json(`WARNING: You are not allowed ${user.name}`);
                }

                if (status === "ACCEPTED") {
                    if (order.status !== "NEW") {
                        return res.status(403).json("this order status not NEW, order status must be NEW");
                    }
                    const warehouse = await Warehouse.findOne({ where: { company_id: user.comp_id } });
                    if (!warehouse) {
                        return res.status(404).json("Warehouse not found");
                    }
                    await WareHouseProduct.create({
                        warehouse_id: warehouse.id,
                        order_id: id,
                    });

                    order.status = "SOLD";
                    await order.save();

                    await logOrderChanged(order.id, order.dataValues);

                    return res.status(200).json(order);
                }
            } else if (
                status === "DELIVERED" ||
                status === "ACTIVE" ||
                status === "VIEWED_STOREKEEPER" ||
                status === "READY_TO_DELIVERY" ||
                status === "DEFECTED" ||
                status === "RETURNED" ||
                status === "SOLD_AND_CHECKED"
            ) {
                if (user.role != "STOREKEEPER" && user.role != "MAIN_STOREKEEPER" && user.role != "SUPER_ADMIN") {
                    return res.status(401).json(`WARNING: You are not allowed ${user.name}`);
                }

                if (status === "ACTIVE" && order.status === "ACCEPTED") {
                    order.status = "SOLD_AND_CHECKED";
                    await order.save();
                    await logOrderChanged(order.id, order.dataValues);
                    return res.status(200).json("success");
                }
            } else if (status === "SOLD") {
                if (user.role != "SELLER" && user.role != "SUPER_ADMIN") {
                    return res.status(401).json(`WARNING: You are not allowed ${user.name}`);
                }

                order.status = status;
                order.copied = true;
                order.save();

                await logOrderChanged(order.id, order.dataValues);

                res.status(200).json(order);
            } else {
                return res.status(404).json(`WARNING: Status invalid`);
            }

            order.status = status;
            await order.save();

            await logOrderChanged(order.id, order.dataValues);

            res.json(order);
        } catch (error) {
            console.log(error);
            res.status(500).json(error.message);
        }
    },

    BOOKED_ORDER: async (req, res) => {
        try {
            const { user_id } = req;
            const orderId = req.params.id;
            const { end_date } = req.body;

            const user = await SellerModel.findOne({ where: { id: user_id } });

            if (user.role != "SELLER" && user.role != "SUPER_ADMIN") {
                return res.status(401).json(`You are not allowed ${user.name}`);
            }
            const order = await OrderModel.findOne({ where: { id: orderId, status: "ACTIVE" } });
            if (!order) {
                return res.status(404).json(`WARNING: Not found order for this id ${orderId}`);
            }

            if (!end_date) {
                return res.status(404).json(`WARNING: Must be entered end_date for to booked`);
            }

            const updateOrder = await OrderModel.update(
                {
                    status: "BOOKED",
                    seller_id: user_id,
                    end_date: end_date,
                },
                { where: { id: orderId }, returning: true, plain: true }
            );
          
            await logOrderChanged(updateOrder[1].id, updateOrder[1].dataValues);

            res.status(200).json("Order booked successfully");
        } catch (error) {
            console.log(error);
            res.status(500).json(error.message);
        }
    },
    UNBOOKED_ORDER: async (req, res) => {
        try {
            const { user_id } = req;
            const orderId = req.params.id;

            const user = await SellerModel.findOne({ where: { id: user_id } });

            if (user.role != "SELLER" && user.role != "SUPER_ADMIN") {
                return res.status(401).json(`WARNING: You are not allowed ${user.name}`);
            }
            const order = await OrderModel.findOne({ where: { id: orderId, status: "BOOKED" } });
            if (!order) {
                return res.status(404).json(`WARNING: This order cannot be booked`);
            }
            if (order.seller_id !== user_id) {
                return res.status(401).json(`WARNING: You are not allowed this order to activate`);
            }

            const updateOrder = await OrderModel.update({ status: "ACTIVE", seller_id: null, end_date: null }, { where: { id: orderId }, returning: true, plain: true });

            await logOrderChanged(updateOrder[1].id, updateOrder[1].dataValues);
          
            return res.status(200).json("Order has been updated successfully");
        } catch (error) {
            console.log(error);
            res.status(500).json(error.message);
        }
    },
    DELETE: async (req, res) => {
        try {
            const { user_id } = req;
            const requester = await SellerModel.findOne({ where: { id: user_id } });

            if (requester?.role != "ACCOUNTANT" && requester?.role != "SUPER_ADMIN") {
                return res.status(401).json(`You are not allowed ${user.name}`);
            }
            const condidate = await OrderModel.findOne({where: {id: req.params.id}});
            if (!condidate) {
                return res.status(404).json("No data found for this id");
            }

            const orders = await OrderModel.findAll({ where: { deal_id: condidate.deal_id } });
            const payments = await PaymentModel.findAll({ where: { deal_id: condidate.deal_id } });
            console.log(orders.length, payments);
            const summa =
                orders.reduce((sum, order) => sum + order.cost, 0) -
                payments.reduce((sum, pay) => sum + (+pay.payment_sum + +pay.dollar_to_sum - +pay.change), 0);

            const deal = await DealModel.findOne({ where: { deal_id: condidate.deal_id } });
            console.log(summa, deal);
            deal.rest = summa;
            await deal.save();

            await condidate.destroy(); //delete order

            res.json("Data deleted successfully");
        } catch (error) {
            console.log(error);
        }
    },
};
