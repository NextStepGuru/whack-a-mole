<template lang="pug">
  section.section
    .container
      h2.title.is-size-4
        span.icon
          fa(:icon="['fal', 'exclamation-triangle']")
        span  403 : Forbidden

      .notification.is-warning
        p This route is forbidden

      nuxt-link.button.is-success.is-large(to="/") Login
</template>

<script>
export default {
  components: {
  },
  async asyncData ({ $axios, app, route }) {
    let returnData = {}

    return returnData
  }
}
</script>

<style lang="stylus">

</style>
