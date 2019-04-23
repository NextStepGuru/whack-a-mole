const Joi = require('joi')
// const Felicity = require('felicity')

const ProductColorSchema = {
  editable: {
    whiteList: [],
    blackList: [],
    requiredList: []
  },
  schema: Joi.object().keys({
    id: Joi.number(),
    productId: Joi.number(),
    colorJSON: Joi.object(),
    modifiedAt: Joi.date(),
    createdAt: Joi.date()
  })
  // construct () {
  //   const FELICITY_CONSTRUCTOR = Felicity.entityFor(this.schema)
  //   const CONSTRUCT = new FELICITY_CONSTRUCTOR()
  //   return CONSTRUCT
  // }
}

module.exports = ProductColorSchema
