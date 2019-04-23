<template lang="pug">
  section.section
    .container.has-text-centered
</template>

<script>
import { mapActions } from 'vuex'

export default {
  components: {
  },
  data () {
    return {
    }
  },
  async asyncData ({ $axios, app, route }) {
    let returnData = {}

    return returnData
  },
  async mounted () {
    await this.setUser(false)

    let dn = window.location.hostname.split('.')
    if (dn.length === 3) {
      dn.splice(0, 1)
    }
    dn = dn.join('.')
    await this.$cookies.remove('jwt', {
      path: '/',
      domain: `.${dn}`,
      maxAge: 60 * 60 * 24 * 365,
      secure: true
    })
    await this.$axios.setToken(false)
    await this.setLogout()
    await this.$router.push({ path: '/' })
  },
  methods: {
    ...mapActions([
      'setUser', 'setLogout'
    ])
  }
}
</script>

<style lang="stylus">

</style>
