const Joi = require('joi')
const _ = require('lodash')
const Boom = require('boom')
const Bcrypt = require('bcryptjs')
const uuid = require('uuid/v5')
const Config = require('../../../config/index.js')
const Jwt = require('jsonwebtoken')
const SiteConfig = require('../../../lib/siteConfig.js')
const PostmarkApp = require('postmark')
const PostmarkClient = new PostmarkApp.ServerClient(SiteConfig.postmarkapp.serverToken)

module.exports = [
  {
    method: ['get'],
    path: '/api/leaderboard',
    handler: async (request, h) => {
      const NextStepGuruDB = request.server.app.db.nextstepguru.db
      const Leaderboard = request.server.app.db.nextstepguru.models.leaderboard

      let leaderboard = await Leaderboard
        .query(NextStepGuruDB)
        .orderBy('score', 'desc')
        .eager('[user]')
        .limit(5)

      return {
        leaderboard: leaderboard
      }
    },
    options: {
      auth: {
        strategy: 'jwt',
        access: [{
          scope: ['user']
        }]
      }
    }
  },
  {
    method: ['post'],
    path: '/api/leaderboard',
    handler: async (request, h) => {
      const NextStepGuruDB = request.server.app.db.nextstepguru.db
      const Leaderboard = request.server.app.db.nextstepguru.models.leaderboard

      let currentScore = await Leaderboard
        .query(NextStepGuruDB)
        .insertAndFetch({
          userId: request.payload.userId,
          score: request.payload.score,
          timeInSeconds: request.payload.timeInSeconds
        })

      let leaderboard = await Leaderboard
        .query(NextStepGuruDB)
        .orderBy('score', 'desc')
        .eager('[user]')
        .limit(5)

      return {
        leaderboard: leaderboard,
        currentScore: currentScore
      }
    },
    options: {
      auth: {
        strategy: 'jwt',
        access: [{
          scope: ['user']
        }]
      }
    }
  }
]
