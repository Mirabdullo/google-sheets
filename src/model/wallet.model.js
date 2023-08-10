const sequelize = require("../utils/sequelize");
const { DataTypes } = require("sequelize");

const Wallets = sequelize.define("wallets", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(1024),
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING(512),
    allowNull: false,
  },
  amount_sum: {
    type: DataTypes.NUMERIC,
    allowNull: false,
    defaultValue: 0,
  },
  amount_dollar: {
    type: DataTypes.NUMERIC,
    allowNull: false,
    defaultValue: 0,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(64),
    allowNull: false,
    defaultValue: "NEW",
  },
  deletedAt: {
    type: DataTypes.DATE,
    defaultValue: null
  } 
}, {
  paranoid: true,
});

module.exports = Wallets;
