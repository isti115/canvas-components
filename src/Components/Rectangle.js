import Component from './Component.js'

export default class Rectangle extends Component {
  constructor ({ x, y, width, height }) {
    super()

    this.rect = { x, y, width, height }
  }

  get selfPath () {
    const path = new window.Path2D()

    path.rect(this.rect.x, this.rect.y, this.rect.width, this.rect.height)

    return path
  }
}
