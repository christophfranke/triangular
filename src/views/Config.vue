<template>
  <div class="configScreen">
    <router-link to="/" class="back button">BACK (ESC)</router-link>
    <h1 class="chooseYourColor">Choose your Color</h1>
    <p>Press one of the colored keys to enter the game</p>
    <img src="/kurve_tastatur.png" alt="keys">
    <div class="activePlayerList"></div>
    <h1 class="blink" v-show="showBlink">Hit Space to start</h1>
  </div>
</template>

<script>
import Blink from '@/mixins/blink'
import NavigateOnKeypress from '@/mixins/navigateOnKeypress'

export default {
  name: 'Config',
  mixins: [Blink, NavigateOnKeypress({
    'Escape': '/',
    'Space': '/triangular'
  })]
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
