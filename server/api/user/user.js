const _ = require('lodash')

module.exports = [
  {
    method: ['PUT'],
    path: '/api/user/settings',
    handler: async (request, h) => {
      const NextStepGuruDB = request.server.app.db.nextstepguru.db
      const User = request.server.app.db.nextstepguru.models.user

      let user = await User
        .query(NextStepGuruDB)
        .where({
          id: request.auth.credentials.id
        })
        .first()

      user.settings = request.payload.settings

      await User
        .query(NextStepGuruDB)
        .update({
          settings: request.payload.settings
        })
        .where({
          id: request.auth.credentials.id
        })

      return user
    },
    options: {
      auth: {
        strategy: 'jwt'
      }
    }
  },
  {
    method: ['PUT'],
    path: '/api/user/next',
    handler: async (request, h) => {
      const NextStepGuruDB = request.server.app.db.nextstepguru.db
      const User = request.server.app.db.nextstepguru.models.user

      let user = await User
        .query(NextStepGuruDB)
        .where({
          id: request.auth.credentials.id
        })
        .first()

      if (!user.settings.quickstart) {
        user.settings['quickstart'] = {}
      }

      let nextLoginPath = '/dashboard'
      for (let key in request.payload) {
        if (request.payload[key] === false) {
          nextLoginPath = key
        }
      }

      user.settings.quickstart = Object.assign(user.settings.quickstart, request.payload)

      await User
        .query(NextStepGuruDB)
        .update({
          lastRoute: nextLoginPath,
          settings: user.settings
        })
        .where({
          id: request.auth.credentials.id
        })

      return user
    },
    options: {
      auth: {
        strategy: 'jwt'
      }
    }
  },
  {
    method: ['POST'],
    path: '/api/user',
    handler: async (request, h) => {
      const NextStepGuruDB = request.server.app.db.nextstepguru.db
      const User = request.server.app.db.nextstepguru.models.user

      let user = await User
        .query(NextStepGuruDB)
        .where({
          id: request.auth.credentials.id
        })
        .first()

      for (let key in request.payload) {
        if (!_.isNil(user[key])) {
          user[key] = request.payload[key]
        }
      }

      delete user.settings
      delete user.config
      delete user.password
      delete user.createdAt
      delete user.modifiedAt

      await User
        .query(NextStepGuruDB)
        .update(user)
        .where({
          id: request.auth.credentials.id
        })

      return user
    },
    options: {
      auth: {
        strategy: 'jwt'
      }
    }
  }
]
