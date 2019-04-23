const Joi = require('joi')

const SkubanaProductSchema = {
  editable: {
    whiteList: ['masterSKU', 'virtualSKU', 'name', 'upc', 'description', 'brand', 'map', 'pounds', 'ounces', 'height', 'width', 'length', 'active', 'vendorCost', 'mpn', 'onHandStock', 'vendorName', 'vendorSKU'],
    blackList: [],
    requiredList: []
  },
  schema: Joi.object().keys({
    // Product Sheet
    masterSKU: Joi.string().min(0).max(255).example('Example-SKU-123'),
    virtualSKU: Joi.string().min(0).max(255).example('Parent-SKU-Of-Variation'),
    name: Joi.string().min(0).max(255).example('Super Widget'),
    upc: Joi.string().min(10).max(16).example('1234567898'),
    attributeGroup: Joi.string().example('Color {Blue} Size {XL}'),
    description: Joi.string().example('Great Product!'),
    imageURLs: Joi.string().notes('; delimited').example('http://yoursite.com/img1.png ; http://yoursite.com/img2.png'),
    brand: Joi.string().min(0).max(255).example('Awesome Brand'),
    categories: Joi.string().notes('| delimited').example('As|many|as|you|want'),
    labels: Joi.string().notes('| delimited').example('As|many|as|you|want'),
    map: Joi.number().precision(2).unit('USD').example('4.95'),
    shippingCost: Joi.number().precision(2).unit('USD').example('1.05'),
    pounds: Joi.number().unit('pounds').example('3'),
    ounces: Joi.number().unit('ounces').example('2'),
    height: Joi.number().unit('inches').example('10.5'),
    width: Joi.number().unit('inches').example('4'),
    length: Joi.number().unit('inches').example('7'),
    allowBackorders: Joi.boolean().example('TRUE'),
    hazmat: Joi.boolean().example('TRUE'),
    shipsInOwnBox: Joi.boolean().example('TRUE'),
    active: Joi.boolean().example('TRUE'),
    vendorCost: Joi.number().precision(2).unit('USD').example('1.05'),
    withBarcode: Joi.boolean().example('TRUE'),
    buyerEmail: Joi.string().min(0).max(255).example('buyer@yourdomain.com'),
    mpn: Joi.string().min(0).max(255).example('TTW2-778'),
    // Inventory Sheet
    location: Joi.string().example('Aisle-Section-Level-Position'),
    drawRank: Joi.number().example('1'),
    isPickable: Joi.boolean().example('true'),
    isReceivable: Joi.boolean().example('true'),
    onHandStock: Joi.number().example('100'),
    lockedInventory: Joi.number().example('20'),
    locationMinLevel: Joi.number().example('50'),
    // Vendor Sheet
    vendorName: Joi.string().min(2).max(255).example('Vendor-1'),
    vendorSKU: Joi.string().min(2).max(255).example('5552413812'),
    minOrderQty: Joi.number().example('1'),
    leadTime: Joi.number().unit('days').example('2'),
    pricingTiers: Joi.string().example('(1-25|50.00)(26-99|100.00)'),
    unitsOfMeasure: Joi.string().example('Crate{6}Pallet{3}'),
    isDefault: Joi.boolean().example('true'),
    autoPORounding: Joi.string().example('EXACT').example('ROUND UP').example('ROUND PROPERLY'),
    packaging: Joi.string().example('My Packaging')
  })
}

module.exports = SkubanaProductSchema
