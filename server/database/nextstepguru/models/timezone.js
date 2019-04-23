'use strict'

const Model = require('./base.js')

class Timezone extends Model {
  static get tableName () {
    return 'timezone'
  }

  get $schema () {
    return {}
  }
}

module.exports = Timezone
