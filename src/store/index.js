import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  getters: {
    players: state => state.players
  },
  state: {
    players: []
  },
  mutations: {
    addPlayer (state, player) {
      state.players.push(player)
    },
    removePlayer (state, player) {
      state.players = state.players.filter(p => p !== player)
    },
    resetPlayers (state) {
      state.players = []
    }
  },
  actions: {
  },
  modules: {
  }
})
