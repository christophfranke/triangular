const rgba = (r, g, b, a = 1) => `rgba(${r}, ${g}, ${b}, ${a})`
const pick = array => array[Math.floor(Math.random() * array.length)]

export default {
  rgba,
  pick
}
