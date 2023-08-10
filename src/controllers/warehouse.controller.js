const Seller = require("../model/seller.model");
const Warehouse = require("../model/warehouse.model");

module.exports = {
    GET: async (req, res) => {
        const {user_id} = req
        const user = await Seller.findOne({ where: { id: user_id } })
        let options = {}
        const rolesArray = ["STOREKEEPER", "MAIN_STOREKEEPER", "SELLER", "SUPER_ADMIN"]
        if(!rolesArray.includes(user.role) ){
            return res.status(401).json(`WARNING: You are not allowed ${user.name}`);
          }
        if(user.role === 'STOREKEEPER'){
            options.admin = user.id
        }
        try {
            const warehouse = await Warehouse.findAll({
                where: options,
                include: {all: true},
            })
            res.json(warehouse);
        } catch (error) {
            console.log(error);
            res.status(500).json(error.message)
        }
    },
    GET_ALL: async (req, res) => {
        try {
            const warehouse = await Warehouse.findAll()
            res.json(warehouse);
        } catch (error) {
            console.log(error);
            res.status(500).json(error.message)
        }
    },
    GET_BY_ID: async (req, res) => {
        try {
            const id = req.params.id;
            const warehouse = await Warehouse.findOne({
                where: {id: id},
                include: {all: true}
            });
            if(!warehouse){
                res.status(404).json(`Not found warehouse for this id: ${id}`)
            }
            res.json(warehouse);
        } catch (error) {
            console.log(error);
            res.status(500).json(error.message)
        }
    },
    CREATE: async (req, res) => {
        try {
            const { user_id } = req
            const user = await Seller.findOne({ where: { id: user_id } });
            if(user.role != "MAIN_STOREKEEPER" &&user.role != "SUPER_ADMIN"){
                return res.status(401).json(`WARNING: You are not allowed ${user.name}`);
              }
            const data = req.body

            const warehouse = await Warehouse.create(data);
            
            res.json(warehouse);
        } catch (error) {
            console.log(error);
            res.status(500).json(error.message)
        }
    },
    PUT: async (req, res) => {
        try {
            const { user_id } = req
            const user = await Seller.findOne({ where: { id: user_id } });
            if(user.role != "MAIN_STOREKEEPER" && user.role != "SUPER_ADMIN"){
                return res.status(401).json(`WARNING: You are not allowed ${user.name}`);
              }
            const id = req.params.id
            const data = req.body

            const warehouse = await Warehouse.findOne({where: { id: id } });

            if(!warehouse){
                res.status(404).json(`Not found warehouse for this id: ${id}`)
            }

            await warehouse.update({
                name: data.name || warehouse.name,
                company_id: data.company_id || warehouse.company_id,
                admin: data.admin || warehouse.admin,
                status: data.status || warehouse.status,
                type: data.type || warehouse.type
            })

            await warehouse.save()

            res.json(warehouse)
        } catch (error) {
            console.log(error);
            res.status(500).json(error.message)
        }
    },
    DELETE: async (req, res) => {
        try {
            const id = req.params.id
            const { user_id } = req;
            const requester = await Seller.findOne({ where: { id: user_id } });
      
            if (requester?.role != "SUPER_ADMIN" && requester.role != "MAIN_STOREKEEPER") {
              return res.status(401).json("You are not allowed user!");
            }
            
            const warehouse = await Warehouse.findOne({where: {id: id}})

            if(!warehouse){
                res.status(404).json(`Not found warehouse for this id: ${id}`)
            }

            await warehouse.destroy()

            res.json("Warehouse deleted successfully")
        } catch (error) {
            console.log(error);
            res.status(500).json(error.message)
        }
    }

}