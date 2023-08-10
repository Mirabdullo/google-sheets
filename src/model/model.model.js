const sequelize = require("../utils/sequelize");
const { DataTypes } = require("sequelize");

const Model = sequelize.define("model", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(128),
    allowNull: false,
  },
  price: {
    type: DataTypes.NUMERIC,
    defaultValue: 0,
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  company_id: {
    type: DataTypes.UUID,
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

module.exports = Model;
