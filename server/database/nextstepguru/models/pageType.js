'use strict'

const Model = require('./base.js')

class PageType extends Model {
  static get tableName () {
    return 'pageType'
  }

  static get namedFilters () {
    return {
      is: (builder) => {
        builder
          .where('id', 0)
      }
    }
  }

  static get relationMappings () {
    return {
    }
  }

  get $schema () {
    return {}
  }
}

module.exports = PageType
