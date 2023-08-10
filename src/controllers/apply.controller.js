const { Op } = require("sequelize");
const ApplyModel = require("../model/apply.model");
const ApprovalModel = require("../model/approval.model");
const PaymentModel = require("../model/payment.model");
const SellerModel = require("../model/seller.model");

module.exports = {
  GET: async (req, res) => {
    try {
      const { user_id } = req;
      const page = parseInt(req.query.page) || 1; // Current page number
      const limit = parseInt(req.query.limit) || 10; // Number of applies per page
      const offset = (page - 1) * limit; // Offset for pagination

      const user = await SellerModel.findOne({ where: { id: user_id } });
      if (user?.role != "SUPER_ADMIN" && user?.role != "ACCOUNTANT")
        return res.status(401).json("You are not an allowed user for this!");

      const totalAmount = await ApplyModel.count();
      const allApplies = await ApplyModel.findAll({
        include: [
          ApprovalModel,
          { model: SellerModel, attributes: ["name", "id"] },
        ],
        offset,
        limit,
        order: [["createdAt", "DESC"]],
      });

      const payments = await PaymentModel.findAll({
        where: {
          dollar_to_sum: {
            [Op.not]: 0,
          },
        },
        limit: 1,
        order: [["createdAt", "DESC"]],
      });
      const kurs = payments[0]?.dollar_to_sum / payments[0]?.payment_dollar;
      res.json({ allApplies, totalAmount, kurs });
    } catch (error) {
      res.status(500).json("Internall server error!");
      console.log(error);
    }
  },
  POST: async (req, res) => {
    try {
      const { user_id } = req;
      const user = await SellerModel.findOne({ where: { id: user_id } });
      // if (user?.role != "SUPER_ADMIN" && user?.role != "ACCOUNTANT")
      //   return res.status(401).json("You are not an allowed user for this!");

      const applier_id = req.user_id;
      const applyData = req.body;
      const {
        cathegory,
        receiver_department,
        receiver_finish,
        amount_in_sum,
        amount_in_dollar,
        title,
      } = applyData;
      const newApply = await ApplyModel.create({
        cathegory,
        receiver_department,
        receiver_finish,
        amount_in_sum,
        amount_in_dollar,
        applier_id,
        title,
      });
      res.json(newApply);
    } catch (error) {
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
      const condidate = await ApplyModel.findOne({where: {id: req.params.id}})
      if(!condidate) {
        return res.status(404).json('No data found for this id')
      }

      let approval = await ApprovalModel.findAll({ where: { apply_id: condidate.id}})

      approval = approval.map(approval => approval.id)

      await ApprovalModel.destroy({ where: { id: approval}})

      await condidate.destroy()
      
      res.json('Data deleted successfully')
    } catch (error) {
      console.log(error);
    }
  }
};
