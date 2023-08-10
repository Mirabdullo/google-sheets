const { DataTypes, UUIDV4 } = require("sequelize");
const sequelize = require("../utils/sequelize");

const OrderLog = sequelize.define(
    "order_log",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: UUIDV4,
            allowNull: false,
          },
        order_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        cathegory: {
            type: DataTypes.STRING(128),
        },
        tissue: {
            type: DataTypes.STRING(64),
        },
        title: {
            type: DataTypes.STRING(128),
        },
        cost: {
            type: DataTypes.INTEGER,
        },
        sale: {
            type: DataTypes.INTEGER,
        },
        qty: {
            type: DataTypes.INTEGER,
        },
        sum: {
            type: DataTypes.INTEGER,
        },
        is_first: {
            type: DataTypes.BOOLEAN,

        },
        copied: {
            type: DataTypes.BOOLEAN,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
        },
        end_date: {
            type: DataTypes.DATE,
        },
        seller_id: {
            type: DataTypes.UUID,
        },
    },
    {
        freezeTableName: true,
    }
);

module.exports = OrderLog;
