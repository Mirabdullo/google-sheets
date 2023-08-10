const SellerModel = require("../model/seller.model");
const PRIVATE_KEY = process.env.PRIVATE_KEY || "JUDAYAM_MAXFIY_BO`LSA_EDI";
const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  // console.log(req.headers);
  const { token } = req.headers;

  if (!token) {
    return res.status(401).send({
      message: "Uka tur yoqol, oldin tokenni ber",
    });
  }

  jwt.verify(token, PRIVATE_KEY, async (err, decode) => {
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).send({
        message: "Uka token invalid",
      });
    }

    // console.log("decoded - ", decode);
    const { id } = decode;
    if (!token) {
      return res.status(401).send({
        message: "Qanaqa token bu?",
      });
    }
    // console.log("id - ", id);

    const foundUser = await SellerModel.findOne({ where: { id } });

    if (!foundUser) {
      return res.status(401).send({
        message: "Uka tur yoqol, pishding hahahha o`leyyy",
      });
    }

    if (!foundUser?.is_active) {
      return res.status(401).send({
        message: "You are not an active user!",
      });
    }

    req.message = "Ikkinchi middlewarega salom birinchidan";
    req.user_id = id;

    next();
  });
};
