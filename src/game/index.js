import Renderer from './renderer'
import Player from './player'

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
  const players = Array(25).fill(null).map(() => Player.create(canvas))

  return {
    renderer,
    players,
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
