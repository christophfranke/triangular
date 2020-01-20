import Renderer from './renderer'
import Player from './player'
import Collision from './collision'
import Util from './util'
import Level from './level'
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
  const levels = [Level.cage()]
  levels.push(Level.create(levels))

  levels.forEach(level => {
    level.lines.forEach(line => Tree.add(tree, Collision.line(line.point1, line.point2)))
  })

  return {
    renderer,
    players,
    tree,
    levels,
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
