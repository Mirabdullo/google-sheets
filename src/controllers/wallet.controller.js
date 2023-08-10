const ApprovalModel = require("../model/approval.model");
const SellerModel = require("../model/seller.model");
const ApplyModel = require("../model/apply.model");
const PaymentModel = require("../model/payment.model");
const WalletModel = require("../model/wallet.model");

module.exports = {
  GET: async (req, res) => {
    try {
      const { user_id } = req;
      const user = await SellerModel.findOne({
        where: { id: user_id, is_active: true },
      });
      // if (user?.role != "SUPER_ADMIN" && user?.role != "ACCOUNTANT")
      //   return res.status(401).json([]);
      const allWallets = await WalletModel.findAll({
        order: [["createdAt", "ASC"]],
      });

      res.json(allWallets);
    } catch (error) {
      console.log(error);
    }
  },
  POST: async (req, res) => {
    try {
      const { user_id } = req;
      const { name, type, amount_sum, amount_dollar } = req.body;

      const user = await SellerModel.findOne({ where: { id: user_id } });
      if (user?.role != "SUPER_ADMIN" && user?.role != "ACCOUNTANT")
        return res.status(401).json([]);

      const newWallet = await WalletModel.findOrCreate({
        where: { name, type },
        defaults: { amount_sum, amount_dollar },
      });

      res.json(newWallet);
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
      const condidate = await WalletModel.findOne({where: {id: req.params.id}})
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
