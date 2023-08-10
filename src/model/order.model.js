const sequelize = require("../utils/sequelize");
const { DataTypes, UUIDV4 } = require("sequelize");

const Orders = sequelize.define("orders", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
    allowNull: false,
  },
  order_id: {
    type: DataTypes.STRING(1024),
    allowNull: false,
  },
  cathegory: {
    type: DataTypes.STRING(128),
    allowNull: false,
  },
  tissue: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  title: {
    type: DataTypes.TEXT,
  },
  cost: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  sale: {
    type: DataTypes.NUMERIC,
    allowNull: false,
  },
  qty: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sum: {
    type: DataTypes.NUMERIC,
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
  status: {
    type: DataTypes.STRING(1024),
    defaultValue: "NEW",
    allowNull: false,
    indexes: [
      {
        unique: false,
        fields: ['status'],
      },
    ],
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  end_date: {
    type: DataTypes.DATE,
  },
  seller_id: {
    type: DataTypes.UUID
  },
  deletedAt: {
    type: DataTypes.DATE,
    defaultValue: null
  } 
}, {
  paranoid: true,
});

module.exports = Orders;
