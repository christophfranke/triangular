import Player from './player'
import Collision from './collision'
import LA from './la'

const COLLISION_FACTOR = -100
const MAX_RECURSION = 1
const ASSUME_CONSTANT_INPUT = 30
const Q = 5
const KEEP_CALCULATION = 0

const calculateInput = (game, player) => {
  if (player.input && player.input.keep) {
    player.input.keep -= 1
    return player.input
  }

  return {
    ...bestPlayer(game, player).input,
    keep: KEEP_CALCULATION
  }
}

const createFakePlayer = (player, override) => ({
  ...player,
  position: { ...player.position },
  speed: { ...player.speed },
  ...override
})

const evaluate = (game, player) => {
  const value = Player.milage(player) + LA.sqDistance(player.speed)
  if (Collision.intersectsAny(game, player)) {
    return COLLISION_FACTOR * value
  }

  return value
}

const evaluateInput = (game, player) => {
  Player.nextSpeed(player)
  Player.nextDirection(player)
  return evaluate(game, player)
}

const samePlayer = (game, player, n = 0) => {
  const fakePlayer = createFakePlayer(player)
  fakePlayer.value = evaluateInput(game, fakePlayer)
  fakePlayer.position = LA.add(fakePlayer.position, fakePlayer.speed)
  const nextValue = (fakePlayer.value > -1000 && n < MAX_RECURSION * ASSUME_CONSTANT_INPUT
    ? (n % ASSUME_CONSTANT_INPUT > 0 ? samePlayer(game, fakePlayer, n + 1).value : bestPlayer(game, fakePlayer, n + 1).value) : 0)
  fakePlayer.value += Q * nextValue

  return fakePlayer
}

const bestPlayer = (game, player, n = 0) => {
  const best = [{ left: false, right: false },
    { left: true, right: false },
    { left: false, right: true },
    { left: true, right: true }]
    .reduce((best, input) => {
      const fakePlayer = createFakePlayer(player, { input })
      fakePlayer.value = evaluateInput(game, fakePlayer)
      fakePlayer.position = LA.add(fakePlayer.position, fakePlayer.speed)
      const nextValue = (fakePlayer.value > -1000 && n < MAX_RECURSION * ASSUME_CONSTANT_INPUT
        ? (n % ASSUME_CONSTANT_INPUT > 0 ? samePlayer(game, fakePlayer, n + 1).value : bestPlayer(game, fakePlayer, n + 1).value) : 0)
      fakePlayer.value += Q * nextValue

      return fakePlayer.value > best.value ? fakePlayer : best
    }, { value: -10000000, input: { left: false, right: false } })

  return best
}

export default {
  calculateInput
}
