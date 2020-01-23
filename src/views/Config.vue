<template>
  <div class="configScreen">
    <router-link to="/" class="back button">BACK (ESC)</router-link>
    <h1 class="chooseYourColor">Choose your Color</h1>
    <p>Press one of the colored keys to enter the game</p>
    <img src="/kurve_tastatur.png" alt="keys">
    <div class="activePlayerList">
      <span class="player" v-for="(player, index) in $store.getters.players" :style="color(player)" :key="index"></span>
    </div>
    <h1 class="blink" v-show="showBlink && $store.getters.players.length > 0">Hit Space to start</h1>
  </div>
</template>

<script>
import Blink from '@/mixins/blink'
import NavigateOnKeypress from '@/mixins/navigateOnKeypress'
import Player from '@/game/player'

export default {
  name: 'Config',
  mixins: [Blink, NavigateOnKeypress({
    'Escape': '/'
  })],

  methods: {
    color (player) {
      return {
        backgroundColor: Player.color(player)
      }
    },
    keydown (e) {
      const player = Player.PLAYERS.find(player => player.left === e.key || player.right === e.key)
      if (player) {
        if (this.$store.getters.players.includes(player)) {
          this.$store.commit('removePlayer', player)
        } else {
          this.$store.commit('addPlayer', player)
        }
      }

      if (e.code === 'Space' && this.$store.getters.players.length > 0) {
        this.$router.push('/triangular')
      }
    }
  },

  mounted () {
    this.$store.commit('resetPlayers')
    window.addEventListener('keydown', this.keydown)
  },

  destroyed () {
    window.removeEventListener('keydown', this.keydown)
  }
}
</script>

<style lang="scss" scoped>
.configScreen {
  background-color: black;
  text-align: center;
  color: white;
  height: 100vh;
}
.back {
  position: absolute;
  top: 20px;
  left: 20px;
  cursor: pointer;
  color: #fff;
  text-decoration: none;
}
.chooseYourColor {
  color: #fff;
  text-align: center;
  pointer-events: none;
  margin-bottom: 10px;
  padding-top: 8vw;
  margin-top: 0;
}
.activePlayerList {
  text-align: center;
}
.player {
  display: inline-block;
  width: 3vw;
  height: 3vw;
  margin-right: 15px;
}
.blink {
  text-align: center;
  pointer-events: none;
  margin-bottom: 10px;
}
img {
  width: 60%;
  margin: 2vw auto;
  display: block;
  height: auto;
}
</style>
