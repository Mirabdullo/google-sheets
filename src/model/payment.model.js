const sequelize = require("../utils/sequelize");
const { DataTypes } = require("sequelize");

const Payment = sequelize.define("payment", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  payment_type: {
    type: DataTypes.STRING(128),
    allowNull: false,
  },
  payment_sum: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  payment_dollar: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  dollar_to_sum: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  change: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  is_first: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  copied: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
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

module.exports = Payment;
