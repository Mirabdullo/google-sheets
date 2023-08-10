const sequelize = require("../utils/sequelize");
const { DataTypes } = require("sequelize");

const Delivery = sequelize.define("delivery", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  increment_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    autoIncrementIdentity: 4000,
    allowNull: false,
  },
  price: {
    type: DataTypes.NUMERIC,
    allowNull: false,
    defaultValue: 0,
  },
  title: {
    type: DataTypes.STRING(2048),
    allowNull: false,
    defaultValue: "",
  },
  copied: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
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
  trip_id: {
    type: DataTypes.STRING(1024),
    allowNull: false,
    defaultValue: "000000",
  },
  delivery_date: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal("CURRENT_DATE"),
  },
  deletedAt: {
    type: DataTypes.DATE,
    defaultValue: null
  } 
}, {
  paranoid: true,
});

module.exports = Delivery;
