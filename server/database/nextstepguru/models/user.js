'use strict'

const Model = require('./base.js')
// const ValidationError = require('objection').Model.ValidationError

class User extends Model {
  get $secureFields () {
    return ['password', 'passwordResetToken']
  }

  get $jsonFields () {
    return ['config', 'settings']
  }

  static get tableName () {
    return 'user'
  }

  static get namedFilters () {
    return {
      isParent: (builder) => {
        builder
          .where('typeId', 16)
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

module.exports = User
