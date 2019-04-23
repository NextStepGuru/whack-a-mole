<template lang="pug">
  section.section
    .container
      h2.title.is-size-4
        span.icon
          fa(:icon="['fal', 'exclamation-triangle']")
        span  500 : Internal Server Error

      .notification.is-warning
        p Internal Server Error
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
