const sequelize = require("../utils/sequelize");
const { DataTypes } = require("sequelize");

const Approvals = sequelize.define("approvals", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
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
  kurs: {
    type: DataTypes.NUMERIC,
    allowNull: false,
    defaultValue: 0,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  transaction_fee: {
    type: DataTypes.NUMERIC,
    allowNull: false,
    defaultValue: 0,
  },
  copied: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
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

module.exports = Approvals;
