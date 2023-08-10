const sequelize = require("../utils/sequelize");
const { DataTypes } = require("sequelize");

const Client = sequelize.define("client", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(64),
  },
  where_from: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(64),
    allowNull: false,
    defaultValue: "NEW",
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

module.exports = Client;
