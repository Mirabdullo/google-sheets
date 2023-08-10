const { startOfDay, endOfDay, format } = require("date-fns");
const Deals = require("../model/deal.model");
const { Op } = require("sequelize");
const Models = require("../model/model.model");
const Orders = require("../model/order.model");
const moment = require("moment/moment");
const Payment = require("../model/payment.model");
const Seller = require("../model/seller.model");
const Clients = require("../model/client.model");
const FurnitureType = require("../model/furnitureType.model");
const ExcelJs = require("exceljs");
const path = require("path");
const WareHouseProduct = require("../model/warehouseProduct.model");
const Warehouse = require("../model/warehouse.model");
const fs = require("fs");

moment.locale("ru");

module.exports = {
    AVERAGE_PROFIT_CLIENT: async (req, res) => {
        try {
            const company = req.body.company_id;
            let options = {};
            if (company) {
                options.comp_id = company;
            }

            const date = new Date();
            let defaultStartDate = date;

            const startDate = req.query.startDate || new Date(defaultStartDate.setDate(defaultStartDate.getDate() - 30));
            const endDate = req.query.endDate || new Date();

            let old = new Date(startDate);
            let do_date = new Date(startDate);

            let dateArray = [];
            let dataSet = [];

            const deals = await Deals.findAll({
                where: { createdAt: { [Op.gte]: startDate, [Op.lte]: endDate } },
                include: [
                    {
                        model: Seller,
                        where: options,
                    },
                    {
                        model: Orders,
                        attributes: ["sum", "qty"],
                        include: {
                            model: Models,
                            attributes: ["price"],
                        },
                    },
                ],
            });

            let sum = 0;
            let all = 0;
            let i = 0;
            for (let currentDate = startDate; currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
                i++;
                let startDay = startOfDay(currentDate);
                let endDay = endOfDay(currentDate);
                let deal = deals.filter((deal) => deal.createdAt >= startDay && deal.createdAt <= endDay);
                if (deal.length) {
                    deal.forEach((order) => {
                        order.dataValues.orders.forEach((ord) => {
                            sum += +ord.dataValues.sum
                                ? +ord.dataValues.sum
                                : 1 -
                                  (+ord.dataValues.model?.dataValues.price
                                      ? +ord.dataValues.model?.dataValues.price
                                      : 1 * +ord.dataValues.qty
                                      ? +ord.dataValues.qty
                                      : 1);
                            all += +ord.dataValues.sum
                                ? +ord.dataValues.sum
                                : 1 -
                                  (+ord.dataValues.model?.dataValues.price
                                      ? +ord.dataValues.model?.dataValues.price
                                      : 1 * +ord.dataValues.qty
                                      ? +ord.dataValues.qty
                                      : 1);
                        });
                    });
                }
                dataSet.push(sum ? parseInt(sum / deal.length) : 0);
                dateArray.push(format(currentDate, "yyyy-MM-dd") + " " + moment(currentDate).format("ddd"));
                sum = 0;
            }

            old = new Date(old.setDate(old.getDate() - i));
            console.log(old, do_date);
            const old_deals = await Deals.findAll({
                where: { createdAt: { [Op.gte]: old, [Op.lte]: do_date } },
                include: [
                    {
                        model: Seller,
                        where: options,
                    },
                    {
                        model: Orders,
                        attributes: ["sum", "qty"],
                        include: {
                            model: Models,
                            attributes: ["price"],
                        },
                    },
                ],
            });

            let old_sum = 0;
            old_deals.forEach((order) => {
                order.dataValues.orders.forEach((ord) => {
                    old_sum += +ord.dataValues.sum
                        ? +ord.dataValues.sum
                        : 1 -
                          (+ord.dataValues.model?.dataValues.price
                              ? +ord.dataValues.model?.dataValues.price
                              : 1 * +ord.dataValues.qty
                              ? +ord.dataValues.qty
                              : 1);
                });
            });

            let arr = [
                {
                    label: "Средняя прибыль, оставшаяся от одного клиента",
                    all_profit: all,
                    average_profit: parseInt(all / i),
                    old_all_profit: old_sum,
                    old_average_profit: parseInt(old_sum / i),
                    data: dataSet,
                    backgroundColor: `#${Math.random().toString(16).substring(2, 8)}`,
                    borderColor: `#${Math.random().toString(16).substring(2, 8)}`,
                },
            ];
            res.json({ dataset: arr, labels: dateArray });
        } catch (error) {
            console.log(error);
            res.status(500).json(error.message);
        }
    },

    AVERAGE_PROFIT: async (req, res) => {
        try {
            const company = req.body.company_id;
            let options = {};
            if (company) {
                options.comp_id = company;
            }

            const date = new Date();
            let defaultStartDate = date;

            const startDate = req.query.startDate || new Date(defaultStartDate.setDate(defaultStartDate.getDate() - 30));
            const endDate = req.query.endDate || new Date();

            let old = new Date(startDate);
            let do_date = new Date(startDate);

            let dateArray = [];
            let dataDay = [];

            const deals = await Deals.findAll({
                where: { createdAt: { [Op.gte]: startDate, [Op.lte]: endDate } },
                include: [
                    {
                        model: Seller,
                        where: options,
                    },
                    {
                        model: Orders,
                        attributes: ["sum", "qty"],
                        include: {
                            model: Models,
                            attributes: ["price"],
                        },
                    },
                ],
            });

            let sum = 0;
            let all = 0;
            let i = 0;
            for (let currentDate = startDate; currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
                i++;
                let startDay = startOfDay(currentDate);
                let endDay = endOfDay(currentDate);
                let deal = deals.filter((deal) => deal.createdAt >= startDay && deal.createdAt <= endDay);
                if (deal.length) {
                    deal.forEach((order) => {
                        order.dataValues.orders.forEach((ord) => {
                            sum += +ord.dataValues.sum
                                ? +ord.dataValues.sum
                                : 1 -
                                  (+ord.dataValues.model?.dataValues.price
                                      ? +ord.dataValues.model?.dataValues.price
                                      : 1 * +ord.dataValues.qty
                                      ? +ord.dataValues.qty
                                      : 1);
                            all += +ord.dataValues.sum
                                ? +ord.dataValues.sum
                                : 1 -
                                  (+ord.dataValues.model?.dataValues.price
                                      ? +ord.dataValues.model?.dataValues.price
                                      : 1 * +ord.dataValues.qty
                                      ? +ord.dataValues.qty
                                      : 1);
                        });
                    });
                }
                dataDay.push(sum ? parseInt(sum) : 0);
                dateArray.push(format(currentDate, "yyyy-MM-dd") + " " + moment(currentDate).format("ddd"));
                sum = 0;
            }

            old = new Date(old.setDate(old.getDate() - i));
            console.log(old, do_date);
            const old_deals = await Deals.findAll({
                where: { createdAt: { [Op.gte]: old, [Op.lte]: do_date } },
                include: [
                    {
                        model: Seller,
                        where: options,
                    },
                    {
                        model: Orders,
                        attributes: ["sum", "qty"],
                        include: {
                            model: Models,
                            attributes: ["price"],
                        },
                    },
                ],
            });

            let old_sum = 0;
            old_deals.forEach((order) => {
                order.dataValues.orders.forEach((ord) => {
                    old_sum += +ord.dataValues.sum
                        ? +ord.dataValues.sum
                        : 1 -
                          (+ord.dataValues.model?.dataValues.price
                              ? +ord.dataValues.model?.dataValues.price
                              : 1 * +ord.dataValues.qty
                              ? +ord.dataValues.qty
                              : 1);
                });
            });

            let arr = [
                {
                    label: "Средняя дневная прибыль",
                    all_profit: all,
                    average_profit: parseInt(all / i),
                    old_all_profit: old_sum,
                    old_average_profit: parseInt(old_sum / i),
                    data: dataDay,
                    backgroundColor: `#${Math.random().toString(16).substring(2, 8)}`,
                    borderColor: `#${Math.random().toString(16).substring(2, 8)}`,
                },
            ];
            res.json({ datasets: arr, labels: dateArray });
        } catch (error) {
            console.log(error);
            res.status(500).json(error.message);
        }
    },

    TO_EXEL: async (req, res) => {
        try {
            const workbook = new ExcelJs.Workbook();
            const sheet = workbook.addWorksheet("Woodline");

            const date = new Date();

            let defaultStartDate = date;

            const startDate = req.query.startDate || new Date(defaultStartDate.setDate(defaultStartDate.getDate() - 30));
            const endDate = req.query.endDate || new Date();

            const deals = await Deals.findAll({
                where: { createdAt: { [Op.gte]: startDate, [Op.lte]: endDate } },
                attributes: ["createdAt", "delivery_date", "rest"],
                include: [
                    {
                        model: Clients,
                        attributes: ["name", "phone", "where_from", "status"],
                    },
                    {
                        model: Seller,
                        attributes: ["name"],
                    },
                    {
                        model: Orders,
                        attributes: ["cathegory", "order_id", "tissue", "title", "cost", "sale", "qty", "sum"],
                        include: {
                            model: Models,
                            attributes: ["name"],
                            include: {
                                model: FurnitureType,
                                attributes: ["name"],
                            },
                        },
                    },
                    {
                        model: Payment,
                        attributes: ["payment_type", "payment_sum", "payment_dollar", "dollar_to_sum", "change"],
                    },
                ],
            });

            sheet.columns = [
                { header: "дата", key: "date", width: 12 },
                { header: "имя", key: "name", width: 14 },
                { header: "номер телефона", key: "phone", width: 20 },
                { header: "откуда пришел", key: "where_from", width: 22 },
                { header: "статус", key: "status", width: 20 },
                { header: "категория", key: "cathegory", width: 19 },
                { header: "продавец", key: "seller", width: 17 },
                { header: "id", key: "order_id", width: 12 },
                { header: "вид мебели", key: "furniture_type", width: 22 },
                { header: "модель", key: "model", width: 22 },
                { header: "ткань", key: "tissue", width: 22 },
                { header: "дата отгрузки", key: "delivery_date", width: 17 },
                { header: "примечание", key: "title", width: 32 },
                { header: "цена", key: "cost", width: 17 },
                { header: "скидка %", key: "sale", width: 10 },
                { header: "кол-во", key: "qty", width: 10 },
                { header: "сумма", key: "sum", width: 17 },
                { header: "Вид оплаты", key: "payment_type", width: 17 },
                { header: "Предоплата (сум)", key: "payment_sum", width: 20 },
                { header: "Предоплата ($)", key: "payment_dollar", width: 15 },
                { header: "курс-$100", key: "dollar", width: 15 },
                { header: "Сумма по курсу", key: "dollar_to_sum", width: 17 },
                { header: "здачи", key: "change", width: 12 },
                { header: "Итого (сум)", key: "total", width: 17 },
                { header: "остаток", key: "ostatok", width: 17 },
                { header: "Номер сделки", key: "nomer", width: 17 },
            ];


            // Styling options for data cells
            const dataCellStyle = {
                font: { bold: false }, // Optionally set font properties for data cells
                alignment: { vertical: "middle", horizontal: "left" },
            };

            function getHeaderCellStyle(columnHeader) {
                const headerCellStyle = {
                    font: { bold: true, color: { argb: "#0f0f0f" } },
                    alignment: { vertical: "middle", horizontal: "center" },
                };

                if (
                    columnHeader === "дата" ||
                    columnHeader === "имя" ||
                    columnHeader === "номер телефона" ||
                    columnHeader === "откуда пришел" ||
                    columnHeader === "статус"
                ) {
                    headerCellStyle.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "#3bebd6" },
                    };
                } else if (
                    columnHeader === "категория" ||
                    columnHeader === "продавец" ||
                    columnHeader === "id" ||
                    columnHeader === "вид мебели" ||
                    columnHeader === "модель" ||
                    columnHeader === "ткань" ||
                    columnHeader === "дата отгрузки" ||
                    columnHeader === "примечание"
                ) {
                    headerCellStyle.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "#67f52f" },
                    };
                } else {
                    headerCellStyle.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "#a5d991" },
                    };
                }

                return headerCellStyle;
            }

            sheet.eachRow((row, rowNumber) => {
                row.eachCell((cell, cellNumber) => {
                    if (rowNumber === 1) {
                        row.height = 27;
                        row.eachCell((cell, cellNumber) => {
                            const columnHeader = sheet.getColumn(cellNumber).header;
                            const cellStyle = getHeaderCellStyle(columnHeader);

                            cell.style = {
                                ...cellStyle,
                                alignment: { ...cellStyle.alignment, wrapText: true }, // Enable line wrap for header cells
                            };
                        });
                    } else {
                        row.height = 20;
                        row.eachCell((cell) => {
                            cell.style = {
                                ...dataCellStyle,
                                alignment: { ...dataCellStyle.alignment, wrapText: true }, // Enable line wrap for data cells
                            };
                        });
                    }
                });
            });

            deals.forEach((deal) => {
                deal.orders.forEach((order) => {
                    if (deal.orders.indexOf(order) == 0) {
                        sheet.addRow({
                            date: deal.createdAt,
                            name: deal.client?.name,
                            phone: deal.client?.phone,
                            where_from: deal.client?.where_from,
                            status: deal.client?.status,
                            seller: deal.seller?.name,
                            cathegory: order?.cathegory,
                            order_id: order?.order_id,
                            furniture_type: order?.furniture_type?.name,
                            model: order?.model?.name,
                            tissue: order?.tissue,
                            title: order?.title,
                            cost: order?.cost,
                            sale: order?.sale,
                            qty: order?.qty,
                            sum: order?.sum,
                            delivery_date: deal.delivery_date,
                            payment_type: deal.payments[0]?.payment_type,
                            payment_sum: deal.payments[0]?.payment_sum,
                            payment_dollar: deal.payments[0]?.payment_dollar,
                            dollar: deal.payments[0]?.dollar_to_sum / deal.payments[0]?.payment_dollar,
                            dollar_to_sum: deal.payments[0]?.dollar_to_sum,
                            change: deal.payments[0]?.change,
                            total: deal.payments[0]?.payment_sum,
                            ostatok: deal.rest,
                        });
                    } else {
                        sheet.addRow({
                            cathegory: order?.cathegory,
                            order_id: order?.order_id,
                            furniture_type: order?.furniture_type?.name,
                            model: order?.model?.name,
                            tissue: order?.tissue,
                            title: order?.title,
                            cost: order?.cost,
                            sale: order?.sale,
                            qty: order?.qty,
                            sum: order?.sum,
                        });
                    }
                });
            });

            const fileName = "file.xlsx";
            const filePath = path.join(__dirname,"..", "files", fileName);

            await workbook.xlsx
                .writeFile(filePath)
                .then(() => {
                    console.log("Excel fayl saqlandi!");
                    // Endi faylni mijozga yuborish, fayl saqlanish orqali uni yuborish mumkin
                    res.download(filePath, fileName);
                })
                .catch((err) => {
                    console.error("Xatolik yuz berdi:", err);
                    res.status(500).json({ error: "Xatolik yuz berdi" });
                });
        } catch (error) {
            console.log(error);
            res.status(500).json(error.message);
        }
    },

    PAYMENT: async (req, res) => {
        try {
            const company = req.body.company_id;
            const sellers = req.body.sellers || [];
            const wallet = req.body.wallet;
            let options = {};

            if (sellers.length) {
                let seller = sellers.map((seller) => seller.value);
                options.teller_id = { [Op.in]: seller };
            } else {
                options.teller_id = { [Op.not]: null };
            }

            if (wallet) {
                options.wallet_id = wallet;
            }
            const date = new Date();
            let defaultStartDate = date;
            const startDate = req.body.startDate || new Date(defaultStartDate.setDate(defaultStartDate.getDate() - 30));
            const endDate = req.body.endDate || new Date();

            let payments = await Payment.findAll({
                attributes: ["payment_type", "payment_sum", "dollar_to_sum", "deal_id", "teller_id", "createdAt"],
                include: [
                    {
                        model: Deals,
                        attributes: ["seller_id"],
                        include: {
                            model: Seller,
                        },
                    },
                ],
                where: {
                    createdAt: { [Op.gte]: startDate, [Op.lte]: endDate },
                    ...options,
                },
            });

            if (company) {
                payments = payments.filter((payment) => payment.deal.seller.comp_id === company);
            }

            let dateArray = [];
            let datasets = [];
            let all = 0;
            if (!sellers.length) {
                let dataset = {
                    label: "Вся прибыль",
                    data: [],
                    fill: false,
                    backgroundColor: `#${Math.random().toString(16).substring(2, 8)}`,
                    borderColor: `#${Math.random().toString(16).substring(2, 8)}`,
                };

                for (let currentDate = new Date(startDate); currentDate <= new Date(endDate); currentDate.setDate(currentDate.getDate() + 1)) {
                    dateArray.push(format(currentDate, "yyyy-MM-dd") + " " + moment(currentDate).format("ddd"));
                    let startDay = startOfDay(currentDate);
                    let endDay = endOfDay(currentDate);
                    let payment = payments.filter((pay) => pay.dataValues.createdAt >= startDay && pay.dataValues.createdAt <= endDay);
                    let sum = 0;
                    payment.forEach((pay) => {
                        sum += +pay.payment_sum + +pay.dollar_to_sum;
                        all += +pay.payment_sum + +pay.dollar_to_sum;
                    });
                    dataset.data.push(sum);
                }

                datasets.push(dataset);
            } else {
                await Promise.all(
                    sellers.map((seller) => {
                        let dataset = {
                            label: seller?.label,
                            data: [],
                            fill: false,
                            backgroundColor: `#${Math.random().toString(16).substring(2, 8)}`,
                            borderColor: `#${Math.random().toString(16).substring(2, 8)}`,
                        };
                        for (
                            let currentDate = new Date(startDate);
                            currentDate <= new Date(endDate);
                            currentDate.setDate(currentDate.getDate() + 1)
                        ) {
                            dateArray.push(format(currentDate, "yyyy-MM-dd") + " " + moment(currentDate).format("ddd"));
                            let startDay = startOfDay(currentDate);
                            let endDay = endOfDay(currentDate);
                            let payment = payments.filter(
                                (pay) =>
                                    pay.dataValues.createdAt >= startDay &&
                                    pay.dataValues.createdAt <= endDay &&
                                    pay.dataValues.teller_id === seller?.value
                            );
                            let sum = 0;
                            payment.forEach((pay) => {
                                sum += +pay.payment_sum + +pay.dollar_to_sum;
                                all += +pay.payment_sum + +pay.dollar_to_sum;
                            });
                            dataset.data.push(sum);
                        }
                        datasets.push(dataset);
                    })
                );
            }
            let date1 = new Set(dateArray);
            let date2 = [...date1];

            res.json({ datasets, labels: date2 });
        } catch (error) {
            console.log(error);
            res.status(500).json(error.message);
        }
    },

    WAREHOUSE_PRODUCTS_TO_EXCEL: async (req, res) => {
        try {
            const workbook = new ExcelJs.Workbook();
            const sheet = workbook.addWorksheet("Woodline");

            const warehouse = req.query.warehouse;
            let date = new Date();
            date = format(date, "yyyy-MM-dd");

            let options = {};
            if (warehouse) {
                options.warehouse_id = warehouse;
            }

            const warehouseProducts = await WareHouseProduct.findAll({
                where: options,
                include: [
                    {
                        model: Warehouse,
                        as: "warehouse",
                        attributes: ["name"],
                    },
                    {
                        model: Orders,
                        as: "order",
                        attributes: ["order_id", "qty", "tissue", "title", "status"],
                        where: { status: { [Op.in]: ["ACTIVE", "RETURNED", "DEFECTED"] } },
                        include: {
                            model: Models,
                            attributes: ["name"],
                            include: {
                                model: FurnitureType,
                                attributes: ["name"],
                            },
                        },
                    },
                ],
            });

            sheet.columns = [
                { header: "№", key: "index", width: 5 },
                { header: "дата", key: "date", width: 12 },
                { header: "склад", key: "warehouse", width: 22 },
                { header: "вид мебели", key: "furniture_type", width: 22 },
                { header: "модель", key: "model", width: 22 },
                { header: "артикул", key: "artikul", width: 14 },
                { header: "ид", key: "order_id", width: 12 },
                { header: "ткань", key: "tissue", width: 22 },
                { header: "кол-во", key: "qty", width: 10 },
                { header: "примечание", key: "title", width: 32 },
                { header: "статус", key: "status", width: 16 },
            ];
            
            sheet.eachRow((row, rowNumber) => {
                row.eachCell((cell, cellNumber) => {
                    if (rowNumber === 1) {
                        row.height = 27;
                        cell.font = { bold: true, color: { argb: "#FFFFFF" }, size: 14 };
                        cell.fill = {
                            type: "pattern",
                            pattern: "solid",
                            bgColor: { argb: "#000000" },
                        };
                        cell.alignment = { horizontal: "center", vertical: "middle" };
                    } else {
                        row.height = 20;
                        cell.alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
                    }
                });
            });

            sheet.views = [
                {
                    state: "frozen",
                    ySplit: 1,
                },
            ];

            const dataRowsStart = 2; // Assuming your data starts from the second row
            warehouseProducts.forEach((product, index) => {
                const rowIndex = dataRowsStart + index;
                sheet.addRow({
                    index: index + 1,
                    date: date,
                    warehouse: product?.warehouse?.name,
                    furniture_type: product?.order?.model?.furniture_type?.name,
                    model: product?.order?.model?.name,
                    artikul: "----",
                    order_id: product?.order?.order_id,
                    qty: product?.order?.qty,
                    tissue: product?.order?.tissue,
                    title: product?.order?.title,
                    status: product?.order?.status === "ACTIVE" ? "АКТИВНЫЙ" : product.order.status === "RETURNED" ? "ВОЗВРАЩЕНО" : "ДЕФЕКТ",
                });


                const row = sheet.getRow(rowIndex);
                row.eachCell({ includeEmpty: true }, (cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' },
                    };
                });
            });


            sheet.getColumn("index").alignment = { vertical: "middle", horizontal: "left" };
            sheet.getColumn("date").alignment = { vertical: "middle", horizontal: "center" };
            sheet.getColumn("artikul").alignment = { vertical: "middle", horizontal: "center" };
            sheet.getColumn("title").alignment = { wrapText: true, vertical: "middle", horizontal: "left" };
            sheet.getColumn("status").alignment = { vertical: "middle", horizontal: "center" };


            const buffer = await workbook.xlsx.writeBuffer();
            res.setHeader("Content-Disposition", 'attachment; filename="products.xlsx"');
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.write(buffer);
            res.end();

        } catch (error) {
            console.log(error);
            res.status(500).json(error.message);
        }
    },
};
