const ModelModel = require("../model/model.model");
const FurnitureTypeModel = require("../model/furnitureType.model");
const sequelize = require("../utils/sequelize");
const SellerModel = require("../model/seller.model");
const { Op } = require("sequelize")

module.exports = {
  GET: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1; // Current page number
      const limit = parseInt(req.query.limit) || 10; // Number of applies per page
      const offset = (page - 1) * limit; // Offset for pagination

      const totalAmount = await ModelModel.count();
      // some change here

      const models = await ModelModel.findAll({
        where: { is_active: true },
        include: {
          model: FurnitureTypeModel,
          attributes: ["id", "name"],
        },
        offset,
        limit,
        order: [["createdAt", "DESC"]],
      });
      res.json({ models, totalAmount });

      // const models = await ModelModel.findAll()
      // Promise.all(models.map(model => {
      //   model.company_id = '043392b3-d6aa-4e3b-9cfd-c4d5069187be'
      //   return model.save()
      // }))

      // res.json("success")
    } catch (error) {
      console.log(error);
    }
  },
  PUT: async (req, res) => {
    try {
      const { user_id } = req;
      const { model_id } = req.params;
      const { name, is_active, price, company_id, status, type_id } = req.body;

      const user = await SellerModel.findOne({ where: { id: user_id } });

      if (user?.role != "SUPER_ADMIN") {
        return res.status(401).json("You are not admin");
      }
      const oldModel = await ModelModel.findOne({ where: { id: model_id } });
      const updated_model = await ModelModel.update(
        {
          name: name ? name : oldModel?.name,
          price: price ? price : oldModel?.price,
          company_id: company_id ? company_id : oldModel?.company_id,
          status: status ? status : oldModel?.status, 
          type_id: type_id ? type_id : oldModel?.type_id,
          code: code ? code : oldModel?.code,
          is_active: is_active ? is_active : oldModel?.is_active,
        },
        {
          where: { id: model_id },
        }
      );
      res.json("model updated!");
    } catch (error) {
      console.log(error);
    }
  },
  GET_WITH_FURNITURE_TYPE: async (_, res) => {
    try {
      const [models] = await sequelize.query(
        `SELECT models.id, models.name, furniture_types.name AS type, furniture_types.id AS type_id FROM models LEFT JOIN furniture_types ON models.type_id = furniture_types.id`
      );
      res.json(models);
    } catch (error) {
      console.log(error);
    }
  },
  GET_BY_NAME: async (req, res) => {
    const { name } = req.params;
    try {
      const models = await ModelModel.findOne({ where: { name } });
      res.json(models);
    } catch (error) {
      console.log(error);
    }
  },
  SEARCH: async (req, res) => {
    try {
      const name = req.query.name
      let options = {}

      if(name){
        options.name = { [Op.iLike]: `%${name}%` }
      }
      const models = await ModelModel.findAll({ where: options, order: [['createdAt', 'ASC']]})
      res.json(models)
    } catch (error) {
      console.log(error);
      res.status(500).json("Internal Server Error")
    }
  },
  POST: async (req, res) => {
    try {
      const { name, type_id, code } = req.body;
      const newModel = await ModelModel.create({ name, type_id, code });
      res.json(newModel);
    } catch (error) {
      console.log(error);
    }
  },
  BULK_CREATE: async (req, res) => {
    try {
      const { data: models } = req.body;
      console.log(req.body.data);
      const m = models.map((e) => {
        return {
          name: e.name,
          type_id: e.type_id,
          code: e.code,
        };
      });
      const newModel = await ModelModel.bulkCreate(m);
      res.json(newModel);
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
      const condidate = await ModelModel.findOne({where: {id: req.params.id}})
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
