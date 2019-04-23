'use strict'

const Model = require('./base.js')

class Leaderboard extends Model {
  static get tableName () {
    return 'leaderboard'
  }

  static get relationMappings () {
    return {
      user: {
        relation: Model.HasOneRelation,
        modelClass: require('./user.js'),
        join: {
          from: 'user.id',
          to: 'leaderboard.userId'
        }
      }
    }
  }

  get $schema () {
    return {}
  }
}

module.exports = Leaderboard
