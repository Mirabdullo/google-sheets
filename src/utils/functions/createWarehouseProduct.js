const { format } = require("date-fns");
const WareHouseProduct = require("../../model/warehouseProduct.model");
const Warehouse = require("../../model/warehouse.model");
const Model = require("../../model/model.model");
const FurnitureType = require("../../model/furnitureType.model");
const Orders = require("../../model/order.model");
const { google } = require("googleapis");
const keys = require("../../../keyss.json");

const client = new google.auth.JWT(keys.client_email, null, keys.private_key, ["https://www.googleapis.com/auth/spreadsheets"]);
const gsapi = google.sheets({ version: "v4", auth: client });

async function CREATED_PRODUCT_WRITE_EXCEL() {
    try {
        const products = await WareHouseProduct.findAll({
            where: { is_copied: false },
            include: [
                {
                    model: Warehouse,
                },
                {
                    model: Orders,
                    as: "order",
                    include: {
                        model: Model,
                        include: {
                            model: FurnitureType,
                        },
                    },
                },
            ],
        });
        let array = [];

        products.forEach((product) => {
            array.push([
                format(product.createdAt, "yyyy-MM-dd"),
                product.warehouse?.name,
                product.order?.model?.name,
                product.order?.model?.furniture_type?.name,
                product.order?.order_id,
                product.order?.cathegory,
                product.order?.tissue,
                product.order?.title,
                product.order?.cost,
                product.order?.sale,
                product.order?.qty,
                product.order?.sum,
                product.order?.status,
            ]);
        });

        console.log(array.length);

        const opt = {
            spreadsheetId: "1SkEdkdhWdryqSGuUB5QoCCy7FwYWSly_9YQgnfAgrd4",
            range: "приходь!A2:M",
            valueInputOption: "USER_ENTERED",
            insertDataOption: "INSERT_ROWS",
            resource: {
                values: array,
            },
        };

        await gsapi.spreadsheets.values.append(opt);

        let idProducts = products.map((product) => product.id);

        for (let id of idProducts) {
            await WareHouseProduct.update({ is_copied: true }, { where: { id: id } });
        }

        console.log("Warehouse product copied successfully");
    } catch (error) {
        console.log("Created productlarni excelga yozish:", error);
    }
}

//this code runnning on selling server
async function PRODUCT_WRITE_EXCEL(id) {
    try {
        const prod = await WareHouseProduct.findOne({
            where: { id: id },
            include: [
                {
                    model: Warehouse,
                },
                {
                    model: Orders,
                    as: "order",
                    include: {
                        model: Model,
                        include: {
                            model: FurnitureType,
                        },
                    },
                },
            ],
        });
        let array = [];
        array.push([
            format(new Date(), "yyyy-MM-dd"),
            prod.warehouse?.name,
            prod.order?.model?.name,
            prod.order?.model?.furniture_type?.name,
            prod.order?.order_id,
            prod.order?.cathegory,
            prod.order?.tissue,
            prod.order?.title,
            prod.order?.cost,
            prod.order?.sale,
            prod.order?.qty,
            prod.order?.sum,
            prod.order?.status,
        ]);
        const opt = {
            spreadsheetId: "1SkEdkdhWdryqSGuUB5QoCCy7FwYWSly_9YQgnfAgrd4",
            range: "расходъ!A2:M",
            valueInputOption: "USER_ENTERED",
            insertDataOption: "INSERT_ROWS",
            resource: {
                values: array,
            },
        };

        await gsapi.spreadsheets.values.append(opt);

        console.log("Warehouse product copied successfully");
    } catch (error) {
        console.log("Created productlarni excelga yozish:", error);
    }
}

module.exports = { CREATED_PRODUCT_WRITE_EXCEL, PRODUCT_WRITE_EXCEL };
