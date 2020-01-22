<template>
  <div class="home">
    <canvas ref="canvas" @click="toggle"></canvas>
    <div class="info speed" v-if="game">current {{ speed }} px/s</div>
    <div class="info average" v-if="game">average {{ averageSpeed }} px/s</div>
    <div class="info max" v-if="game">maximum {{ maxSpeed }} px/s</div>
    <div class="info milage" v-if="game">milage {{ milage }} px</div>
  </div>
</template>

<script>
import Game from '@/game'

export default {
  name: 'home',
  data () {
    return {
      game: null,
      speed: 0,
      maxSpeed: 0,
      milage: 0,
      tick: 0,
      fullscreen: false
    }
  },

  computed: {
    averageSpeed () {
      return Math.round(60 * this.milage / this.tick)
    }
  },

  methods: {
    openFullscreen () {
      if (this.fullscreen) {
        return Promise.resolve()
      }

      const elem = document.documentElement
      if (elem.requestFullscreen) {
        elem.requestFullscreen()
      } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen()
      } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen()
      } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen()
      }

      return new Promise(resolve => {
        this.fullscreen = true
        document.addEventListener('fullscreenchange', resolve)
        document.addEventListener('mozfullscreenchange', resolve)
        document.addEventListener('webkitfullscreenchange', resolve)
        document.addEventListener('msfullscreenchange', resolve)
      })
    },

    closeFullscreen () {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.mozCancelFullScreen) { /* Firefox */
        document.mozCancelFullScreen()
      } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
        document.webkitExitFullscreen()
      } else if (document.msExitFullscreen) { /* IE/Edge */
        document.msExitFullscreen()
      }
    },

    async toggle () {
      if (this.game && this.game.running) {
        Game.stop(this.game)
        // this.closeFullscreen()
      } else {
        // await this.openFullscreen()
        this.game = Game.start(this.$refs.canvas)
      }
    }
  },

  mounted () {
    const observeGame = () => {
      if (this.game) {
        const player = this.game.players[0]
        if (player) {
          this.speed = this.game.players[0].displaySpeed
          this.maxSpeed = this.speed ? Math.max(this.maxSpeed, this.speed) : this.maxSpeed

          if (player.alive) {
            this.tick = this.game && this.game.tick
            this.milage = this.game && this.game.players[0] && this.game.players[0].milage
          }
        }
      } else {
        this.maxSpeed = 0
      }
      requestAnimationFrame(observeGame)
    }

    observeGame()
  }

}
</script>

<style lang="scss" scoped>
canvas {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  min-height: 100vh;
  min-width: 100vw;
  // cursor: none;
}
.info {
  position: absolute;
  left: 10px;
  color: red;
  font-size: 20px;
}
.speed {
  top: 10px;
}
.average {
  top: 30px;
}
.max {
  top: 50px;
}
.milage {
  top: 70px;
}
</style>
