const rgba = (r, g, b, a = 1) => `rgba(${r}, ${g}, ${b}, ${a})`
const RED = rgba(255, 0, 0)

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
    ctx
  }
}

const drawPlayers = game => {
  game.players.forEach(player => {
    const ctx = game.renderer.ctx
    const position = player.position

    ctx.beginPath()

    ctx.strokeStyle = RED
    const alpha = 1.4 // triangle angle
    const beta = 0.5 // triangle front offset
    const delta = 25 // triangle size
    ctx.moveTo(position.x + Math.cos(player.direction) * beta * delta, position.y + Math.sin(player.direction) * beta * delta)
    ctx.lineTo(position.x + Math.cos(player.direction + alpha * Math.PI) * delta, position.y + Math.sin(player.direction + alpha * Math.PI) * delta)
    ctx.lineTo(position.x + Math.cos(player.direction - alpha * Math.PI) * delta, position.y + Math.sin(player.direction - alpha * Math.PI) * delta)
    ctx.lineTo(position.x + Math.cos(player.direction) * beta * delta, position.y + Math.sin(player.direction) * beta * delta)

    ctx.stroke()
  })
}

const draw = game => {
  const canvas = game.renderer.canvas
  const ctx = game.renderer.ctx

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = rgba(0, 0, 0)
  rect(ctx, 0, 0, canvas.width, canvas.height)

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
