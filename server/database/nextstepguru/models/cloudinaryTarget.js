'use strict'

const Model = require('./base.js')

class CloudinaryTarget extends Model {
  static get tableName () {
    return 'cloudinaryTarget'
  }
}

module.exports = CloudinaryTarget
