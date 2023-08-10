const { Op } = require("sequelize");
const SellerModel = require("../model/seller.model");
const { signJWT } = require("../utils/jwt");
const Companies = require("../model/company.model");
const { error } = require("../validations/deal");

module.exports = {
    GET: async (req, res) => {
        try {
            const seller = await SellerModel.findOne({
                where: { id: req.user_id },
            });
            const { role: sellerRole } = seller.dataValues;
            if (sellerRole != "SUPER_ADMIN") {
                return res.json([]);
            }
            const sellers = await SellerModel.findAll({
                order: [["createdAt", "ASC"]],
                where: {
                    role: {
                        [Op.not]: "SUPER_ADMIN",
                    },
                    id: {
                        [Op.not]: seller?.id,
                    },
                    is_active: true,
                },
            });
            res.json(sellers);
        } catch (error) {
            console.log(error);
        }
    },
    GET_BYID: async (req, res) => {
        try {
            const id = req.params.id;
            const user = await SellerModel.findOne({ where: { id: id }, attributes: ["name", "phone"] });
            if (!user) {
                return res.status(404).json(`User not found for this id: ${id}`);
            }

            res.json(user);
        } catch (error) {
            console.log(error);
            res.status(500).json(error.message);
        }
    },
    SEARCH: async (req, res) => {
        try {
            const { user_id } = req;
            const user = await SellerModel.findOne({ where: { id: user_id } });
            if (user.role != "SUPER_ADMIN") {
                return res.status(401).json(`WARNING: You are not allowed ${user.name}`);
            }
            const search = req.query.search;
            let options = {};
          if (search) {
            options.where = {
              [Op.or]: [
                { name: { [Op.iLike]: `%${search}%` } },
                { phone: { [Op.iLike]: `%${search}%` } }
              ]
            }
          }
            const users = await SellerModel.findAll({
                where: options.where,
                order: [["createdAt", "ASC"]],
            });

            res.json(users);
        } catch (error) {
            console.log(error);
            res.status(500).json("Internal Server Error");
        }
    },
    GET_PAGINATION: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const { count, rows: sellers } = await SellerModel.findAndCountAll({
                where: { is_active: true },
                order: [["createdAt", "DESC"]],
                offset,
                limit,
            });

            res.json({ sellers, totalAmount: count });
        } catch (error) {
            console.error(error);
            res.status(500).json("Internal server error!");
        }
    },
    GET_COURIERS: async (req, res) => {
        try {
            const seller = await SellerModel.findOne({ where: { id: req.user_id } });
            const { role: sellerRole } = seller.dataValues;
            if (sellerRole != "DELIVERY_TELLER" && sellerRole != "SUPER_ADMIN") {
                return res.json([]);
            }
            const couriers = await SellerModel.findAll({
                where: { role: "COURIER", is_active: true },
                order: [["createdAt", "ASC"]],
            });
            res.json(couriers);
        } catch (error) {
            console.log(error);
        }
    },
    GET_STOREKEEPER: async (req, res) => {
        try {
            const seller = await SellerModel.findAll({ where: { role: "STOREKEEPER" } });
            res.json(seller);
        } catch (error) {
            console.log(error);
            res.status(500).json(error.message);
        }
    },
    POST: async (req, res) => {
        try {
            const { name, phone, password, company_id, role } = req.body;
            console.log({
                name,
                phone,
                password,
                company_id,
                role,
            });

            const comp = await Companies.findOne({ where: { company_id: company_id } });
            if (!comp) {
                return res.status(404).json("company not found");
            }
            const [newSeller] = await SellerModel.findOrCreate({
                where: {
                    name,
                    phone,
                },
                defaults: {
                    password,
                    company_id,
                    role,
                    comp_id: comp.id,
                },
            });
            console.log(newSeller);
            res.json(newSeller);
        } catch (error) {
            console.log(error);
        }
    },
    PATCH: async (req, res) => {
        try {
            const { user_id, is_active } = req.body;

            const updatedSeller = await SellerModel.update({ is_active }, { where: { id: user_id } });
            res.json(updatedSeller);
        } catch (error) {
            console.log(error);
        }
    },
    EDIT_USER: async (req, res) => {
        try {
            const requester_id = req.user_id;
            const { user_id } = req.params;
            const { name, password, phone, company_id, role, comp_id } = req.body;

            const requester = await SellerModel.findOne({
                where: { id: requester_id },
            });
            if (requester?.role != "SUPER_ADMIN") return res.status(401).json("You are not admin");

            // let company = await Companies.findAll({paranoid: false})

            // const sellers = await SellerModel.findAll({paranoid: false})
            // Promise.all(sellers.map(seller => {
            //   let comp = company.find(comp => comp.dataValues.company_id === seller.company_id)
            //   console.log(seller?.dataValues);
            //   console.log(comp?.dataValues);
            //   seller.comp_id = comp?.dataValues?.id
            //   return seller.save()
            // }))
            //   .then(() => console.log("succesfuly")).catch(error => console.log(error))

            const user = await SellerModel.findOne({ where: { id: user_id } });
            const updatedSeller = await SellerModel.update(
                {
                    name: name ? name : user?.name,
                    phone: phone ? phone : user?.phone,
                    password: password ? password : user?.password,
                    company_id: company_id ? company_id : user?.company_id,
                    role: role ? role : user?.role,
                    comp_id: comp_id ? comp_id : user?.comp_id,
                },
                { where: { id: user_id } }
            );

            const allUsers = await SellerModel.findAll({
                order: [["createdAt", "ASC"]],
            });
            res.json(allUsers);
        } catch (error) {
            res.status(500).json("internal server error!");
            console.log(error);
        }
    },
    LOG_IN: async (req, res) => {
        try {
            const { name, password } = req.body;

            const foundSeller = await SellerModel.findOne({
                where: { name, password, is_active: true },
            });
            console.log(foundSeller.name);
            if (!foundSeller) {
                res.json("Unauthorized!");
                return;
            }
            const token = signJWT({ id: foundSeller.id });
            res.json({
                token: {
                    token,
                    company_id: foundSeller.company_id,
                    role: foundSeller.role,
                    name: foundSeller?.name,
                },
            });
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
            const condidate = await SellerModel.findOne({where: { id: req.params.id}});
            if (!condidate) {
                return res.status(404).json("No data found for this id");
            }

            await condidate.destroy();

            res.json("Data deleted successfully");
        } catch (error) {
            console.log(error);
        }
    },
};
