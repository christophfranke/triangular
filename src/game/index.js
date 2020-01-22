import Renderer from './renderer'
import Player from './player'
import Util from './util'
import Stage from './stage'
import Tree from './tree'

const WINNING_POINTS = 5
const TICKS_AFTER_ALL_DEAD = 180

const stopSoon = game => {
  if (game.deadTicks >= TICKS_AFTER_ALL_DEAD) {
    stop(game)
  } else {
    game.deadTicks += 1
  }
}

const update = game => {
  Stage.dropBehind(game)
  Stage.createBeyond(game)
  Player.move(game)
  Renderer.draw(game)

  if (game.players.every(player => !player.alive)) {
    stopSoon(game)
  }

  if (game.players.some(player => player.points >= WINNING_POINTS)) {
    game.winner = game.players.reduce((winner, player) => (winner && winner.points) > player.points ? winner : player)
    stopSoon(game)
  }
}

const loop = game => {
  const now = performance.now()
  game.delta = now - game.time
  game.tick += 1
  update(game)
  game.time = now

  if (game.running) {
    requestAnimationFrame(() => loop(game))
  }
}

const create = canvas => {
  const renderer = Renderer.create(canvas)
  const tree = Tree.create(canvas)
  const colors = [Util.pick(Player.COLORS)]
  const players = Array(1).fill(null).map(() => Player.create(tree, colors))
  const stages = []

  const game = {
    renderer,
    players,
    tree,
    stages,
    tick: 0,
    deadTicks: 0,
    running: false
  }

  Stage.add(game, Stage.cage(game))
  return game
}

const start = canvas => {
  const game = create(canvas)

  game.running = true
  game.time = performance.now()

  requestAnimationFrame(() => loop(game))

  return game
}

const stop = game => {
  game.running = false
}

export default {
  start,
  stop
}
