import LA from './la'
import Player from './player'
import Util from './util'
import Stage from './stage'

const SIGHT_RANGE = 200
const DIRECTION_RANGE = 1000
const CAMERA_MARGIN = 50
const CAMERA_SMOOTHING = 0.98

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
    camera: null
  }
}

const onScreen = (game, point) => point.x >= 0 && point.x <= game.renderer.canvas.width && point.y >= 0 && point.y <= game.renderer.canvas.height

const drawPlayers = game => {
  game.players.forEach(player => {
    const ctx = game.renderer.ctx
    const position = player.position
    const collisionIntensity = player.collision.intensity

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

    if (player.input.positions) {
      ctx.beginPath()
      const start = game.camera(player.position)
      ctx.moveTo(start.x, start.y)
      player.input.positions.forEach(position => {
        const point = game.camera(position)
        ctx.lineTo(point.x, point.y)
      })
      ctx.closePath()
      ctx.stroke()
    }
  })
}

const ORIENTATION_LINES = 3
const ORIENTATION_ALPHA_EMPTY = 0.15
const ORIENTATION_ALPHA_OWNED = 0.35
const drawStages = game => {
  const ctx = game.renderer.ctx
  game.stages.forEach(stage => {
    const lines = [stage.leftLine, stage.rightLine].concat(stage.extraLines || [])
    lines.map(({ point1, point2 }) => ({
      point1: game.camera(point1),
      point2: game.camera(point2)
    })).filter(({ point1, point2 }) => onScreen(game, point1) || onScreen(game, point2)).forEach(({ point1, point2 }) => {
      ctx.beginPath()

      ctx.strokeStyle = stage.owner ? Player.color(stage.owner) : Util.rgba(255, 255, 255, 1)
      ctx.moveTo(point1.x, point1.y)
      ctx.lineTo(point2.x, point2.y)

      ctx.closePath()
      ctx.stroke()
    })

    Array(ORIENTATION_LINES).fill(null).forEach((x, i) => {
      const factor = (1.0 + i) / (ORIENTATION_LINES + 1.0)
      const point1 = game.camera(LA.lerp(stage.leftLine.point1, stage.rightLine.point1, factor))
      const point2 = game.camera(LA.lerp(stage.leftLine.point2, stage.rightLine.point2, factor))

      if (onScreen(game, point1) || onScreen(game, point2)) {
        ctx.beginPath()

        ctx.strokeStyle = stage.owner ? Player.color(stage.owner, ORIENTATION_ALPHA_OWNED) : Util.rgba(255, 255, 255, ORIENTATION_ALPHA_EMPTY)
        ctx.moveTo(point1.x, point1.y)
        ctx.lineTo(point2.x, point2.y)

        ctx.closePath()
        ctx.stroke()
      }
    })
  })
}

const adjustCamera = game => {
  if (!game.renderer.camera) {
    game.renderer.camera = {
      min: Stage.allLines(game).reduce((min, line) => ({
        x: Math.min(min.x, line.point1.x, line.point2.x),
        y: Math.min(min.y, line.point1.y, line.point2.y)
      }), { x: null, y: null }),
      max: Stage.allLines(game).reduce((min, line) => ({
        x: Math.max(min.x, line.point1.x, line.point2.x),
        y: Math.max(min.y, line.point1.y, line.point2.y)
      }), { x: null, y: null })
    }
    const { width, height } = game.renderer.canvas
    const aspect = width / height
    game.renderer.camera.factor = Math.max(game.renderer.camera.max.x - game.renderer.camera.min.x, aspect * (game.renderer.camera.max.y - game.renderer.camera.min.y))
  }
  if (game.players.filter(player => player.alive).length > 0) {
    const { width, height } = game.renderer.canvas
    const aspect = width / height

    const min = LA.subtract(game.players
      .filter(player => player.alive)
      .map(player => LA.min(
        player.position,
        LA.madd(player.position, SIGHT_RANGE, player.speed),
        LA.madd(player.position, DIRECTION_RANGE, LA.rotate(player.direction))))
      .reduce((min, pos) => LA.min(pos, min)), LA.v(CAMERA_MARGIN))

    const max = LA.add(game.players
      .filter(player => player.alive)
      .map(player => LA.max(
        player.position,
        LA.madd(player.position, SIGHT_RANGE, player.speed),
        LA.madd(player.position, DIRECTION_RANGE, LA.rotate(player.direction))))
      .reduce((max, pos) => LA.max(pos, max)), LA.v(CAMERA_MARGIN))

    const factor = Math.max(max.x - min.x, aspect * (max.y - min.y))

    game.renderer.camera = {
      min: LA.lerp(game.renderer.camera.min, min, CAMERA_SMOOTHING),
      max: LA.lerp(game.renderer.camera.max, max, CAMERA_SMOOTHING),
      factor: (1.0 - CAMERA_SMOOTHING) * factor + CAMERA_SMOOTHING * game.renderer.camera.factor
    }

    const translate = pos => LA.subtract(pos, game.renderer.camera.min)
    const scale = pos => LA.multiply(width / game.renderer.camera.factor, pos)

    const margin = LA.subtract(scale(translate(game.renderer.camera.max)), LA.w(width, height))
    game.camera = pos => LA.madd(scale(translate(pos)), -0.5, margin)
  }
}

const draw = game => {
  const canvas = game.renderer.canvas
  const ctx = game.renderer.ctx

  ctx.fillStyle = Util.rgba(0, 0, 0)
  rect(ctx, 0, 0, canvas.width, canvas.height)

  adjustCamera(game)
  drawStages(game)
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
