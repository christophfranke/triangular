import Input from './input'
import Collision from './collision'
import Tree from './tree'

const THRUST = 0.1
const TURN = 0.0175 * 2 * Math.PI
const DRAG = 0.01
const STABILITY = 0.9

const create = (canvas, tree) => {
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
    dot
  }
}

const move = game => {
  // update collision tree
  game.players.forEach(player => {
    Tree.update(player.dot, Collision.dot(player.position))
  })

  // apply all the forces that arise from collision
  Collision.collide(game)

  game.players.forEach(player => {
    player.position.x += player.speed.x
    player.position.y += player.speed.y

    // the vehicle is aerodynamic, that means that the drag is much stronger when you go backwards
    const normProjection = (player.speed.x * player.speed.y) !== 0
      ? (Math.cos(player.direction) * player.speed.x + Math.sin(player.direction) * player.speed.y) /
        Math.sqrt(player.speed.x * player.speed.x + player.speed.y * player.speed.y) : 1

    // press left and right is a step on the break (increases drag dramatically)
    const dragFactor = STABILITY - normProjection + (Input.isDown(Input.LEFT) && Input.isDown(Input.RIGHT) ? 5 : 0)

    player.speed.x *= (1.0 - dragFactor * DRAG)
    player.speed.y *= (1.0 - dragFactor * DRAG)

    // do not thrust when on break
    if (!(Input.isDown(Input.LEFT) && Input.isDown(Input.RIGHT))) {
      player.speed.x += Math.cos(player.direction) * THRUST
      player.speed.y += Math.sin(player.direction) * THRUST
    }

    // and turn
    if (Input.isDown(Input.LEFT)) {
      player.direction -= TURN
    }
    if (Input.isDown(Input.RIGHT)) {
      player.direction += TURN
    }
  })
}

export default {
  create,
  move
}
