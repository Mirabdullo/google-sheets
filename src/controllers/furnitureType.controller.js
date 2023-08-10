const ModelModel = require("../model/model.model");
const FurnitureTypeModel = require("../model/furnitureType.model");
const SellerModel = require("../model/seller.model");

module.exports = {
  GET: async (_, res) => {
    try {
      const furnitureTypes = await FurnitureTypeModel.findAll({
        include: [
          {
            model: ModelModel,
            attributes: ["id", "name"],
          },
        ],
        attributes: ["id", "name"],
        order: [["createdAt", "ASC"]],
      });
      res.json(furnitureTypes);
    } catch (error) {
      console.log(error);
    }
  },
  POST: async (req, res) => {
    try {
      const { name } = req.body;
      const newType = await FurnitureTypeModel.findOrCreate({
        where: { name },
      });
      res.json(newType);
    } catch (error) {
      console.log(error);
    }
  },
  PUT: async (req, res) => {
    try {
      const id = req.params.id;

      const category = await FurnitureTypeModel.findOne({where: {id: id}})
      if(!category){
        return res.status(404).json(`Couldn't find category for this id: ${id}`);
      }

      category.name = req.body.name;
      await category.save();
      res.json(category);
    } catch (error) {
      console.log(error);
      res.status(500).json(error.message)
    }
  },
  CREATE_WITH_MODELS: async (req, res) => {
    try {
      const { type_name, model_names } = req.body?.data;
      console.log(type_name, model_names);
      const [newType] = await FurnitureTypeModel.findOrCreate({
        where: { name: type_name },
      });
      const filteredModelNames = model_names.filter((e) => e.name != "");
      if (!filteredModelNames.length) {
        res.json("furniture type created!");
        return;
      }
      const mappedModels = filteredModelNames.map((e) => {
        return {
          name: e.name,
          type_id: newType.dataValues.id,
        };
      });
      model_names.forEach((element) => {
        element.type_id = newType.id;
      });
      const newModels = await ModelModel.bulkCreate(mappedModels);
      res.json(newModels);
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
      const condidate = await FurnitureTypeModel.findOne({where: {id: req.params.id}})
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
