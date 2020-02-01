import Player from './player'
import Collision from './collision'
import LA from './la'
import Stage from './stage'

const COLLISION_FACTOR = -100000
const Q = 0.9875
const INPUTS = Array(1).fill(30)

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
const pointDirection = (stage, point) => {
  let currentStage = stage
  while (currentStage && !Stage.contains(currentStage, point)) {
    currentStage = stage.nextStage
  }

  return currentStage ? stageDirection(currentStage) : LA.vector(0, -1)
}

const evaluate = (game, player) => {
  const value = LA.product(player.speed, pointDirection(player.stage, player.position))
  if (Collision.intersectsAny(game, player)) {
    return COLLISION_FACTOR * Math.abs(value)
  }

  return value
}

const evaluateInput = (game, player) => {
  Player.nextSpeed(player)
  Player.nextDirection(player)
  return evaluate(game, player)
}

const clamp = (min, max, value) => Math.max(Math.min(max, value), min)
const next = ({ n, m }) => n === INPUTS[m] ? { n: 0, m: m + 1 } : { n: n + 1, m }
const goDeeper = (score, speed, iter) =>
  score > clamp(0.2, 0.6, 1 - 60 * speed / 1000) * (maxValue[iteration(iter)] || 0) &&
  iter.m < INPUTS.length
const iteration = ({ m, n }) => 100 * m + n
const samePlayer = (game, player, iter = { n: 0, m: 0 }) => {
  const fakePlayer = createFakePlayer(player)
  fakePlayer.value = evaluateInput(game, fakePlayer)
  fakePlayer.position = LA.add(fakePlayer.position, fakePlayer.speed)
  const score = fakePlayer.value + (player.value || 0)
  maxValue[iteration(iter)] = Math.max(maxValue[iteration(iter)] || 0, score)
  // positions.push(fakePlayer.position)
  const nextValue = goDeeper(score, LA.distance(fakePlayer.speed), iter)
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
      // positions.push(fakePlayer.position)
      const nextValue = goDeeper(score, LA.distance(fakePlayer.speed), iter)
        ? (iter.n > 0 ? samePlayer(game, fakePlayer, next(iter)).value : bestPlayer(game, fakePlayer, next(iter)).value) : 0
      fakePlayer.value += Q * nextValue

      return fakePlayer.value > best.value ? fakePlayer : best
    }, { value: -10000000, input: { left: false, right: false } })

  return best
}

export default {
  calculateInput
}
