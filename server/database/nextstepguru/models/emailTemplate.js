'use strict'

const Model = require('./base.js')

class EmailTemplate extends Model {
  static get tableName () {
    return 'emailTemplate'
  }

  get $jsonFields () {
    return ['config']
  }

  static get relationMappings () {
    return {
      type: {
        relation: Model.HasOneRelation,
        modelClass: require('./emailType.js'),
        join: {
          from: 'emailType.id',
          to: 'emailTemplate.emailTypeId'
        }
      }
    }
  }

  get $schema () {
    return {}
  }
}

module.exports = EmailTemplate
