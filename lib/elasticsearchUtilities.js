const ElasticSearchAPI = require('elasticsearch')
const ElasticSearchClient = new ElasticSearchAPI.Client({
  host: 'ws-2-atl.guidedsteps.com:9200',
  log: 'error'
})

const ElasticSearch = {
  upload: async (index, data) => {
    let bulkData = []

    for (let i = 0; i < data.length; i++) {
      bulkData.push({ index: { _index: index, _type: 'default', _id: data[i].id } })
      bulkData.push({ doc: data[i] })
    }

    let results = await ElasticSearchClient.bulk({
      body: bulkData
    })

    return results
  },
  search: async (index, searchObject) => {
    let results = await ElasticSearchClient.search({
      index: index,
      body: searchObject
    })

    return results
  }
}

module.exports = ElasticSearch
