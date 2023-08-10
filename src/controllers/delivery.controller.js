const DeliveryModel = require("../model/delivery.model");
const SellerModel = require("../model/seller.model");
const OrderModel = require("../model/order.model");
const DealModel = require("../model/deal.model");
const ClientModel = require("../model/client.model");
const PaymentModel = require("../model/payment.model");

module.exports = {
  GET: async (req, res) => {
    try {
      const deliveries = await DeliveryModel.findAll({
        include: [
          {
            model: SellerModel,
          },
          {
            model: OrderModel,
            include: [{ model: DealModel, include: [{ model: ClientModel }] }],
          },
        ],
        limit: 60,
        where: { is_active: true },
        order: [['createdAt', 'DESC']]
      });
      // const deliveries = await DeliveryModel.findAll({
      //   where: { copied: false },
      //   include: [
      //     {
      //       model: OrderModel,
      //       include: [{ model: DealModel, include: [{ model: ClientModel }] }],
      //     },
      //     { model: SellerModel, attributes: ["name"] },
      //     { model: PaymentModel },
      //   ],
      // });
      res.json(deliveries);
    } catch (error) {
      console.error(error);
      res.status(500).json("Internal server error!");
    }
  },
  GET_PAGINATION: async (req,res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const {count, rows: delivery} = await DeliveryModel.findAndCountAll({
        where: {is_active: true},
        order: [["createdAt", "DESC"]],
        offset,
        limit
      })

      res.json({delivery, totalAmount: count});
    } catch (error) {
      console.error(error);
      res.status(500).json("Internal server error!");
    }
  },
  POST: async (req, res) => {
    try {
      const delivery_datum = req.body;

      const newDelivery = await DeliveryModel.create(delivery_datum);
      res.json(newDelivery);
    } catch (error) {
      res.status(500).json("Internal server error!");
    }
  },
  BULK_POST: async (req, res) => {
    try {
      const { delivery_data } = req.body;

      const newDelivery = await DeliveryModel.bulkCreate(delivery_data);
      res.json(newDelivery);
    } catch (error) {
      res.status(500).json("Internal server error!");
    }
  },
  PUT: async (req, res) => {
    try {
      const id = req.params.id
      const data = req.body
      const { user_id } = req;
      const requester = await SellerModel.findOne({ where: { id: user_id } });

      if (requester?.role != "ACCOUNTANT" && requester?.role != "SUPER_ADMIN") {
        return res.status(401).json("You are not allowed user!");
      }

      const delivery = await DeliveryModel.findOne({where: {id:id}})
      if(!delivery) {
        return res.status(404).json("Delivery not found");
      }
      const updateDelivery = await DeliveryModel.update({
        price: data.price || delivery.price,
        title: data.title || delivery.title,
        copied: data.copied || delivery.copied,
        status: data.status || delivery.status,
        trip_id: data.trip_id || delivery.trip_id,
        delivery_date: data.delivery_date || delivery.delivery_date,
        is_active: data.is_active || delivery.is_active,
        courier_id: data.courier_id || delivery.courier_id
      },{where: {id: id }})

      res.json(updateDelivery)
    } catch (error) {
      console.log(error);
      res.json("Internal server error!")
    }
  },
  DELETE: async (req, res) => {
    try {
      const { user_id } = req;
      const requester = await SellerModel.findOne({ where: { id: user_id } });

      if (requester?.role != "ACCOUNTANT" && requester?.role != "SUPER_ADMIN") {
        return res.status(401).json("You are not allowed user!");
      }
      
      const condidate = await DeliveryModel.findOne({where: {id: req.params.id}})
      if(!condidate) {
        return res.status(404).json('No data found for this id')
      }

      let payments = await PaymentModel.findAll({where: {delivery_id: condidate.id}})
      console.log(payments);
      if(payments.length){
        const totalPayment = payments.reduce((sum, payment) => sum + (+payment.payment_sum + +payment.dollar_to_sum - +payment.change), 0)
  
        let deal = await DealModel.findOne({ where: {id: payments[0]?.deal_id}})
        if(deal) {
          deal.rest = Number(deal.rest) + totalPayment
          await deal.save()
        }
  
        payments = payments.map((payment) => payment.id)
        
        await PaymentModel.destroy({
          where: {
            id: payments,
          },
        });
      }
      await condidate.destroy()
      
      res.json('Data deleted successfully')
    } catch (error) {
      console.log(error);
    }
  }
};
