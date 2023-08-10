const ClientModel = require("./client.model");
const DealModel = require("./deal.model");
const FurnitureTypeModel = require("./furnitureType.model");
const ModelModel = require("./model.model");
const OrderModel = require("./order.model");
const PaymentModel = require("./payment.model");
const SellerModel = require("./seller.model");
const ApplyModel = require("./apply.model");
const Companies = require("./company.model");
const Wallets = require("./wallet.model");
const DeliveryModel = require("./delivery.model");
const ApprovalModel = require("../model/approval.model");
const Warehouse = require("./warehouse.model");
const WareHouseProduct = require("./warehouseProduct.model");
const OrderLog = require("./orderLog.model");

module.exports = {
  a: DealModel.hasMany(PaymentModel, {
    foreignKey: "deal_id",
    onDelete: "CASCADE",
  }),
  b: PaymentModel.belongsTo(DealModel, {
    foreignKey: "deal_id",
    onDelete: "CASCADE",
  }),
  c: SellerModel.hasMany(DealModel, {
    foreignKey: "seller_id",
    onDelete: "CASCADE",
  }),
  d: DealModel.belongsTo(SellerModel, {
    foreignKey: "seller_id",
    onDelete: "CASCADE",
  }),
  e: DealModel.hasMany(OrderModel, {
    foreignKey: "deal_id",
    onDelete: "CASCADE",
  }),
  f: OrderModel.belongsTo(DealModel, {
    foreignKey: "deal_id",
    onDelete: "CASCADE",
  }),
  g: SellerModel.hasMany(ApplyModel, {
    foreignKey: "applier_id",
    onDelete: "CASCADE",
  }),
  h: ApplyModel.belongsTo(SellerModel, {
    foreignKey: "applier_id",
    onDelete: "CASCADE",
  }),
  i: ClientModel.hasMany(DealModel, {
    foreignKey: "client_id",
    onDelete: "CASCADE",
  }),
  j: DealModel.belongsTo(ClientModel, {
    foreignKey: "client_id",
    onDelete: "CASCADE",
  }),
  k: FurnitureTypeModel.hasMany(ModelModel, {
    foreignKey: "type_id",
    onDelete: "CASCADE",
  }),
  l: ModelModel.belongsTo(FurnitureTypeModel, {
    foreignKey: "type_id",
    onDelete: "CASCADE",
  }),
  m: ModelModel.hasMany(OrderModel, {
    foreignKey: "model_id",
    onDelete: "CASCADE",
  }),
  n: OrderModel.belongsTo(ModelModel, {
    foreignKey: "model_id",
    onDelete: "CASCADE",
  }),
  o: SellerModel.hasMany(PaymentModel, {
    foreignKey: "teller_id",
    onDelete: "CASCADE",
  }),
  p: PaymentModel.belongsTo(SellerModel, {
    foreignKey: "teller_id",
    onDelete: "CASCADE",
  }),
  q: OrderModel.hasMany(DeliveryModel, {
    foreignKey: "order_id",
    onDelete: "CASCADE",
  }),
  r: DeliveryModel.belongsTo(OrderModel, {
    foreignKey: "order_id",
    onDelete: "CASCADE",
  }),
  s: SellerModel.hasMany(DeliveryModel, {
    foreignKey: "courier_id",
    onDelete: "CASCADE",
  }),
  t: DeliveryModel.belongsTo(SellerModel, {
    foreignKey: "courier_id",
    onDelete: "CASCADE",
  }),
  u: ApplyModel.hasMany(ApprovalModel, {
    foreignKey: "apply_id",
    onDelete: "CASCADE",
  }),
  v: ApprovalModel.belongsTo(ApplyModel, {
    foreignKey: "apply_id",
    onDelete: "CASCADE",
  }),
  w: Wallets.hasMany(ApprovalModel, {
    foreignKey: "wallet_id",
    onDelete: "CASCADE",
  }),
  x: ApprovalModel.belongsTo(Wallets, {
    foreignKey: "wallet_id",
    onDelete: "CASCADE",
  }),
  y: Companies.hasMany(ApprovalModel, {
    foreignKey: "company_id",
    onDelete: "CASCADE",
  }),
  z: ApprovalModel.belongsTo(Companies, {
    foreignKey: "company_id",
    onDelete: "CASCADE",
  }),
  aa: Wallets.hasMany(PaymentModel, {
    foreignKey: "wallet_id",
    onDelete: "CASCADE",
  }),
  ab: PaymentModel.belongsTo(Wallets, {
    foreignKey: "wallet_id",
    onDelete: "CASCADE",
  }),
  ac: Companies.hasMany(PaymentModel, {
    foreignKey: "company_id",
    onDelete: "CASCADE",
  }),
  ad: PaymentModel.belongsTo(Companies, {
    foreignKey: "company_id",
    onDelete: "CASCADE",
  }),
  ae: Companies.hasMany(SellerModel, {
    foreignKey: "comp_id",
    onDelete: "CASCADE",
  }),
  af: SellerModel.belongsTo(Companies, {
    foreignKey: "comp_id",
    onDelete: "CASCADE",
  }),
  ag: DeliveryModel.hasMany(PaymentModel, {
    foreignKey: "delivery_id",
    onDelete: "CASCADE",
  }),
  ah: PaymentModel.belongsTo(DeliveryModel, {
    foreignKey: "delivery_id",
    onDelete: "CASCADE",
  }),
  ai: Warehouse.hasMany(WareHouseProduct, {
    foreignKey: "warehouse_id",
    onDelete: "CASCADE",
  }),
  aj: WareHouseProduct.belongsTo(Warehouse, {
    foreignKey: "warehouse_id",
    onDelete: "CASCADE",
  }),
  ak: OrderModel.hasMany(OrderLog, {
    foreignKey: "order_id",
    onDelete: "CASCADE",
  }),
  al: OrderLog.belongsTo(OrderModel, {
    foreignKey: "order_id",
    onDelete: "CASCADE"
  })
};
