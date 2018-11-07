import Component from './Component.js'

export default class Circle extends Component {
  constructor ({ radius }) {
    super()

    this.circle = { radius }
  }

  get selfPath () {
    const path = new window.Path2D()

    path.arc(0, 0, this.circle.radius, 0, 2 * Math.PI)

    return path
  }
}
