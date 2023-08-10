const sequelize = require("../utils/sequelize");
const { DataTypes } = require("sequelize");

const Deals = sequelize.define("deals", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  deal_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
  },
  rest: {
    type: DataTypes.NUMERIC,
    allowNull: false,
    defaultValue: 0,
  },
  copied: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  delivery_date: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal("CURRENT_DATE"),
    // allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  status: {
    type: DataTypes.STRING(64),
    allowNull: true,
    defaultValue: "NEW",
  },
  deletedAt: {
    type: DataTypes.DATE,
    defaultValue: null
  } 
}, {
  paranoid: true,
});

module.exports = Deals;
