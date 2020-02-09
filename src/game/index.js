import Renderer from './renderer'
import Player from './player'
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

  if (game.players.length > 1 && game.players.some(player => player.points >= WINNING_POINTS)) {
    game.winner = game.players.reduce((winner, player) => (winner && winner.points) > player.points ? winner : player)
    game.players.filter(p => p !== game.winner).forEach(other => {
      other.alive = false
    })
    game.stages.forEach(stage => {
      stage.owner = game.winner
    })
    stopSoon(game)
  }

  if (game.stopSoon) {
    stopSoon(game)
  }
}

const loop = game => {
  // const now = performance.now()
  // game.delta = now - game.time
  if (!game.paused) {
    game.tick += 1
    update(game)
  }
  // game.time = now

  if (game.running) {
    requestAnimationFrame(() => loop(game))
  }
}

const create = (canvas, players) => {
  const renderer = Renderer.create(canvas)
  const tree = Tree.create(canvas)
  const stages = []

  const game = {
    renderer,
    players: players.map(player => Player.create(tree, player)),
    tree,
    stages,
    tick: 0,
    deadTicks: 0,
    paused: false,
    running: false
  }

  Stage.add(game, Stage.cage(game))
  return game
}

const start = (canvas, players) => {
  const game = create(canvas, players)

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
  stop,
  WINNING_POINTS
}
