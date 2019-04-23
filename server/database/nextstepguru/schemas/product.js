const Joi = require('joi')

const ProductSchema = {
  editable: {
    whiteList: ['name', 'sku', 'upc', 'mpn', 'packageHeightInch', 'packageWidthInch', 'packageLengthInch', 'packageWeightOunce', 'priceCost', 'priceMAP', 'priceSale', 'vendorSKU'],
    blackList: [],
    requiredList: ['upc', 'name', 'sku', 'priceCost', 'vendorSKU']
  },
  schema: Joi.object().keys({
    id: Joi.number().min(0),
    accountId: Joi.number().min(0),
    parentProductId: Joi.number().min(0).allow(null),
    alternativeId: Joi.string(),
    isActive: Joi.number().valid([0, 1]),
    statusId: Joi.number().min(0),
    typeId: Joi.number().min(0),
    seasonId: Joi.number().min(0),
    brandId: Joi.number().min(0),
    sku: Joi.string().max(64),
    name: Joi.string().max(255),
    upc: Joi.string().max(100),
    mpn: Joi.string().max(16),
    asin: Joi.string().max(20),
    packageHeightInch: Joi.number().precision(1).unit('inches'),
    packageWidthInch: Joi.number().precision(1).unit('inches'),
    packageLengthInch: Joi.number().precision(1).unit('inches'),
    packageWeightOunce: Joi.number().precision(1).unit('ounces'),
    priceCost: Joi.number().precision(2),
    priceMAP: Joi.number().precision(2),
    priceSale: Joi.number().precision(2),
    pricingStrategyId: Joi.number(),
    purchasingStatusId: Joi.number(),
    avgShippingCost: Joi.number().precision(2),
    lastSyncedAt: Joi.date().allow(null),
    isAllBroadcast: Joi.number().valid([0, 1]),
    modifiedAt: Joi.date(),
    createdAt: Joi.date(),
    vendorSKU: Joi.string().min(0).max(255)
  })
}

module.exports = ProductSchema
