const Joi = require('joi')

const deal = Joi.object({
    rest: Joi.number().default(0),
    copied: Joi.boolean().default(false),
    delivery_date: Joi.date().default(new Date()),
    is_active: Joi.boolean().default(false),
    status: Joi.string().default("NEW"),
    seller_id: Joi.string().uuid().required(),
    client_id: Joi.string().uuid().required(),
})

module.exports = deal