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
  mounted () {
    this.setUser(false)
    this.$cookies.remove('jwt')
    this.$axios.setToken(false)
    this.setLogout()
    this.$router.push({ path: '/' })
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
