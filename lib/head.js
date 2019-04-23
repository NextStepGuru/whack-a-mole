export default async ($axios, app, path) => {
  $axios.setHeader('Content-Type', 'application/json', ['put', 'post', 'patch', 'delete', 'get'])
  $axios.setHeader('Accept', 'application/json', ['put', 'post', 'patch', 'delete', 'get'])

  if (app.$cookies.get('jwt')) {
    $axios.setToken(app.$cookies.get('jwt'))
  } else {
    $axios.setToken(app.store.getters['getToken'])
  }

  let thisPageData = await $axios({
    method: 'post',
    url: '/api/page',
    data: {
      path: path
    }
  })

  if (thisPageData.statusCode === 200) {
    return thisPageData.data.data[0]
  } else {
    return {
      title: null,
      content: null,
      pageHeading: null,
      head: {
        meta: []
      }
    }
  }
}

