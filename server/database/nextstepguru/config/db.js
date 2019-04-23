'use strict'

const config = require('../../config.js')
const nextstepguru = require('knex')(config.nextstepguru)

module.exports = nextstepguru
