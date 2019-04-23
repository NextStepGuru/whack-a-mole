'use strict'

const Model = require('./base.js')

class Config extends Model {
  static get tableName () {
    return 'config'
  }

  get $jsonFields () {
    return ['config']
  }
}

module.exports = Config
