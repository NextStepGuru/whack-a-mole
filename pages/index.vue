<template lang="pug">
.mole-body
  .container
    section.section
      .columns
        .column.has-text-centered
          .buttons
            button.button.is-large.is-success(
              @click="start",
              :disabled="state.startTime") Start Game
            button.button.is-large.is-danger(
              @click="stopInterval",
              :disabled="!state.startTime") Stop Game
        .column.has-text-centered
          h2.is-size-2 Speed
          input.slider.is-fullwidth.is-large.is-primary(
            v-model="state.speedInSeconds"
            step="0.1"
            min="0.5"
            max="3"
            value="1"
            type="range",
            @input="changeInterval")
        .column.has-text-centered
          h2.is-size-2 Score
          span {{ state.score}}
        .column.has-text-centered
          h2.is-size-2 Click Misses
          span {{ state.miss}}
        .column.has-text-centered
          h2.is-size-2 Time Left
          span {{ timeLeft() }} seconds

  .hero.is-success
    .hero-body
      .container
        .columns.is-multiline.is-mobile
          .column.is-1(v-for="(item, idx) in state.moles")
            mole-hill(
              :key="idx",
              v-bind="item",
              @score="score",
              @miss="miss")
</template>

<script>
import Moment from 'moment'
import MoleHill from '~/components/MoleHill.vue'

const DefaultState = {
  maxTimeInSeconds: 10,
  endTime: null,
  startTime: null,
  score: 0,
  miss: 0,
  interval: null,
  speedInSeconds: 1,
  maxMoles: 1,
  totalMoles: 60,
  activeMoles: [],
  moles: {
  }
}

export default {
  name: 'Home',
  components: {
    'mole-hill': MoleHill
  },
  data () {
    return {
      state: DefaultState
    }
  },
  computed: {
  },
  mounted () {
    this.resetState()
  },
  methods: {
    resetState () {
      this.state = DefaultState

      for (let i = 0; i < this.state.totalMoles; i++) {
        this.$set(this.state.moles, `${i + 1}`, {
          isMoleHidden: true
        })
      }
    },
    timeLeft () {
      return this.state.maxTimeInSeconds - Moment().diff(this.state.startTime, 'second') || 0
    },
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
    computeScore () {
      this.stopInterval()
      this.resetState()
    },
    stopInterval () {
      let vm = this
      clearInterval(vm.state.interval)

      for (let i = 0; i < vm.state.activeMoles.length; i++) {
        let removeMole = vm.state.activeMoles[0]
        vm.state.moles[`${removeMole}`].isMoleHidden = true
        vm.state.activeMoles.shift()
      }

      vm.state.startTime = null
    },
    start () {
      this.state.startTime = Moment()
      this.state.endTime = Moment().add({
        second: this.state.maxTimeInSeconds
      })
      this.changeInterval()
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

        if (Moment().diff(this.state.endTime, 'second') > 0) {
          this.computeScore()
        }
      }, this.state.speedInSeconds * 1000)
    }
  }
}
</script>
