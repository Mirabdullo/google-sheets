const jwt = require("jsonwebtoken");
const PRIVATE_KEY = process.env.PRIVATE_KEY || "JUDAYAM_MAXFIY_BO`LSA_EDI";

// Function to sign JSON Web Token
function signJWT(payload) {
  const token = jwt.sign(payload, PRIVATE_KEY);
  return token;
}

// Function to verify JSON Web Token
function verifyJWT(token) {
  try {
    const decoded = jwt.verify(token, PRIVATE_KEY);
    return decoded;
  } catch (err) {
    console.log(err.message);
    return null;
  }
}

module.exports = {
  signJWT,
  verifyJWT,
};
