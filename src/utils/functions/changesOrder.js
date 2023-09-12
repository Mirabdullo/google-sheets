const { google } = require("googleapis");
const keys = require("../../../keyss.json");
const Orders = require("../../model/order.model");
const Deals = require("../../model/deal.model");
const Client = require("../../model/client.model");
const Model = require("../../model/model.model");
const FurnitureType = require("../../model/furnitureType.model");
const Seller = require("../../model/seller.model");
const Companies = require("../../model/company.model");
const { format } = require("date-fns");
const { Op } = require("sequelize");

const client = new google.auth.JWT(keys.client_email, null, keys.private_key, ["https://www.googleapis.com/auth/spreadsheets"]);
const gsapi = google.sheets({ version: "v4", auth: client });

async function CHANGES_PRODUCT_WRITE_EXCEL() {
    try {

        const prod = await Orders.findAll({
            where: { 
                edited_status: {[Op.or]: ["add", "edited", "deleted"]}
             },
            attributes: ["id", "order_id", "cathegory", "tissue", "title", "cost", "sale", "qty", "sum", "status", "edited_status"],
            include: [
                {
                    model: Deals,
                    attributes: ["id", "deal_id", "rest", "delivery_date", "company_id"],
                    include: [
                        {
                            model: Client,
                            attributes: ["name", "phone", "where_from", "status"],
                        },
                        {
                            model: Seller,
                            attributes: ["name"],
                        },
                    ],
                },
                {
                    model: Model,
                    paranoid: false,
                    attributes: ["id", "name"],
                    include: {
                        paranoid: false,
                        model: FurnitureType,
                        attributes: ["id", "name"],
                    },
                },
            ],
        });
        
        if (prod.length > 0) {
            let companies = prod.map((company) => company.deal.dataValues.company_id)
            let ar = new Set(companies)
            companies = [...ar]

            companies.forEach(async (company) => {
                const comp = await Companies.findByPk(company);
                let array = [];
                prod.forEach(async (prod) => {
                    if (prod.deal.dataValues.company_id == comp.id) {
                        let status = prod.edited_status === "add" ? "продукт добавлена" : prod.edited_status == "edited" ? "продукт изменён" : "продукт удалена"
                        array.push([
                            format(new Date(), "yyyy-MM-dd"),
                            status,
                            prod.deal.client?.name,
                            prod.deal.client?.phone,
                            prod.deal.client?.where_from,
                            prod.deal.client?.status,
                            prod.cathegory,
                            prod.deal?.seller?.name,
                            prod.order_id,
                            prod.model?.furniture_type?.name,
                            prod.model?.name,
                            prod.tissue,
                            format(prod.deal.delivery_date, "yyyy-MM-dd"),
                            prod.title,
                            prod.cost,
                            prod.sale,
                            prod.qty,
                            prod.sum,
                            prod.deal.rest,
                            prod.deal.deal_id,
                        ]);
                        prod.edited_status = "copied";
                        await prod.save();
                    }
                })
                
                const opt = {
                    spreadsheetId: comp.company_id,
                    range: "изменения!A3:M",
                    valueInputOption: "USER_ENTERED",
                    insertDataOption: "INSERT_ROWS",
                    resource: {
                        values: array,
                    },
                };
        
                await gsapi.spreadsheets.values.append(opt);
        
            })
                console.log("changed");
        }
        console.log("changed data not found");
    } catch (error) {
        console.log("excelga yozish:", error);
    }
}

module.exports = CHANGES_PRODUCT_WRITE_EXCEL;
