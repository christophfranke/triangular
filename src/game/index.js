import Renderer from './renderer'
import Player from './player'
import Util from './util'
import Stage from './stage'
import Tree from './tree'

const update = game => {
  Player.move(game)
  Renderer.draw(game)
}

const loop = game => {
  const now = performance.now()
  game.delta = now - game.time
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
    running: false
  }

  const cage = Stage.cage(game)
  Stage.add(game, cage)
  Array(10).fill(null).forEach(() => Stage.add(game))

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
  Renderer.clear(game)
}

export default {
  start,
  stop
}
