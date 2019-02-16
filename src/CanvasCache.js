export default class CanvasCache {
  constructor (width, height) {
    this.width = width
    this.height = height

    this.init = this.init.bind(this)
    this.setDimensions = this.setDimensions.bind(this)
    this.clear = this.clear.bind(this)
    this.strokePath = this.strokePath.bind(this)
    this.drawImage = this.drawImage.bind(this)

    this.init()
  }

  init () {
    this.canvas = window.document.createElement('canvas')
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.context = this.canvas.getContext('2d')
  }

  setDimensions ({ width, height }) {
    this.canvas.width = width
    this.canvas.height = height
  }

  clear () {
    this.context.clearRect(0, 0, this.width, this.height)
  }

  strokePath (path) {
    this.context.stroke(path)
  }

  drawImage (image, { left, top }) {
    this.context.drawImage(image, left, top)
  }

  get image () {
    return this.canvas
  }
}
