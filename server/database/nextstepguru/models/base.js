'use strict'

const SuperBase = require('../../super.js')

class Base extends SuperBase {
  static get logChanges () {
    return true
  }
}

module.exports = Base
