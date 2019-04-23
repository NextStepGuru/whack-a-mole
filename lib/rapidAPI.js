const Axios = require('axios')
const Package = require('../package.json')

class RapidAPI {
  constructor ({
    apiKey = '0',
    db = {}
  } = { ...arguments }) {
    this.apiKey = apiKey
    this.$db = db.db
    this.$model = db.models.synonym
    this.$axios = Axios.create({
      headers: {
        'X-RapidAPI-Key': this.apiKey,
        'User-Agent': `guidedsteps-api/${Package.version}`,
        'accept': 'application/json',
        'content-type': 'application/json'
      }
    })
  }

  async synonyms (word) {
    let cache = await this.$model
      .query(this.$db)
      .where({
        word: word
      })
      .first()

    if (!cache) {
      let RES = await this.$axios({
        method: 'get',
        url: `https://wordsapiv1.p.rapidapi.com/words/${word.toLowerCase()}/synonyms`
      }).catch(e => {
        return e
      })

      let responseData = {}
      if (+RES.status === 404) {
        responseData = {
          error: RES
        }
      } else {
        responseData = RES.data
      }

      cache = await this.$model
        .query(this.$db)
        .upsertGraphAndFetch({
          word: word,
          json: responseData
        })
    }

    return cache
  }
}

module.exports = RapidAPI
