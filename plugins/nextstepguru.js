export default ({ $axios, req, store, app, redirect, $router }, inject) => {
  if (store.getters['isUserLoggedIn']) {
    $axios.setToken(app.$cookies.get('jwt'))
  }

  if (process.client) {
    store.dispatch('setUserAgent', { userAgent: navigator.userAgent })
    store.dispatch('setScreen', {
      availHeight: screen.availHeight,
      availLeft: screen.availLeft,
      availTop: screen.availTop,
      availWidth: screen.availWidth,
      colorDepth: screen.colorDepth,
      height: screen.height,
      orientation: {
        angle: screen.orientation && screen.orientation.angle ? screen.orientation.angle : null,
        type: screen.orientation && screen.orientation.type ? screen.orientation.type : null
      },
      angle: screen.angle,
      type: screen.type,
      pixelDepth: screen.pixelDepth,
      width: screen.width
    })

    window.addEventListener('orientationchange', () => {
      store.dispatch('setScreen', {
        availHeight: screen.availHeight,
        availLeft: screen.availLeft,
        availTop: screen.availTop,
        availWidth: screen.availWidth,
        colorDepth: screen.colorDepth,
        height: screen.height,
        orientation: {
          angle: screen.orientation && screen.orientation.angle ? screen.orientation.angle : null,
          type: screen.orientation && screen.orientation.type ? screen.orientation.type : null
        },
        angle: screen.angle,
        type: screen.type,
        pixelDepth: screen.pixelDepth,
        width: screen.width
      })
    })
    window.addEventListener('resize', () => {
      store.dispatch('setScreen', {
        availHeight: screen.availHeight,
        availLeft: screen.availLeft,
        availTop: screen.availTop,
        availWidth: screen.availWidth,
        colorDepth: screen.colorDepth,
        height: screen.height,
        orientation: {
          angle: screen.orientation && screen.orientation.angle ? screen.orientation.angle : null,
          type: screen.orientation && screen.orientation.type ? screen.orientation.type : null
        },
        angle: screen.angle,
        type: screen.type,
        pixelDepth: screen.pixelDepth,
        width: screen.width
      })
    })
  }
}
