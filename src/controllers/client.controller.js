const ClientModel = require("../model/client.model");

module.exports = {
  GET: async (_, res) => {
    try {
      const clients = await ClientModel.findAll({ where: { is_active: true }, order: [['createdAt', 'DESC']] });
      res.json(clients);
    } catch (error) {
      console.log(error);
    }
  },
  POST: async (req, res) => {
    try {
      const { name, phone, where_from, status } = req.body.data;
      const [newClient] = await ClientModel.create({
        name,
        phone,
        where_from,
        status,
      });
      res.json(newClient);
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
      const condidate = await ClientModel.findOne({where: {id: req.params.id}})
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
