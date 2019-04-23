module.exports = [
  {
    method: ['get'],
    path: '/api/country',
    handler: async (request, h) => {
      const NextStepGuruDB = request.server.app.db.nextstepguru.db
      const Country = request.server.app.db.nextstepguru.models.country

      let countries = await Country
        .query(NextStepGuruDB)

      return countries
    }
  }
]
