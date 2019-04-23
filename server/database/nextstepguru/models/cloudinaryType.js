'use strict'

const Model = require('./base.js')

class CloudinaryType extends Model {
  static get tableName () {
    return 'cloudinaryType'
  }
}

module.exports = CloudinaryType
