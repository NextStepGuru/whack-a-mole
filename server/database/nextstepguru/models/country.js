'use strict'

const Model = require('./base.js')

class Country extends Model {
  static get tableName () {
    return 'country'
  }

  get $schema () {
    return {}
  }
}

module.exports = Country
