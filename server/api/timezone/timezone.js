module.exports = [
  {
    method: ['get'],
    path: '/api/timezone',
    handler: async (request, h) => {
      const GuidedStepsDB = request.server.app.db.nextstepguru.db
      const Timezone = request.server.app.db.nextstepguru.models.timezone

      let timezones = await Timezone
        .query(GuidedStepsDB)

      return timezones
    }
  }
]
