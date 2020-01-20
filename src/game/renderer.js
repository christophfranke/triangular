import LA from './la'
import Player from './player'
import Util from './util'

const rect = (ctx, x, y, width, height, color = null) => {
  if (color) {
    ctx.fillStyle = color
  }

  ctx.fillRect(x, y, width, height)
}

const create = canvas => {
  canvas.width = document.body.clientWidth
  canvas.height = document.body.clientHeight
  const ctx = canvas.getContext('2d')

  return {
    canvas,
    ctx,
    camera: {
      min: LA.v(0, 0),
      max: LA.w(canvas.width, canvas.height),
      factor: Math.max(canvas.width, canvas.height)
    }
  }
}

const drawPlayers = game => {
  game.players.forEach(player => {
    const ctx = game.renderer.ctx
    const position = player.position
    const collisionIntensity = LA.distance(player.collision)

    ctx.beginPath()

    ctx.strokeStyle = Player.color(player)
    ctx.fillStyle = Player.color(player, Math.min(1, collisionIntensity / Player.MAX_COLLISION_POWER))
    const alpha = 1.4 // triangle angle
    const beta = 0.5 // triangle front offset
    const delta = 25 // triangle size
    const point1 = game.camera(LA.vector(position.x + Math.cos(player.direction) * beta * delta, position.y + Math.sin(player.direction) * beta * delta))
    const point2 = game.camera(LA.vector(position.x + Math.cos(player.direction + alpha * Math.PI) * delta, position.y + Math.sin(player.direction + alpha * Math.PI) * delta))
    const point3 = game.camera(LA.vector(position.x + Math.cos(player.direction - alpha * Math.PI) * delta, position.y + Math.sin(player.direction - alpha * Math.PI) * delta))
    const point4 = game.camera(LA.vector(position.x + Math.cos(player.direction) * beta * delta, position.y + Math.sin(player.direction) * beta * delta))
    ctx.moveTo(point1.x, point1.y)
    ctx.lineTo(point2.x, point2.y)
    ctx.lineTo(point3.x, point3.y)
    ctx.lineTo(point4.x, point4.y)
    ctx.closePath()

    if (player.alive) {
      ctx.stroke()
    }
    ctx.fill()
  })
}

const drawLines = game => {
  const ctx = game.renderer.ctx
  const lines = game.levels.reduce((all, level) => all.concat(level.lines), [])
  lines.forEach(line => {
    const point1 = game.camera(line.point1)
    const point2 = game.camera(line.point2)

    ctx.beginPath()

    ctx.strokeStyle = Util.rgba(255, 255, 255, 1)
    ctx.moveTo(point1.x, point1.y)
    ctx.lineTo(point2.x, point2.y)

    ctx.closePath()
    ctx.stroke()
  })
}

const SIGHT_RANGE = 100
const CAMERA_MARGIN = 150
const CAMERA_SMOOTHING = 0.9
const adjustCamera = game => {
  if (game.players.filter(player => player.alive).length > 0) {
    const { width, height } = game.renderer.canvas
    const aspect = width / height

    const min = LA.subtract(game.players
      .filter(player => player.alive)
      .map(player => LA.min(player.position, LA.madd(player.position, SIGHT_RANGE, player.speed)))
      .reduce((min, pos) => LA.min(pos, min)), LA.v(CAMERA_MARGIN))

    const max = LA.add(game.players
      .filter(player => player.alive)
      .map(player => LA.max(player.position, LA.madd(player.position, SIGHT_RANGE, player.speed)))
      .reduce((max, pos) => LA.max(pos, max)), LA.v(CAMERA_MARGIN))

    const factor = Math.max(max.x - min.x, aspect * (max.y - min.y))

    game.renderer.camera = {
      min: LA.lerp(game.renderer.camera.min, min, CAMERA_SMOOTHING),
      max: LA.lerp(game.renderer.camera.max, max, CAMERA_SMOOTHING),
      factor: CAMERA_SMOOTHING * game.renderer.camera.factor + (1.0 - CAMERA_SMOOTHING) * factor
    }

    const translate = pos => LA.subtract(pos, game.renderer.camera.min)
    const scale = pos => LA.multiply(width / game.renderer.camera.factor, pos)

    const margin = LA.subtract(scale(translate(max)), LA.w(width, height))
    game.camera = pos => LA.madd(scale(translate(pos)), -0.5, margin)
  }
}

const draw = game => {
  const canvas = game.renderer.canvas
  const ctx = game.renderer.ctx

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = Util.rgba(0, 0, 0)
  rect(ctx, 0, 0, canvas.width, canvas.height)

  adjustCamera(game)
  drawLines(game)
  drawPlayers(game)
}

const clear = game => {
  const canvas = game.renderer.canvas
  const ctx = game.renderer.ctx

  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

export default {
  create,
  draw,
  clear
}
