import Input from './input'
import Collision from './collision'
import Tree from './tree'
import LA from './la'
import Util from './util'

const THRUST = 0.1
const TURN = 0.0175 * 2 * Math.PI
const DRAG = 0.01
const STABILITY = 0.9
const MAX_COLLISION_POWER = 5
const DIE_FROM_COLLISION = true

const COLORS = [{
  r: 255,
  g: 0,
  b: 0
}, {
  r: 255,
  g: 255,
  b: 0
}, {
  r: 255,
  g: 0,
  b: 255
}, {
  r: 0,
  g: 255,
  b: 0
}, {
  r: 0,
  g: 255,
  b: 255
}, {
  r: 0,
  g: 0,
  b: 255
}]

const create = (canvas, tree, colors) => {
  const position = {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height
  }

  const direction = 2 * Math.PI * Math.random()
  const speed = {
    x: 0,
    y: 0
  }

  const dot = Collision.dot(position)
  Tree.add(tree, dot)

  return {
    position,
    direction,
    speed,
    dot,
    alive: true,
    color: Util.pick(colors)
  }
}

const color = (player, alpha = 1) => Util.rgba(player.color.r, player.color.g, player.color.b, alpha)

const dieFromCollision = game => {
  game.players.forEach(player => {
    player.alive = player.alive && LA.distance(player.collision) <= MAX_COLLISION_POWER
  })

  game.players.filter(player => !player.alive && player.dot).forEach(player => {
    console.log('player died')
    Tree.remove(game.tree, player.dot)
    player.dot = null
  })

  // dead players slowly die from collision
  game.players.filter(player => !player.alive).forEach(player => {
    player.collision = LA.multiply(0.9, player.collision)
  })
}

const move = game => {
  // update collision tree
  game.players.filter(player => player.dot).forEach(player => {
    Tree.update(player.dot, Collision.dot(player.position))
  })

  // apply all the forces that arise from collision
  Collision.collide(game)

  if (DIE_FROM_COLLISION) {
    dieFromCollision(game)
  }

  game.players.forEach(player => {
    player.position.x += player.speed.x
    player.position.y += player.speed.y

    const breaking = player.alive && Input.isDown(Input.LEFT) && Input.isDown(Input.RIGHT)

    // the vehicle is aerodynamic, that means that the drag is much stronger when you go backwards
    const normProjection = (player.speed.x * player.speed.y) !== 0
      ? (Math.cos(player.direction) * player.speed.x + Math.sin(player.direction) * player.speed.y) /
        Math.sqrt(player.speed.x * player.speed.x + player.speed.y * player.speed.y) : 1

    // press left and right is a step on the break (increases drag dramatically)
    const dragFactor = STABILITY - normProjection + (breaking ? 5 : 0)

    player.speed.x *= (1.0 - dragFactor * DRAG)
    player.speed.y *= (1.0 - dragFactor * DRAG)

    // do not thrust when on break
    if (player.alive && !breaking) {
      player.speed.x += Math.cos(player.direction) * THRUST
      player.speed.y += Math.sin(player.direction) * THRUST
    }

    // and turn
    if (player.alive && Input.isDown(Input.LEFT)) {
      player.direction -= TURN
    }
    if (player.alive && Input.isDown(Input.RIGHT)) {
      player.direction += TURN
    }
  })
}

export default {
  create,
  move,
  color,
  MAX_COLLISION_POWER,
  COLORS
}
