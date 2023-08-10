const { DataTypes } = require("sequelize");
const sequelize = require("../utils/sequelize");
const Orders = require("./order.model");

const WareHouseProduct = sequelize.define("storeproducts", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
    },
    order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        field: "order_id"
    },
    warehouse_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    deletedAt: {
        type: DataTypes.DATE,
        defaultValue: null
    } 
  }, {
    paranoid: true, 
    freezeTableName: true
});

WareHouseProduct.belongsTo(Orders, {foreignKey: "order_id", as: "order"})

module.exports = WareHouseProduct