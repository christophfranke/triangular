import Player from './player'
import Collision from './collision'
import LA from './la'

const COLLISION_FACTOR = -1000
const Q = 1
const INPUTS = Array(5).fill(20)

let positions = []
let maxValue = {}
const calculateInput = (game, player) => {
  positions = []
  if (!player.alive) {
    return {
      left: false,
      right: false,
      positions
    }
  }

  maxValue = {}
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

const stageDirection = stage => LA.normalize(LA.rotate90(LA.subtract(stage.rightLine.point1, stage.leftLine.point1)))

const evaluate = (game, player) => {
  // const fakePlayer = createFakePlayer(player, { position: LA.add(player.position, player.speed) })
  // const value = (Player.milage(fakePlayer)) - (player.stage ? player.stage.milage : 0) + LA.sqDistance(player.speed)
  const value = (player.stage ? LA.product(player.speed, stageDirection(player.stage)) : LA.distance(player.speed)) +
    LA.distance(player.speed)
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
const goDeeper = (score, iter) =>
  score > 0.5 * (maxValue[iteration(iter)] || 0) &&
  iter.m < INPUTS.length
const iteration = ({ m, n }) => 35 * m + n
const samePlayer = (game, player, iter = { n: 0, m: 0 }) => {
  const fakePlayer = createFakePlayer(player)
  fakePlayer.value = evaluateInput(game, fakePlayer)
  fakePlayer.position = LA.add(fakePlayer.position, fakePlayer.speed)
  const score = fakePlayer.value + (player.value || 0)
  maxValue[iteration(iter)] = Math.max(maxValue[iteration(iter)] || 0, score)
  positions.push(fakePlayer.position)
  const nextValue = goDeeper(score, iter)
    ? (iter.n > 0 ? samePlayer(game, fakePlayer, next(iter)).value : bestPlayer(game, fakePlayer, next(iter)).value) : 0
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
      const score = fakePlayer.value + (player.value || 0)
      maxValue[iteration(iter)] = Math.max(maxValue[iteration(iter)] || 0, score)
      positions.push(fakePlayer.position)
      const nextValue = goDeeper(score, iter)
        ? (iter.n > 0 ? samePlayer(game, fakePlayer, next(iter)).value : bestPlayer(game, fakePlayer, next(iter)).value) : 0
      fakePlayer.value += Q * nextValue

      return fakePlayer.value > best.value ? fakePlayer : best
    }, { value: -10000000, input: { left: false, right: false } })

  return best
}

export default {
  calculateInput
}
