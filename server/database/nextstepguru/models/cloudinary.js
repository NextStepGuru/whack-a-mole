'use strict'

const Model = require('./base.js')

class Cloudinary extends Model {
  static get tableName () {
    return 'cloudinary'
  }

  get $jsonFields () {
    return ['payload', 'payloadConfig', 'payloadAdmin']
  }

  static get relationMappings () {
    return {
      target: {
        relation: Model.HasOneRelation,
        modelClass: require('./cloudinaryTarget.js'),
        join: {
          from: 'cloudinary.cloudinaryTargetId',
          to: 'cloudinaryTarget.id'
        }
      },
      type: {
        relation: Model.HasOneRelation,
        modelClass: require('./cloudinaryType.js'),
        join: {
          from: 'cloudinary.cloudinaryTypeId',
          to: 'cloudinaryType.id'
        }
      }
    }
  }
}

module.exports = Cloudinary
