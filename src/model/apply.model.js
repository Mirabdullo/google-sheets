const sequelize = require("../utils/sequelize");
const { DataTypes } = require("sequelize");

const Apply = sequelize.define("apply", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  apply_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    autoIncrementIdentity: 495,
    allowNull: false,
  },
  cathegory: {
    type: DataTypes.STRING(1024),
    allowNull: false,
  },
  receiver_department: {
    type: DataTypes.STRING(1024),
    allowNull: false,
  },
  receiver_finish: {
    type: DataTypes.STRING(1024),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(2048),
    allowNull: false,
    defaultValue: "",
  },
  amount_in_sum: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  amount_in_dollar: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
  },
  rest: {
    type: DataTypes.NUMERIC,
    defaultValue: 0,
    allowNull: false,
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
    defaultValue: "NEW"
  },
  deletedAt: {
    type: DataTypes.DATE,
    defaultValue: null
  } 
}, {
  paranoid: true,
});

module.exports = Apply;
