'use strict'

const Model = require('./base.js')

class PageFolder extends Model {
  static get tableName () {
    return 'pageFolder'
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

module.exports = PageFolder
