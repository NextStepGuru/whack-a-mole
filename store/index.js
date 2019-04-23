import Vue from 'vue'
import { isNil } from 'lodash'
import UserAgentParser from 'ua-parser-js'
import MobileAgentDetect from 'mobile-detect'

export const state = () => ({
  ua: {},
  mua: {},
  screen: {
    availHeight: 0,
    availLeft: 0,
    availTop: 0,
    availWidth: 0,
    colorDepth: 0,
    height: 0,
    orientation: {
      angle: null,
      type: null
    },
    angle: 0,
    type: null,
    pixelDepth: null,
    width: null
  },
  user: {
    config: {},
    settings: {}
  },
  isUserLoggedIn: false
})

export const mutations = {
  setUserAgent (state, payload) {
    const ua = UserAgentParser(payload.userAgent)
    Vue.set(state, 'ua', ua)

    const mua = new MobileAgentDetect(payload.userAgent)
    Vue.set(state, 'mua', {
      isPhone: mua.phone() !== null,
      isMobile: mua.mobile() !== null,
      isTablet: mua.tablet() !== null,
      isChromeOS: ua.os.name === 'Chromium OS',
      isWebkit: mua.is('WebKit'),
      mobileGrade: mua.mobileGrade()
    })
  },
  setScreen (state, payload) {
    Vue.set(state, 'screen', payload)
  },
  setUser (state, payload) {
    Vue.set(state, 'user', payload.user ? payload.user : {})
    Vue.set(state, 'isUserLoggedIn', !isNil(payload.user))
  },
  setUserKey (state, payload) {
    Vue.set(state.user, payload.key, payload.val)
  },
  setLogout (state) {
    Vue.set(state, 'user', {})
    Vue.set(state, 'isUserLoggedIn', false)
  },
  setNextPath (state, payload) {
    Vue.set(state.user, 'settings', payload)
  }
}

export const actions = {
  async nuxtServerInit ({ commit, dispatch }) {
    if (this.$cookies.get('jwt')) {
      this.$axios.setToken(this.$cookies.get('jwt'))

      const RES = await this.$axios({
        method: 'get',
        url: '/api/login'
      })

      console.log('RES', RES)

      if (RES.data.code === 200) {
        dispatch('setUser', { user: RES.data.data[0] })

        this.$cookies.set('jwt', RES.data.data[0].token, {
          path: '/',
          maxAge: 60 * 60 * 24 * 365
        })
      } else {
        this.$cookies.remove('jwt')
        this.$axios.setToken(false)
      }
    }
  },
  async setNextPath ({ commit }, payload) {
    const RES = await this.$axios({
      method: 'put',
      url: `/api/user/next`,
      data: payload
    })

    if (RES.status === 200) {
      commit('setNextPath', RES.data.data[0].settings)
    } else {
      console.log('ERROR: RES', RES)
    }
  },
  async saveUser ({ state }) {
    const RES = await this.$axios({
      method: 'post',
      url: `/api/user`,
      data: state.user
    })

    if (RES.status !== 200) {
      console.log('ERROR: RES', RES)
    }
  },
  setUserAgent ({ commit }, payload) {
    commit('setUserAgent', payload)
  },
  setScreen ({ commit }, payload) {
    commit('setScreen', payload)
  },
  setUser ({ commit, dispatch }, payload) {
    commit('setUser', payload)
  },
  setUserKey ({ commit }, payload, event) {
    commit('setUserKey', {
      key: payload.key,
      val: payload.val
    })
  },
  setLogout ({ commit }) {
    commit('setLogout', {})
  }
}

export const getters = {
  getUserSettings (state) {
    return state.user.settings
  },
  getUserAgent (state) {
    return state.ua
  },
  getMobileUserAgent (state) {
    return state.mua
  },
  getScreen (state) {
    return state.screen
  },
  isMobile (state) {
    return state.mua.isMobile
  },
  isUserLoggedIn (state) {
    return state.isUserLoggedIn
  },
  getUser (state) {
    return state.user ? state.user : {}
  },
  getUserRoles (state) {
    return state.user && state.user.config && state.user.config.roles ? state.user.config.roles : []
  },
  getToken (state) {
    return state.user ? state.user.token : ''
  },
  getUserId (state) {
    return state.user ? state.user.id : 0
  }
}
