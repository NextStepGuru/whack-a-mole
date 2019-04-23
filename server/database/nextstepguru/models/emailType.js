'use strict'

const Model = require('./base.js')

class EmailType extends Model {
  static get tableName () {
    return 'emailType'
  }

  get $schema () {
    return {}
  }
}

module.exports = EmailType
