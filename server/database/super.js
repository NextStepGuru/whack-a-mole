const _ = require('lodash')
const Moment = require('moment')
const Objection = require('objection').Model
const Utilities = require('../../lib/utilities.js')
const { DbErrors } = require('objection-db-errors')

class SuperBase extends DbErrors(Objection) {
  constructor (payload) {
    super()
    if (payload) {
      for (let key in payload) {
        this[key] = payload[key]
      }
    }
  }

  static get idColumn () {
    return 'id'
  }

  get $joi () {
    return require('joi')
  }

  get $ignoreFields () {
    return []
  }

  get $jsonFields () {
    return []
  }

  get $hiddenFields () {
    return []
  }

  $beforeInsert (queryContext) {
    if (Array.isArray(this.$jsonFields)) {
      for (let j = 0; j < this.$jsonFields.length; j++) {
        let thisJSONField = this.$jsonFields[j]
        if (typeof this[thisJSONField] !== 'string' && !_.isNil(this[thisJSONField])) {
          this[thisJSONField] = JSON.stringify(this[thisJSONField])
        }
      }
    }

    for (let key in this) {
      if (this.$jsonFields.indexOf(key) === -1) {
        this[key] = Utilities.ifDateDatabaseFormatOrReturn(this[key])
      }

      if (key.match(/createdAt|modifiedAt/)) {
        delete this[key]
      }
    }
  }

  $afterinsert (queryContext) {
  }

  $beforeUpdate (opt, queryContext) {
    if (Array.isArray(this.$jsonFields)) {
      for (let j = 0; j < this.$jsonFields.length; j++) {
        let thisJSONField = this.$jsonFields[j]
        if (typeof this[thisJSONField] !== 'string' && !_.isNil(this[thisJSONField])) {
          this[thisJSONField] = JSON.stringify(this[thisJSONField])
        }
      }
    }

    for (let key in this) {
      if (this.$jsonFields.indexOf(key) === -1) {
        this[key] = Utilities.ifDateDatabaseFormatOrReturn(this[key])
      }

      if (key.match(/createdAt|modifiedAt/)) {
        delete this[key]
      }
    }
  }

  $afterUpdate (opt, queryContext) {
  }

  $beforeGet (queryContext) {
  }

  $afterGet (queryContext) {
    if (Array.isArray(this.$jsonFields)) {
      for (let j = 0; j < this.$jsonFields.length; j++) {
        let thisJSONField = this.$jsonFields[j]
        if (typeof this[thisJSONField] === 'string' && !_.isNil(this[thisJSONField])) {
          this[thisJSONField] = JSON.parse(this[thisJSONField])
        }
      }
    }
  }

  $formatJson (json, options) {
    json = super.$formatJson(json, options)
    let returnData = _.omit(_.omit(json, this.$hiddenFields), this.$secureFields)

    return returnData
  }

  $validateModel () {
    let json = this

    this.$schema.validate(json, { stripUnknown: true, allowUnknown: true }, (err, json) => {
      if (err) {
        throw new SuperBase.ValidationError(err)
      }
    })

    return true
  }

  $validate (json = this, options = {}) {
    if ((!options.patch || options.patch === false) && '$schema' in this && typeof this.$schema !== 'undefined') {
      // this.$schema.validate(json, { allowUnknown: true }, (err, json) => {
      // if (err) {
      // throw new blackfiskModel.ValidationError(err.details[0].message)
      // }
      // })
    }

    return json
  }
}

module.exports = SuperBase
