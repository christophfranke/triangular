import Renderer from './renderer'
import Player from './player'
import Collision from './collision'
import Util from './util'
import LA from './la'

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

  const { width, height } = canvas

  let point1 = null
  let point2 = LA.random(width, height)
  const lines = Array(4).fill(null).map(() => {
    point1 = point2
    point2 = LA.random(width, height)
    return {
      point1,
      point2
    }
  })

  const tree = Collision.create(canvas, lines)
  const colors = [Util.pick(Player.COLORS)]
  const players = Array(100).fill(null).map(() => Player.create(canvas, tree, colors))

  return {
    renderer,
    players,
    tree,
    lines,
    running: false
  }
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
