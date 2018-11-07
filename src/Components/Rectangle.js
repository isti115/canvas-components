import Component from './Component.js'

export default class Rectangle extends Component {
  constructor ({ x, y, width, height }) {
    super()

    this.properties = { x, y, width, height }
  }

  get selfPath () {
    const path = new window.Path2D()

    path.rect(0, 0, this.properties.width, this.properties.height)

    return path
  }
}
