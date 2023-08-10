const sequelize = require("../utils/sequelize");
const { DataTypes, UUIDV4 } = require("sequelize");
const Companies = require("./company.model");
const Seller = require("./seller.model");

const Warehouse = sequelize.define('warehouse', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
    },
    company_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    admin: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "NEW",
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "product"
    },
    deletedAt: {
      type: DataTypes.DATE,
      defaultValue: null
    } 
  }, {
    paranoid: true,
    freezeTableName: true,
})
Warehouse.belongsTo(Companies, { foreignKey: "company_id" })
Warehouse.belongsTo(Seller, { foreignKey: "admin" })

module.exports = Warehouse