'use strict'

const Model = require('./base.js')

class Site extends Model {
  static get tableName () {
    return 'site'
  }

  get $schema () {
    return {}
  }
}

module.exports = Site
