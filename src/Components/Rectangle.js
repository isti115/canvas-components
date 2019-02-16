import Component from './Component.js'

export default class Rectangle extends Component {
  constructor ({ x, y, width, height }) {
    super()

    this.rectangle = { width, height }
  }

  get selfPath () {
    const path = new window.Path2D()

    path.rect(0, 0, this.rectangle.width, this.rectangle.height)

    return path
  }

  get selfDimensions () {
    return {
      top: 0,
      right: this.rectangle.width,
      bottom: this.rectangle.height,
      left: 0
    }
  }
}
