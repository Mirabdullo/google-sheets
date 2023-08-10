const CompanyModel = require("../model/company.model");
const SellerModel = require("../model/seller.model");

module.exports = {
  GET: async (req, res) => {
    try {
      const { user_id } = req;
      const user = await SellerModel.findOne({ where: { id: user_id } });
      if (user?.role != "SUPER_ADMIN") return res.status(401).json([]);
      const allCompanies = await CompanyModel.findAll({
        where: { is_active: true },
        order: [['createdAt', 'DESC']] 
      });
      res.json(allCompanies);
    } catch (error) {
      console.log(error);
    }
  },
  GET_BY_ID: async (req, res) => {
    try {
      const id = req.params.id;

      const  company = await CompanyModel.findOne({where: {id: id}})
      if(!company){
        return res.status(404).json("Company not found")
      }

      res.json(company)
    } catch (error) {
      console.log(error);
      res.status(500).json(error.message)
    }
  },
  POST: async (req, res) => {
    try {
      const { user_id } = req;
      const { name, company_id, status } = req.body;
      if (!name || !company_id)
        return res.status(400).json("give me " + !name ? "name" : "company_id");
      const user = await SellerModel.findOne({ where: { id: user_id } });
      if (user?.role != "SUPER_ADMIN")
        return res.status(401).json("You are not admin!");

      const newCompany = await CompanyModel.findOrCreate({
        where: { name, company_id },
        defaults: { status },
      });

      res.json(newCompany);
    } catch (error) {
      res.status(500).json("internal server error!");
      console.log(error);
    }
  },
  PUT: async (req, res) => {
    try {
      const { user_id } = req;
      const { company } = req.params;
      const { name, company_id, status } = req.body;
      const user = await SellerModel.findOne({ where: { id: user_id } });
      if (user?.role != "SUPER_ADMIN")
        return res.status(401).json("You are not admin!");

      const existingCompany = await CompanyModel.findOne({
        where: { id: company },
      });
      if (!existingCompany) return res.status(400).json("company not found");

      const updatedCompany = await CompanyModel.update(
        {
          name: name ? name : existingCompany?.name,
          company_id: company_id ? company_id : existingCompany?.company_id,
          status: status ? status : existingCompany?.status,
        },
        { where: { id: company } }
      );

      res.json(updatedCompany);
    } catch (error) {
      res.status(500).json("internal server error!");
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
      const condidate = await CompanyModel.findOne({where: {id: req.params.id}})
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
