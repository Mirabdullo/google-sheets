const { Op } = require("sequelize");
const Model = require("../model/model.model");
const Orders = require("../model/order.model");
const Seller = require("../model/seller.model");
const Warehouse = require("../model/warehouse.model");
const WareHouseProduct = require("../model/warehouseProduct.model");
const sequelize = require("../utils/sequelize");
const FurnitureType = require("../model/furnitureType.model");
const Deals = require("../model/deal.model");
const Client = require("../model/client.model");
const logOrderChanged = require("../utils/triggerFunction");


module.exports = {
    GET: async (req, res) => {
        try {
            const { user_id } = req;
            const user = await Seller.findOne({ where: { id: user_id }});

            const allowedRoles = ["MAIN_STOREKEEPER", "SELLER", "SUPER_ADMIN"];
            if (!allowedRoles.includes(user.role)) {
                return res.status(401).json(`WARNING: You are not allowed ${user.name}`);
            }

            let options = {};

            const search = req.query.search;
            const warehouse = req.query.warehouse;

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            if (search) {
                options.where = {
                    [Op.or]: [{ "$order.order_id$": { [Op.iLike]: `%${search}%` } }, { "$order.model.name$": { [Op.iLike]: `%${search}%` } }],
                };
            }

            if (warehouse) {
                const store = await Warehouse.findOne({ where: { id: warehouse } });
                if (!store) {
                    return res.status(404).json(`WARNING: Warehouse id invalid not found warehouse for this id: ${warehouse}`);
                }
                options.where = { ...options.where, warehouse_id: warehouse };
            }

            const { count, rows: products } = await WareHouseProduct.findAndCountAll({
                where: {
                    is_active: true,
                    ...options.where,
                },
                include: [
                    {
                        model: Orders,
                        as: "order",
                        attributes: ["id", "order_id", "qty", "tissue", "cost", "sale", "title", "sum", "status"],
                        where: {
                            status: { [Op.notIn]: ["SOLD", "DELIVERED", "NEW", "ACCEPTED", "REJECTED", "TRANSFERED"] },
                        },
                        include: {
                            model: Model,
                            attributes: ["id", "name"],
                            include: {
                                model: FurnitureType,
                                attributes: ["id", "name"],
                            },
                        },
                    },
                ],
                offset,
                limit,
                order: [["createdAt", "DESC"]],
            });

            return res.json({ totalAmount: count, products: products });
        } catch (error) {
            console.log(error);
            return res.status(500).json(error.message);
        }
    },
    GET_PAGINATION: async (req, res) => {
        try {
            const { user_id } = req;
            const user = await Seller.findOne({ where: { id: user_id } });

            if (user.role != "MAIN_STOREKEEPER" && user.role != "SELLER" && user.role != "SUPER_ADMIN") {
                return res.status(401).json(`WARNING: You are not allowed ${user.name}`);
            }

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const { count, rows: products } = await WareHouseProduct.findAndCountAll({
                include: [
                    {
                        model: Orders,
                        as: "order",
                        where: { status: { [Op.ne]: "DELIVERED" } },
                        include: {
                            model: Model,
                        },
                    },
                ],
                order: [["createdAt", "DESC"]],
                offset,
                limit,
                where: { is_active: true },
            });

            res.json({ count, totalAmount: products });
        } catch (error) {
            console.log(error);
            res.status(500).json(error.message);
        }
    },
    GET_BY_STATUS: async (req, res) => {
        try {
            const { user_id } = req;
            const user = await Seller.findOne({ where: { id: user_id } });

            const allowedRoles = ["MAIN_STOREKEEPER", "SELLER", "SUPER_ADMIN", "STOREKEEPER"];
            if (!allowedRoles.includes(user.role)) {
                return res.status(401).json(`WARNING: You are not allowed ${user.name}`);
            }

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const search = req.query.search;
            const status = req.query.status;

            let options = {};
            let searchOption = {};

            if (status) {
                options.status = status;
            }

            if (search) {
                searchOption.where = {
                    [Op.or]: [{ "$order.order_id$": { [Op.iLike]: `%${search}%` } }, { "$order.model.name$": { [Op.iLike]: `%${search}%` } }],
                };
            }

            if (user.role == "STOREKEEPER") {
                const storekeeper = await Warehouse.findOne({ where: { admin: user.dataValues.id } });
                if (!storekeeper) {
                    return res.status(401).json(`WARNING: Siz hali skladga biriktirilmagansiz`);
                }

                searchOption.where = { ...searchOption.where, warehouse_id: storekeeper.id };

                if (!status) {
                    options.status = { [Op.in]: ["ACCEPTED", "SOLD", "CREATED"] };
                } else if (status === "PRODUCTS") {
                    options.status = { [Op.in]: ["SOLD_AND_CHECKED", "ACTIVE", "DEFECTED", "RETURNED"] };
                }
            }

            const { count, rows: products } = await WareHouseProduct.findAndCountAll({
                where: {
                    is_active: true,
                    ...searchOption.where,
                },
                include: [
                    {
                        model: Orders,
                        as: "order",
                        attributes: ["order_id", "qty", "tissue", "cost", "sale", "title", "sum", "status"],
                        where: options,
                        include: {
                            model: Model,
                            attributes: ["id", "name"],
                            include: {
                                model: FurnitureType,
                                attributes: ["id", "name"],
                            },
                        },
                    },
                ],
                offset,
                limit,
                order: [["createdAt", "DESC"]],
            });

            res.json({ totalAmount: count, products: products });
        } catch (error) {
            console.log(error);
            res.status(500).json(error.message);
        }
    },
    SEARCH: async (req, res) => {
        try {
            const { user_id } = req;
            const user = await Seller.findOne({ where: { id: user_id } });

            const allowedRoles = ["MAIN_STOREKEEPER", "SELLER", "SUPER_ADMIN", "STOREKEEPER"];
            if (!allowedRoles.includes(user.role)) {
                return res.status(401).json(`WARNING: You are not allowed ${user.name}`);
            }

            const search = req.query.search;

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            let optionsW = { is_active: true };

            if (user.role == "STOREKEEPER") {
                const storekeeper = await Warehouse.findOne({ where: { admin: user.id } });
                if (!storekeeper) {
                    return res.status(401).json(`WARNING: Siz hali skladga biriktirilmagansiz`);
                }
                optionsW.warehouse_id = storekeeper.id;
            }

            const { count, rows: products } = await WareHouseProduct.findAndCountAll({
                where: {
                    [Op.or]: [{ "$order.order_id$": { [Op.iLike]: `%${search}%` } }, { "$order.model.name$": { [Op.iLike]: `%${search}%` } }],
                    ...optionsW,
                },
                include: [
                    {
                        model: Orders,
                        as: "order",
                        where: { status: { [Op.in]: ["SOLD_AND_CHECKED", "ACTIVE", "DEFECTED", "RETURNED"] } },
                        include: {
                            model: Model,
                            attributes: ["id", "name"],
                            include: {
                                model: FurnitureType,
                                attributes: ["id", "name"],
                            },
                        },
                    },
                ],
                offset,
                limit,
                order: [["createdAt", "DESC"]],
            });

            res.json({ totalAmount: count, products: products });
        } catch (error) {
            console.log(error);
            res.status(500).json("Internal Server Error");
        }
    },

    SEARCH_WITH_SELLER: async (req, res) => {
        try {
            const { user_id } = req;
            const user = await Seller.findOne({ where: { id: user_id } });

            const allowedRoles = ["SELLER", "SUPER_ADMIN"];
            if (!allowedRoles.includes(user.role)) {
                return res.status(401).json(`WARNING: You are not allowed ${user.name}`);
            }

            const search = req.query.search;

            const products = await WareHouseProduct.findAll({
                where: {
                    is_active: true,
                    [Op.and]: [
                        { "$order.status$": { [Op.in]: ["ACTIVE", "BOOKED"] } },
                        {
                            [Op.or]: [{ "$order.order_id$": { [Op.iLike]: `%${search}%` } }, { "$order.model.name$": { [Op.iLike]: `%${search}%` } }],
                        },
                    ],
                },
                include: [
                    {
                        model: Warehouse,
                        as: "warehouse",
                        attributes: ["id", "name"],
                    },
                    {
                        model: Orders,
                        as: "order",
                        include: {
                            model: Model,
                            attributes: ["id", "name"],
                            include: {
                                model: FurnitureType,
                                attributes: ["id", "name"],
                            },
                        },
                    },
                ],
                order: [["createdAt", "ASC"]],
            });

            products.forEach((prod) => {
                if (prod.order.status === "BOOKED" && prod.order.seller_id === user_id) {
                    prod.order.setDataValue("can_change", true);
                } else {
                    prod.order.setDataValue("can_change", false);
                }
            });

            res.send(products);
        } catch (error) {
            console.log(error);
            res.status(500).json("Internal Server Error");
        }
    },

    SEARCH_DEAL: async (req, res) => {
        try {
            const { user_id } = req;
            const user = await Seller.findOne({ where: { id: user_id } });
            if (user.role != "MAIN_STOREKEEPER" && user.role != "SUPER_ADMIN") {
                return res.status(401).json(`WARNING: You are not allowed ${user.name}`);
            }
            const search = req.query.search;

            let options = { deal_id: { [Op.ne]: null }, status: { [Op.not]: ["DELIVERED", "SOLD"] } };

            if (search) {
                options.order_id = { [Op.iLike]: `%${search}%` };
            }

            const products = await WareHouseProduct.findAll({
                where: { is_active: true },
                include: [
                    {
                        model: Orders,
                        where: options,
                        as: "order",
                        include: [
                            {
                                model: Model,
                                attributes: ["id", "name"],
                                include: {
                                    model: FurnitureType,
                                    attributes: ["id", "name"],
                                },
                            },
                            {
                                model: Deals,
                                include: [
                                    {
                                        model: Client,
                                        attributes: ["id", "name", "phone"],
                                    },
                                    {
                                        model: Seller,
                                        attributes: ["id", "name", "phone"],
                                    },
                                ],
                            },
                        ],
                    },
                ],
                order: [["createdAt", "DESC"]],
            });

            res.json(products);
        } catch (error) {
            console.log(error);
            res.status(500).json("Internal Server Error");
        }
    },

    GET_FOR_MAIN_STOREKEEPER: async (req, res) => {
        try {
            const dealId = req.params.id;

            let options = { status: { [Op.not]: "DELIVERED" } };

            if (dealId) {
                options.deal_id = dealId;
            }
            const deal = await WareHouseProduct.findAll({
                where: { is_active: true },
                include: [
                    {
                        model: Warehouse,
                        as: "warehouse",
                        attributes: ["id", "name"],
                    },
                    {
                        model: Orders,
                        where: options,
                        as: "order",
                        include: [
                            {
                                model: Deals,
                                include: [
                                    {
                                        model: Client,
                                        attributes: ["id", "name", "phone"],
                                    },
                                    {
                                        model: Seller,
                                        attributes: ["id", "name", "phone"],
                                    },
                                ],
                            },
                            {
                                model: Model,
                                attributes: ["id", "name"],
                                include: {
                                    model: FurnitureType,
                                    attributes: ["id", "name"],
                                },
                            },
                        ],
                    },
                ],
                order: [["createdAt", "DESC"]],
            });

            res.json(deal);
        } catch (error) {
            console.log(error);
            res.status(500).json(error.message);
        }
    },

    GET_BY_DEAL_ID: async (req, res) => {
        try {
            const id = req.params.id;
            console.log(id);
            const product = await WareHouseProduct.findAll({
                where: { is_active: true },
                include: [
                    {
                        model: Orders,
                        as: "order",
                        where: { deal_id: id },
                        include: {
                            model: Model,
                        },
                    },
                ],
                order: [["createdAt", "DESC"]],
            });

            res.json(product);
        } catch (error) {
            console.log(error);
            res.status(500).json(error.message);
        }
    },
    GET_BY_ORDER_ID: async (req, res) => {
        try {
            const id = req.params.id;
            console.log(id);
            const product = await WareHouseProduct.findAll({
                where: {
                    is_active: true,
                    order_id: id,
                },
                include: [
                    {
                        model: Orders,
                        as: "order",
                        include: {
                            model: Model,
                        },
                    },
                ],
                order: [["createdAt", "DESC"]],
            });

            if (!product.length) {
                return res.status(404).json(`Not found warehouse product for this order_id: ${id}`);
            }

            res.json(product);
        } catch (error) {
            console.log(error);
            res.status(500).json(error.message);
        }
    },
    GET_FOR_STOREKEEPER: async (req, res) => {
        try {
            const { user_id } = req;
            console.log(user_id);
            const user = await Seller.findOne({where: {id: user_id}});
            if (!user) {
                return res.status(404).json("Token not found");
            }

            const products = await WareHouseProduct.findAll({
                where: { is_active: true },
                include: [
                    {
                        model: Orders,
                        as: "order",
                        where: { status: { [Op.ne]: "DELIVERED" } },
                        include: {
                            model: Model,
                        },
                    },
                ],
                order: [["createdAt", "DESC"]],
            });

            res.json(products);
        } catch (error) {
            console.log(error);
            res.status(500).json(error.message);
        }
    },
    CREATE: async (req, res) => {
        const { user_id } = req;
        let transaction;
        try {
            transaction = await sequelize.transaction();

            const { order_id, cathegory, tissue, title, cost, sale, qty, sum, model_id } = req.body;

            const user = await Seller.findOne({ where: { id: user_id } });
            if (user.role !== "STOREKEEPER") {
                return res.status(500).json("You are not allowed to create this product");
            }

            const warehouse = await Warehouse.findOne({ where: { admin: user_id }, transaction });
            if (!warehouse) {
                return res.status(404).json("You are not warehouse admin");
            }

            let category = "";
            if (warehouse.type === "витрина") {
                category = "продажa с витрины";
            } else if (warehouse.type === "склад") {
                category = "продажa со склада";
            } else {
                return res.status(403).json("Warehouse type invalid, update <витрина> or <склад>");
            }

            const order = await Orders.create(
                {
                    order_id,
                    cathegory: category,
                    tissue: tissue ? tissue : "---",
                    title,
                    cost,
                    sale,
                    qty,
                    sum,
                    model_id,
                    copied: true,
                    status: "ACTIVE",
                },
                { transaction }
            );

            const product = await WareHouseProduct.create(
                {
                    warehouse_id: warehouse.id,
                    order_id: order.id,
                },
                { transaction }
            );

            await transaction.commit();
            res.json(product);
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            console.log(error);
            res.status(500).json(`"Transaction aborted. An error occurred."\n` + error.message);
        }
    },
    BULK_CREATE_WAREHOUSE_PRODUCTS: async (req, res) => {
        let transaction;
        try {
            transaction = await sequelize.transaction();

            const { user_id } = req;
            const data = req.body;
            let role = ["STOREKEEPER", "MAIN_STOREKEEPER", "SUPER_ADMIN"];

            let warehouseId = "";
            let warehouse = {};

            const user = await Seller.findOne({ where: { id: user_id } });
            if (!role.includes(user.role)) {
                return res.status(500).json("You are not allowed to create this product");
            }

            if (user.role === "STOREKEEPER") {
                warehouse = await Warehouse.findOne({ where: { admin: user_id } });
                if (!warehouse) {
                    return res.status(404).json("You are not warehouse admin");
                }
                warehouseId = warehouse.id;
            } else {
                warehouseId = data.warehouse_id;
                warehouse = await Warehouse.findOne({ where: { id: warehouseId } });
                if (!warehouse) {
                    return res.status(404).json("WARNING: Warehouse id not found");
                }
            }

            let category = "";
            if (warehouse.type === "витрина") {
                category = "продажa с витрины";
            } else if (warehouse.type === "склад") {
                category = "продажa со склада";
            } else {
                return res.status(403).json("Warehouse type invalid, update <витрина> or <склад>");
            }

            let mappedOrder = data.products.map((order) => {
                return {
                    order_id: order.order_id,
                    cathegory: category,
                    tissue: order.tissue ? order.tissue : "---",
                    title: order.title || "-",
                    cost: order.price || 0,
                    sale: order.sale || 0,
                    qty: order.qty || 1,
                    sum: order.sum || 0,
                    model_id: order.model_id,
                    copied: true,
                    status: order.status ? order.status : "ACTIVE",
                };
            });

            const products = await Orders.bulkCreate(mappedOrder, { transaction });
            let ids = products.map((prod) => prod.id);

            let warehouseProducts = ids.map((orderId) => {
                return {
                    warehouse_id: warehouseId,
                    order_id: orderId,
                };
            });

            await WareHouseProduct.bulkCreate(warehouseProducts, { transaction });

            await transaction.commit();

            res.json("Products bulk created successfully");
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            console.log(error);
            res.status(500).json(`"Transaction aborted. An error occurred."\n` + error.message);
        }
    },
    RETURNED_ORDER: async (req, res) => {
        try {
            const { user_id } = req;
            const user = await Seller.findOne({ where: { id: user_id } });
            if (user.role !== "MAIN_STOREKEEPER" && user.role !== "STOREKEEPER") {
                return res.status(401).json("you not allowed this proccess");
            }

            let warehouse = req.body.warehouse_id;
            const id = req.params.id;

            if (user.role === "MAIN_STOREKEEPER") {
                if (!warehouse) {
                    return res.status(404).json("warehouse_id not found");
                }
            }
            if (user.role === "STOREKEEPER") {
                let store = await Warehouse.findOne({ where: { admin: user.id } });
                if (!store) {
                    return res.status(404).json("Store not found");
                }

                warehouse = store.id;
            }

            const warehouseProd = await WareHouseProduct.findOne({
                where: {
                    order_id: id,
                },
                include: {
                    model: Orders,
                    as: "order",
                    where: { status: "DELIVERED" },
                },
            });

            if (!warehouseProd) {
                return res.status(404).json(`Warehouse product not found`);
            }

            warehouseProd.is_active = false;
            await warehouseProd.save();

            const order = await Orders.update(
                { status: "RETURNED" },
                { where: { id: warehouseProd.dataValues.order_id }, returning: true, plain: true }
            );
            await logOrderChanged(order[1].id, order[1].dataValues);

            const warehouseProduct = await WareHouseProduct.create({
                warehouse_id: warehouse,
                order_id: warehouseProd.dataValues.order_id,
            });

            res.json(warehouseProduct);
        } catch (error) {
            console.log(error);
            res.status(500).json(error.message);
        }
    },
    CREATE_ONLY_ADMIN: async (req, res) => {
        const { user_id } = req;
        let transaction;
        try {
            transaction = await sequelize.transaction();

            const user = await Seller.findOne({ where: { id: user_id } });
            if (user.role !== "SUPER_ADMIN" && user.role !== "MAIN_STOREKEEPER") {
                return res.status(500).json("You are not allowed to create this product");
            }

            const { order_id, cathegory, tissue, title, cost, sale, qty, sum, model_id, warehouse_id, status } = req.body;

            const warehouse = await Warehouse.findOne({ where: { id: warehouse_id } });
            if (!warehouse) {
                return res.status(404).json("Enter warehouse id");
            }

            if (!status) {
                return res.status(404).json("Enter product status");
            }

            let category = "";
            if (warehouse.type === "витрина") {
                category = "продажa с витрины";
            } else if (warehouse.type === "склад") {
                category = "продажa со склада";
            } else {
                return res.status(403).json("Warehouse type invalid, update <витрина> or <склад>");
            }

            const order = await Orders.create(
                {
                    order_id,
                    cathegory: category,
                    tissue: tissue ? tissue : "---",
                    title,
                    cost,
                    sale,
                    qty,
                    sum,
                    model_id,
                    copied: true,
                    status,
                },
                { transaction }
            );

            const product = await WareHouseProduct.create(
                {
                    warehouse_id: warehouse_id,
                    order_id: order.id,
                },
                { transaction }
            );

            await transaction.commit();

            res.json(product);
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            console.log(error);
            res.status(500).json(`"Transaction aborted. An error occurred."\n` + error.message);
        }
    },
    CREATE_ONLY_PRODUCER: async (req, res) => {
        const { user_id } = req;
        let transaction;
        try {
            transaction = await sequelize.transaction();

            const user = await Seller.findOne({ where: { id: user_id } });
            if (user.role !== "PRODUCER") {
                return res.status(401).json("You are not allowed to create this product");
            }
            const warehouse = await Warehouse.findOne({ where: { company_id: user.comp_id } });
            if (!warehouse) {
                return res.status(404).json("warehouse not found");
            }
            const { order_id, tissue, title, cost, sale, qty, sum, model_id } = req.body;

            let category = "";
            if (warehouse.type == "витрина") {
                category = "продажa с витрины";
            } else if (warehouse.type === "склад") {
                category = "продажa со склада";
            } else {
                return res.status(403).json("Warehouse type invalid, update <витрина> or <склад>");
            }

            const order = await Orders.create(
                {
                    order_id,
                    cathegory: category,
                    tissue: tissue ? tissue : "---",
                    title,
                    cost,
                    sale,
                    qty,
                    sum,
                    model_id,
                    copied: true,
                    status: "CREATED",
                },
                { transaction }
            );

            const product = await WareHouseProduct.create(
                {
                    warehouse_id: warehouse.id,
                    order_id: order.id,
                },
                { transaction }
            );

            await transaction.commit();

            res.json(product);
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            console.log(error);
            res.status(500).json(`"Transaction aborted. An error occurred."\n` + error.message);
        }
    },
    CHANGE_WAREHOUSE: async (req, res) => {
        try {
            const { user_id } = req;
            const user = await Seller.findOne({ where: { id: user_id } });
            if (user.role != "STOREKEEPER" && user.role != "MAIN_STOREKEEPER" && user.role != "SUPER_ADMIN") {
                return res.status(401).json(`WARNING: You are not allowed ${user.name}`);
            }
            const orderID = req.params.id;
            const warehouseId = req.body;
            console.log(orderID, warehouseId);
            const product = await WareHouseProduct.findOne({
                where: {
                    order_id: orderID,
                    is_active: true,
                },
            });

            if (!product) {
                return res.status(404).json("Not found product");
            }

            const order = await Orders.findOne({ where: { id: product.order_id } });

            if (!order) {
                return res.status(404).json("Not found order");
            }

            const warehoues = await Warehouse.findOne({ where: { id: warehouseId.warehouse_id } });

            if (warehoues.type === "витрина") {
                const updateOrder = await Orders.update(
                    { status: "TRANSFERED", cathegory: "продажa с витрины" },
                    { where: { id: order.id }, returning: true, plain: true }
                );
                await logOrderChanged(updateOrder[1].id, updateOrder[1].dataValues);
            } else if (warehoues.type === "склад") {
                const updatedOrder = await Orders.update(
                    { status: "TRANSFERED", cathegory: "продажa со склада" },
                    { where: { id: order.id }, returning: true, plain: true }
                );
                await logOrderChanged(updatedOrder[1].id, updatedOrder[1].dataValues);
            } else {
                return res.status(403).json("Warehouse type invalid, update <витрина> or <склад>");
            }
            await WareHouseProduct.update({ is_active: false }, { where: { id: product.id } });

            const changedWarehouseProduct = await WareHouseProduct.create({
                order_id: orderID,
                warehouse_id: warehouseId.warehouse_id,
                is_active: true,
            });

            res.json(changedWarehouseProduct);
        } catch (error) {
            console.log(error);
            res.status(500).json(error.message);
        }
    },
    PUT: async (req, res) => {
        try {
            const { user_id } = req;
            const user = await Seller.findOne({ where: { id: user_id } });
            if (user.role != "MAIN_STOREKEEPER" && user.role != "SUPER_ADMIN") {
                return res.status(401).json(`WARNING: You are not allowed ${user.name}`);
            }
            const id = req.params.id;
            const data = req.body;

            const product = await WareHouseProduct.findOne({where: { id: id } });
            if (!product) {
                res.status(404).json(`Not found warehouse product for this id: ${id}`);
            }

            await product.update({
                order_id: data.order_id || product.order_id,
                warehouse_id: data.warehouse_id || product.warehouse_id,
                is_active: data.is_active || product.is_active,
            });

            await product.save();
        } catch (error) {
            console.log(error);
            res.status(500).json(error.message);
        }
    },
    DELETE: async (req, res) => {
        try {
            const id = req.params.id;
            const { user_id } = req;
            const requester = await Seller.findOne({ where: { id: user_id } });

            if (requester?.role != "MAIN_STOREKEEPER" && requester?.role != "SUPER_ADMIN") {
                return res.status(401).json("You are not allowed user!");
            }

            const product = await WareHouseProduct.findOne({where: {id: id}});
            if (!product) {
                return res.status(404).json(`Not found warehouse product for this id: ${id}`);
            }

            await product.destroy();

            res.json("WarehouseProduct deleted successfully");
        } catch (error) {
            console.log(error);
            res.status(500).json(error.message);
        }
    },



};
