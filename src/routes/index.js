const express = require("express");
const furnitureTypeController = require("../controllers/furnitureType.controller");
const modelController = require("../controllers/model.controller");
const sellerController = require("../controllers/seller.controller");
const clientController = require("../controllers/client.controller");
const dealController = require("../controllers/deal.controller");
const orderController = require("../controllers/order.controller");
const paymentController = require("../controllers/payment.controller");
const universalController = require("../controllers/universal.controller");
const applyController = require("../controllers/apply.controller");
const deliveryController = require("../controllers/delivery.controller");
const universalDeliveryController = require("../controllers/universalDeliveryController");
const companyController = require("../controllers/company.controller");
const approvalController = require("../controllers/approval.controller");
const walletController = require("../controllers/wallet.controller");
const warehouseController = require("../controllers/warehouse.controller");
const warehouseProductController = require("../controllers/warehouseProduct.controller");
const Validation = require("../utils/validation");
const statisticsController = require("../controllers/statistics.controller");

const router = express.Router();

router
  //model
  .get("/models", modelController.GET)
  .get("/has-model/:name", modelController.GET_BY_NAME)
  .get("/models-with-type", modelController.GET_WITH_FURNITURE_TYPE)
  .get("/search-model", modelController.SEARCH)
  .post("/model", modelController.POST)
  .put("/model/:model_id", modelController.PUT)
  .post("/models", modelController.BULK_CREATE)
  .delete("/models/:id", modelController.DELETE)

  //furniture-type
  .get("/furniture-type", furnitureTypeController.GET)
  .post("/furniture-type", furnitureTypeController.POST)
  .put("/furniture-type/:id", furnitureTypeController.PUT)
  .post("/new-type-with-models", furnitureTypeController.CREATE_WITH_MODELS)
  .delete("/delete-category/:id", furnitureTypeController.DELETE)

  //seller
  .get("/sellers", sellerController.GET)
  .get("/seller/pagination", sellerController.GET_PAGINATION)
  .get("/get-couriers", sellerController.GET_COURIERS)
  .get("/get-storekeeper", sellerController.GET_STOREKEEPER)
  .get("/search-seller", sellerController.SEARCH)
  .get("/get-seller/:id", sellerController.GET_BYID)
  .post("/seller", sellerController.POST)
  .patch("/seller", sellerController.PATCH)
  .put("/user/:user_id", sellerController.EDIT_USER)
  .delete("/user/:id", sellerController.DELETE)

  //client
  .get("/clients", clientController.GET)
  .post("/client", clientController.POST)
  .delete("/client/:id", clientController.DELETE)

  // company
  .get("/company", companyController.GET)
  .get("/company/:id", companyController.GET_BY_ID)
  .put("/company/:company", companyController.PUT)
  .post("/company", companyController.POST)
  .delete("/company/:id", companyController.DELETE)

  //deal
  .get("/deals", dealController.GET)
  .post("/add-order", dealController.ADD_ORDER)
  .put("/deal-rest/:deal", dealController.EDIT_REST)
  .get("/deals-in-dept", dealController.GET_DEPT)
  .get("/search-deals-dept/:phone", dealController.SEARCH_DEPT)
  .post("/deal", dealController.POST)
  .post("/deal-with-order", dealController.CREATE_DEAL_WITH_ORDER)
  .delete("/deal/:id", dealController.DELETE)

  //order
  .get("/orders", orderController.GET)
  .get("/getId", orderController.GET_ID)
  .get("/seller-orders", orderController.GET_BY_SELLER)
  .get("/get-orders", orderController.GET_BY_ID)
  .get("/get-orders-by-client", orderController.GET_BY_CLIENT)
  .get("/get-orders-by-model", orderController.GET_BY_MODEL)
  .get("/get-orders-by-deal", orderController.GET_BY_DEAL)
  .get("/get-orders-by-deal_id", orderController.GET_BY_DEAL_ID)
  .get("/get-order-by-status", orderController.GET_FOR_PRODUCER)
  .get("/orderId/:orderId", orderController.GET_BY_ORDER_ID)
  .post("/order", orderController.POST)
  .put("/order/:id", orderController.CHANGE_STATUS)
  .put("/order-update/:order", orderController.PUT)
  .put("/booked-order/:id", orderController.BOOKED_ORDER)
  .put("/unbooked-order/:id", orderController.UNBOOKED_ORDER)
  .put("/disactivate-order/:order", orderController.DISACTIVATE)
  .post("/orders-with-id", orderController.BULK_CREATE_WITH_ID)
  .delete("/order/:id", orderController.DELETE)

  //payment
  .get("/payments", paymentController.GET)
  .get("/dealId/:dealId", paymentController.GET_BY_DEAL_ID)
  .post("/payment", paymentController.POST)
  .post("/extra-payment", paymentController.EXTRA_POST)
  .delete("/payment/:id", paymentController.DELETE)

  //apply
  .get("/applies", applyController.GET)
  .post("/apply", applyController.POST)
  .delete("/apply/:id", applyController.DELETE)
  
  // approval
  .get("/approval", approvalController.GET)
  .post("/approval/:apply_id", approvalController.POST)
  .put("/approval/:id", approvalController.PUT)
  .delete("/approval/:id", approvalController.DELETE)

  // wallet
  .get("/wallet", walletController.GET)
  .post("/wallet", walletController.POST)
  .delete("/wallet/:id", walletController.DELETE)

  //delivery
  .get("/deliveries", deliveryController.GET)
  .get("/delivery/pagination", deliveryController.GET_PAGINATION) // Pagination query limit and size
  .post("/delivery", deliveryController.POST)
  .put("/deliveries/:id", deliveryController.PUT)
  .delete("/deliveries/:id", deliveryController.DELETE)

  //universal
  .get("/universal", universalController.GET)
  .post("/universal", universalController.POST)
  .post("/universal-delivery", universalController.POST_DELIVERY)
  .post(
    "/universal-d2c-delivery",
    universalDeliveryController.D2C_DELIVERY_CREATE
  )

  // statistics
  .patch("/order-statistics", universalController.GET_STATISTICS)
  .patch(
    "/order-statistics-by-model",
    universalController.GET_STATISTICS_BY_MODEL
  )

  //warehouse
  .get("/warehouse", warehouseController.GET)
  .get("/warehouse-all", warehouseController.GET_ALL)
  .get("/warehouse/:id", warehouseController.GET_BY_ID)
  .put("/warehouse/:id", warehouseController.PUT)
  .post("/warehouse", Validation("warehouse"), warehouseController.CREATE)
  .delete("/warehouse/:id", warehouseController.DELETE)


  //warehouseProducts
  .get("/warehouse-products", warehouseProductController.GET)
  .get("/warehouse-products-by-status", warehouseProductController.GET_BY_STATUS)
  .get("/warehouse-products-pagination", warehouseProductController.GET_PAGINATION)
  .get("/warehouse-products-by-storekeeper", warehouseProductController.GET_FOR_STOREKEEPER)
  .get("/warehouse-products-search", warehouseProductController.SEARCH) 
  .get("/warehouse-products-search-with-seller", warehouseProductController.SEARCH_WITH_SELLER) 
  .get("/warehouse-products-search-deal", warehouseProductController.SEARCH_DEAL) 
  .get("/warehouse-products-order/:id", warehouseProductController.GET_BY_ORDER_ID)
  .get("/warehouse-products-by-deal-id/:id", warehouseProductController.GET_BY_DEAL_ID)
  .get("/get-for-mainstorekeeper-by-deal-id/:id", warehouseProductController.GET_FOR_MAIN_STOREKEEPER)
  .put("/warehouse-products/:id", warehouseProductController.PUT)
  .put("/warehouse-product-returned/:id", warehouseProductController.RETURNED_ORDER)
  .put("/change-warehouse-products/:id", warehouseProductController.CHANGE_WAREHOUSE)
  .post("/warehouse-products", warehouseProductController.CREATE)
  .post("/bulck-create-warehouse-products", warehouseProductController.BULK_CREATE_WAREHOUSE_PRODUCTS)
  .post("/warehouse-products-only-admin", warehouseProductController.CREATE_ONLY_ADMIN)
  .post("/warehouse-products-only-producer", warehouseProductController.CREATE_ONLY_PRODUCER)
  // .post("/write-to-excel", warehouseProductController.POST_TO_EXCEL)
  .delete("/warehouse-products", warehouseProductController.DELETE)


  .get("/warehouse-products-to-excel", statisticsController.WAREHOUSE_PRODUCTS_TO_EXCEL)
  .patch("/average-profit-client", statisticsController.AVERAGE_PROFIT_CLIENT)
  .patch("/average-profit-day", statisticsController.AVERAGE_PROFIT)
  .patch("/payment-statistics", statisticsController.PAYMENT)
  .patch("/payment-statistics-to-exel", statisticsController.TO_EXEL)

module.exports = router;

