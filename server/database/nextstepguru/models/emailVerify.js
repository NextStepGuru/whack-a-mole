'use strict'

const Model = require('./base.js')

class EmailVerify extends Model {
  static get tableName () {
    return 'emailVerify'
  }

  get $jsonFields () {
    return ['json']
  }

  get $schema () {
    return {}
  }
}

module.exports = EmailVerify
