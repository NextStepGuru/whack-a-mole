<template lang="pug">
  section.section
    .columns
      .column
        span Speed:
        input.slider.is-fullwidth.is-large.is-primary(
          v-model="state.speedInSeconds"
          step="0.1"
          min="0.5"
          max="3"
          value="1"
          type="range",
          @input="changeInterval")
      .column
        span Score: &nbsp;
        span {{ state.score}}
      .column
        span Miss: &nbsp;
        span {{ state.miss}}

    .columns.is-multiline.is-mobile
      .column.is-2(v-for="(item, idx) in state.moles")
        mole-hill(
          :key="idx",
          v-bind="item",
          @score="score",
          @miss="miss")
</template>

<script>
import MoleHill from '~/components/MoleHill.vue'
export default {
  name: 'Home',
  components: {
    'mole-hill': MoleHill
  },
  data () {
    return {
      state: {
        score: 0,
        miss: 0,
        interval: null,
        speedInSeconds: 1,
        maxMoles: 1,
        totalMoles: 18,
        activeMoles: [],
        moles: {
        }
      }
    }
  },
  mounted () {
    for (let i = 0; i < this.state.totalMoles; i++) {
      this.$set(this.state.moles, `${i + 1}`, {
        isMoleHidden: true
      })
    }

    this.changeInterval()
  },
  methods: {
    miss () {
      this.state.miss++
    },
    score () {
      this.state.score++
    },
    getRandomInt(min, max) {
      min = Math.ceil(min)
      max = Math.floor(max)

      return Math.floor(Math.random() * (max - min)) + min
    },
    changeInterval () {
      let vm = this
      clearInterval(vm.state.interval)
      vm.state.interval = setInterval (() => {
        /*
          Will hit same mole 1/12th of the time and
          no mole will appear by design.
         */
        let popMole = vm.getRandomInt(1, 12)
        vm.state.moles[`${popMole}`].isMoleHidden = false
        vm.state.activeMoles.push(popMole)

        if (vm.state.activeMoles.length > vm.state.maxMoles) {
          let removeMole = vm.state.activeMoles[0]
          vm.state.moles[`${removeMole}`].isMoleHidden = true
          vm.state.activeMoles.shift()
        }
      }, this.state.speedInSeconds * 1000)
    }
  }
}
</script>
