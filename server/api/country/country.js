module.exports = [
  {
    method: ['get'],
    path: '/api/country',
    handler: async (request, h) => {
      const GuidedStepsDB = request.server.app.db.nextstepguru.db
      const Country = request.server.app.db.nextstepguru.models.country

      let countries = await Country
        .query(GuidedStepsDB)

      return countries
    }
  }
]
