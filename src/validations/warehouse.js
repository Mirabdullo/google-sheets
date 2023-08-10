const Joi = require('joi');

const warehouse = Joi.object({
    name: Joi.string().required(),
    company_id: Joi.string().uuid().required(),
    admin: Joi.string().uuid().required(),
    status: Joi.string().default("NEW"),
    type: Joi.string().default("product"),
})

module.exports = warehouse