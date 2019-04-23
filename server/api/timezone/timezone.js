module.exports = [
  {
    method: ['get'],
    path: '/api/timezone',
    handler: async (request, h) => {
      const NextStepGuruDB = request.server.app.db.nextstepguru.db
      const Timezone = request.server.app.db.nextstepguru.models.timezone

      let timezones = await Timezone
        .query(NextStepGuruDB)

      return timezones
    }
  }
]
