const _ = require('lodash')

module.exports = [
  {
    method: ['get'],
    path: '/api/site',
    handler: async (request, h) => {
      const NextStepGuruDB = request.server.app.db.nextstepguru.db
      const Site = request.server.app.db.nextstepguru.models.site

      let siteLookup = await Site
        .query(NextStepGuruDB)
        .where({
          domain: request.headers['x-forwarded-host'] ? request.headers['x-forwarded-host'] : 'www.guidedsteps.com'
        })
        .first()

      return _.isNil(siteLookup) ? {} : siteLookup
    }
  }
]
