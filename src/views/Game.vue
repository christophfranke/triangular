<template>
  <div class="home">
    <canvas ref="canvas"></canvas>
    <div class="winning">
      <span class="point" v-for="(point, index) in points" :style="style(point)" :key="index"></span>
    </div>
    <div class="info speed" v-if="speed">speed {{ speed }} px/s</div>
    <div class="info milage" v-if="milage">milage {{ milage }} px</div>
    <div class="info average" v-if="averageSpeed">average speed {{ averageSpeed }} px/s</div>
  </div>
</template>

<script>
import Game from '@/game'
import Player from '@/game/player'
const isFullscreen = () => !window.screenTop && !window.screenY

export default {
  name: 'home',
  data () {
    return {
      game: null,
      speed: 0,
      maxSpeed: 0,
      milage: 0,
      tick: 0,
      fullscreen: false,
      players: []
    }
  },

  computed: {
    averageSpeed () {
      return Math.round(60 * this.milage / this.tick)
    },
    points () {
      let score = 0
      let best = this.players[0] || {
        milage: -1,
        color: {
          r: 0,
          g: 0,
          b: 0
        }
      }
      if (this.players.length > 1) {
        best = this.players.reduce((best, player) => player.alive && player.milage > best.milage ? player : best, {
          milage: -1,
          color: {
            r: 0,
            g: 0,
            b: 0
          }
        })
        score = Math.min((this.game && this.game.stages.filter(stage => stage.owner === best).length) || 0, Game.WINNING_POINTS)
      } else {
        score = Math.min(5, Math.max(Math.floor(this.milage / 10000), 0) || 0)
      }

      return Array(score).fill({
        filled: true,
        color: Player.color(best, best.milage > 0 ? 1 : 0)
      }).concat(Array(Game.WINNING_POINTS - score).fill({
        filled: false,
        color: Player.color(best, best.milage > 0 ? 1 : 0)
      }))
    }
  },

  methods: {
    style (point) {
      return {
        border: `1px solid ${point.color}`,
        backgroundColor: point.filled ? point.color : 'transparent'
      }
    },
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
        const resolveAndRemove = () => {
          if (isFullscreen()) {
            resolve()
            document.removeEventListener('fullscreenchange', resolveAndRemove)
            document.removeEventListener('mozfullscreenchange', resolveAndRemove)
            document.removeEventListener('webkitfullscreenchange', resolveAndRemove)
            document.removeEventListener('msfullscreenchange', resolveAndRemove)
          }
        }

        this.fullscreen = true
        document.addEventListener('fullscreenchange', resolveAndRemove)
        document.addEventListener('mozfullscreenchange', resolveAndRemove)
        document.addEventListener('webkitfullscreenchange', resolveAndRemove)
        document.addEventListener('msfullscreenchange', resolveAndRemove)
      })
    },

    keyStopGame (e) {
      if (e.code === 'Escape') {
        Game.stop(this.game)
        this.$router.push('/')
      }
    },

    fullscreenStopGame () {
      if (!isFullscreen()) {
        if (this.game) {
          Game.stop(this.game)
        }
        this.$router.push('/')
      }
    }
  },

  async mounted () {
    if (!this.$store.getters.players.length) {
      this.$router.push('/')
    }

    window.addEventListener('fullscreenchange', this.fullscreenStopGame)
    window.addEventListener('keydown', this.keyStopGame)

    try {
      await this.openFullscreen()
    } catch (e) {
      this.$router.push('/')
    }

    this.game = Game.start(this.$refs.canvas, this.$store.getters.players)
    this.players = this.game.players

    const observeGame = () => {
      if (this.game && this.game.players.length === 1) {
        const player = this.game.players[0]
        if (player) {
          this.speed = this.game.players[0].displaySpeed
          this.maxSpeed = this.speed ? Math.max(this.maxSpeed, this.speed) : this.maxSpeed

          if (player.alive && !player.winner) {
            this.tick = this.game && this.game.tick
            this.milage = this.game && this.game.players[0] && this.game.players[0].milage
          }
        }
      }

      if (this) {
        requestAnimationFrame(observeGame)
      }

      if (this.game && !this.game.running && this.$refs.canvas) {
        this.game = Game.start(this.$refs.canvas, this.$store.getters.players)
        this.players = this.game.players
        this.maxSpeed = 0
      }
    }

    observeGame()
  },

  destroyed () {
    window.removeEventListener('keydown', this.keyStopGame)
    window.removeEventListener('fullscreenchange', this.fullscreenStopGame)
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
  cursor: none;
}
.info {
  position: absolute;
  left: 10px;
  color: white;
  font-size: 28px;
}
.speed {
  top: 10px;
}
.milage {
  top: 40px;
}
.average {
  top: 70px;
}
.winning {
  position: fixed;
  top: 10px;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.point {
  width: 3vw;
  height: 3vw;
  margin-right: 15px;
  display: block;
}
</style>
