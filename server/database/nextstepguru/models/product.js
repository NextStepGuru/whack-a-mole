'use strict'

const Model = require('./base.js')
const ValidationError = require('objection').Model.ValidationError

class Product extends Model {
  get $secureFields () {
    return []
  }

  async $beforeValidate (jsonSchema, json, opt) {
    if (!this.isValidUPC()) {
      throw new ValidationError({
        upc: [{
          message: 'Invalid UPC',
          keyword: 'validUPC',
          params: null
        }]
      })
    }
    return jsonSchema
  }

  isParent () {
    return this.typeId === 16
  }

  isBundle () {
    return !(this.typeId in [16, 21])
  }

  static get virtualAttributes () {
    return ['isParent', 'isBundle']
  }

  static get tableName () {
    return 'product'
  }

  static get namedFilters () {
    return {
      isParent: (builder) => {
        builder
          .where('typeId', 16)
      },
      isChild: (builder) => {
        builder
          .where('typeId', 'in', [0, 21])
      },
      isPurchasable: (builder) => {
        builder
          .whereNot('sku', null)
          .whereNot('sku', '')
          .where(builder => {
            builder
              .whereNull('purchasingStatusId')
              .orWhere('purchasingStatusId', 2)
          })
          .whereNot('isActive', false)
      }
    }
  }

  static get relationMappings () {
    return {
      listings: {
        relation: Model.HasManyRelation,
        modelClass: require('./channelListing.js'),
        join: {
          from: 'product.id',
          to: 'channelListing.productId'
        }
      }
    }
  }

  get $schema () {
    return ProductSchema.schema
  }
}

module.exports = Product
