const Joi = require('joi');

const warehouseProduct = Joi.object({
    order_id: Joi.string().uuid().required(),
    warehouse_id: Joi.string().uuid().required(),
    is_active: Joi.boolean().default(true),
})

module.exports = warehouseProduct