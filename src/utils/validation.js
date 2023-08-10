const Validations = require("../validations/index")

module.exports = function(validation) {
    if(!Validations.hasOwnProperty(validation))
        throw new Error(`${validation} validation is not exists`)


    return async function(req, res, next) {
        try {
            const validated = await Validations[validation].validateAsync(req.body)
            req.body = validated
            next()
        } catch (error) {
            if(error.isJoi){
                return res.status(400).json(error.message)
            }

            return res.status(500).json(error.message)
            // next()
        }
    }

}