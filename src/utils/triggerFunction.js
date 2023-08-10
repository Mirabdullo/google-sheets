const Orders = require("../model/order.model");
const OrderLog = require("../model/orderLog.model");

async function logOrderChanged(orderId, orderObject) {
    try {
        const order = await Orders.findByPk(orderId);

        if (!order) {
            throw new Error("Order not found for this id: " + orderId);
        }

        await OrderLog.create({
            order_id: orderObject?.id,
            status: orderObject?.status,
            cathegory: orderObject?.cathegory,
            tissue: orderObject?.tissue,
            title: orderObject?.title,
            cost: orderObject?.cost,
            sale: orderObject?.sale,
            qty: orderObject?.qty,
            sum: orderObject?.sum,
            is_first: orderObject?.is_first,
            copied: orderObject?.copied,
            is_active: orderObject?.is_active,
            end_date: orderObject?.end_date,
            seller_id: orderObject?.seller_id,
        });
        console.log("Order log created!");
    } catch (error) {
        console.error("Error logging order status change:", error);
    }
}

module.exports = logOrderChanged;
