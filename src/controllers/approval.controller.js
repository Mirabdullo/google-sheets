const ApprovalModel = require("../model/approval.model");
const SellerModel = require("../model/seller.model");
const ApplyModel = require("../model/apply.model");
const PaymentModel = require("../model/payment.model");
const { Op } = require("sequelize");

module.exports = {
  GET: async (req, res) => {
    try {
      const { user_id } = req;
      const user = await SellerModel.findOne({ where: { id: user_id } });
      if (user?.role != "SUPER_ADMIN" && user?.role != "ACCOUNTANT")
        return res.status(401).json([]);
      const allApprovals = await ApprovalModel.findAll({
        include: [ApplyModel],
        where: { is_active: true },
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
      res.json({ allApprovals, kurs });
    } catch (error) {
      console.log(error);
    }
  },
  POST: async (req, res) => {
    try {
      const { user_id } = req;
      const { apply_id } = req.params;
      const {
        amount_sum,
        amount_dollar,
        wallet_id,
        company_id,
        kurs,
        transaction_fee,
      } = req.body;

      const user = await SellerModel.findOne({ where: { id: user_id } });
      if (user?.role != "SUPER_ADMIN" && user?.role != "ACCOUNTANT")
        return res.status(401).json([]);

      const newApproval = await ApprovalModel.create({
        amount_sum,
        amount_dollar,
        kurs,
        transaction_fee,
        wallet_id,
        company_id,
        apply_id,
      });
      res.json(newApproval);
    } catch (error) {
      res.status(500).json("internal server error!");
      console.log(error);
    }
  },
  PUT: async (req, res) => {
    try {
      const id = req.params.id
      const data = req.body

      const approval = await ApprovalModel.findOne({where: {id: id}})
      if(!approval) {
        return res.status(404).json("Approval not found")
      }

      await approval.update({
        amount_sum: data.amount_sum || approval.amount_sum,
        amount_dollar: data.amount_dollar || approval.amount_dollar,
        kurs: data.kurs || approval.kurs,
        is_active: data.is_active || approval.is_active,
        transaction_fee: data.transaction_fee || approval.transaction_fee,
        copied: data.copied || approval.copied,
        status: data.status || approval.status,
        apply_id: data.apply_id || approval.apply_id,
        wallet_id: data.wallet_id || approval.wallet_id,
        company_id: data.company_id || approval.company_id
      })

      await approval.save()

      res.json(approval)
    } catch (error) {
      console.log(error);
      res.status(500).json("internal server error!");
    }
  },
  DELETE: async (req, res) => {
    try {
      const { user_id } = req;
      const requester = await SellerModel.findOne({ where: { id: user_id } });

      if (requester?.role != "ACCOUNTANT" && requester?.role != "SUPER_ADMIN") {
        return res.status(401).json("You are not allowed user!");
      }
      const condidate = await ApprovalModel.findOne({where: {id: req.params.id}})
      if(!condidate) {
        return res.status(404).json('No data found for this id')
      }

      await condidate.destroy()
      
      res.json('Data deleted successfully')
    } catch (error) {
      console.log(error);
    }
  }
};
