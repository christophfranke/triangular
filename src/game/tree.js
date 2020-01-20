
const create = () => {
  return {
    nodes: []
  }
}

const add = (tree, node) => {
  tree.nodes.push(node)
}

const move = (tree, node) => {

}

const nodes = (tree, position) => tree.nodes

export default {
  create,
  add,
  move,
  nodes
}
