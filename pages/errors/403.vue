<template lang="pug">
  section.section
    .container
      h2.title.is-size-4
        span.icon
          fa(:icon="['fal', 'exclamation-triangle']")
        span  401 : Forbidden

      .notification.is-warning
        p This route is forbidden
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
