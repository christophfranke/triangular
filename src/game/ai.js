import Player from './player'
import Collision from './collision'
import LA from './la'

const COLLISION_FACTOR = -100
const Q = 0.95
const INPUTS = [30]

let positions = []
const calculateInput = (game, player) => {
  positions = []
  return {
    ...bestPlayer(game, createFakePlayer(player)).input,
    positions
  }
}

const createFakePlayer = (player, override) => ({
  ...player,
  position: { ...player.position },
  speed: { ...player.speed },
  ...override
})

const evaluate = (game, player) => {
  const fakePlayer = createFakePlayer(player, { position: LA.add(player.position, player.speed) })
  const value = (Player.milage(fakePlayer)) - (player.stage ? player.stage.milage : 0) + LA.sqDistance(player.speed)
  // const value = LA.sqDistance(player.speed)
  // const value = Player.milage(fakePlayer) || LA.sqDistance(player.speed)
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

const next = ({ n, m }) => n === INPUTS[m] ? { n: 0, m: m + 1 } : { n: n + 1, m }
const minExpectation = ({ n, m }) => 5 * n * m - 100
const samePlayer = (game, player, iter = { n: 0, m: 0 }) => {
  const fakePlayer = createFakePlayer(player)
  fakePlayer.value = evaluateInput(game, fakePlayer)
  fakePlayer.position = LA.add(fakePlayer.position, fakePlayer.speed)
  positions.push(fakePlayer.position)
  const nextValue = (fakePlayer.value > minExpectation(iter) && iter.m < INPUTS.length
    ? (iter.n > 0 ? samePlayer(game, fakePlayer, next(iter)).value : bestPlayer(game, fakePlayer, next(iter)).value) : 0)
  fakePlayer.value += Q * nextValue

  return fakePlayer
}

const bestPlayer = (game, player, iter = { n: 0, m: 0 }) => {
  const best = [{ left: false, right: false },
    { left: true, right: false },
    { left: false, right: true },
    { left: true, right: true }]
    .reduce((best, input) => {
      const fakePlayer = createFakePlayer(player, { input })
      fakePlayer.value = evaluateInput(game, fakePlayer)
      fakePlayer.position = LA.add(fakePlayer.position, fakePlayer.speed)
      positions.push(fakePlayer.position)
      const nextValue = (fakePlayer.value > minExpectation(iter) && iter.m < INPUTS.length
        ? (iter.n > 0 ? samePlayer(game, fakePlayer, next(iter)).value : bestPlayer(game, fakePlayer, next(iter)).value) : 0)
      fakePlayer.value += Q * nextValue

      return fakePlayer.value > best.value ? fakePlayer : best
    }, { value: -10000000, input: { left: false, right: false } })

  return best
}

export default {
  calculateInput
}
