const sequelize = require("../utils/sequelize");
const { DataTypes, UUIDV4 } = require("sequelize");

const Seller = sequelize.define("seller", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  company_id: {
    type: DataTypes.STRING(256),
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING(16),
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  deletedAt: {
    type: DataTypes.DATE,
    defaultValue: null
  } 
}, {
  paranoid: true,
});

module.exports = Seller;
