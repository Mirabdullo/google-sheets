const sequelize = require("../utils/sequelize");
const { DataTypes } = require("sequelize");

const Companies = sequelize.define("companies", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(512),
    allowNull: false,
  },
  company_id: {
    type: DataTypes.STRING(2048),
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(1024),
    allowNull: false,
    defaultValue: "new"
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

module.exports = Companies;
