import Component from './Components/Component.js'

const handleEvent = (type, e, root) => {
  const captureStopPropagation = root.component.eventListeners.capture[type].map(
    listener => listener(e)
  )
  if (captureStopPropagation.some(x => x)) { return true }

  const childrenStopPropagation = root.childrenWithPointInPath.map(
    child => handleEvent(type, e, child)
  )
  if (childrenStopPropagation.some(x => x)) { return true }

  const bubbleStopPropagation = root.component.eventListeners.bubble[type].map(
    listener => listener(e)
  )
  if (bubbleStopPropagation.some(x => x)) { return true }
}

export default class Viewer {
  constructor (width, height) {
    this.width = width
    this.height = height

    this.canvas = window.document.createElement('canvas')
    this.canvas.width = this.width
    this.canvas.height = this.height

    this.context = this.canvas.getContext('2d', { alpha: false })

    this.root = new Component()
    this.heldComponents = undefined

    this.active = false
    this.zoom = 1

    this.handleMouseEvent = this.handleMouseEvent.bind(this)
    this.canvas.addEventListener('click', this.handleMouseEvent)
    this.canvas.addEventListener('mousedown', this.handleMouseEvent)
    this.canvas.addEventListener('mousemove', this.handleMouseEvent)
    this.canvas.addEventListener('mouseup', this.handleMouseEvent)

    // this.canvas.addEventListener('wheel', e => {
    //   const direction = e.deltaY < 0 ? -1 : 1
    //   this.zoom += direction * 0.5

    //   this.context.setTransform(this.zoom, 0, 0, this.zoom, 0, 0)
    // })
  }

  init (container) {
    this.container = container
    this.container.appendChild(this.canvas)
  }

  loop () {
    this.draw()

    if (this.active) {
      window.requestAnimationFrame(() => this.loop())
    }
  }

  start () {
    this.active = true
    this.loop()
  }

  stop () {
    this.active = false
  }

  draw () {
    this.context.fillStyle = '#ffffff'
    this.context.fillRect(0, 0, this.width / this.zoom, this.height / this.zoom)
    // this.context.clearRect(0, 0, this.width / this.zoom, this.height / this.zoom)
    this.context.beginPath()
    const path = this.root.path
    this.context.stroke(path)
  }

  addHitRegions () {
    const hitRegions = this.root.collectHitRegions('root')

    for (const hitRegion of hitRegions) {
      // this.context.stroke(hitRegion.path)
      this.context.addHitRegion(hitRegion)
    }
  }

  handleMouseEvent (e) {
    const childrenWithPointInPath = this.root.getChildrenWithPointInPath(
      (path, point) => this.context.isPointInPath(path, point.x, point.y),
      { x: e.clientX, y: e.clientY }
    )

    handleEvent(e.type, e, childrenWithPointInPath)

    if (e.type === 'mousedown') {
      this.heldComponents = childrenWithPointInPath
    }

    if (e.type === 'mousemove' && this.heldComponents !== undefined) {
      handleEvent('heldmousemove', e, this.heldComponents)
    }

    if (e.type === 'mouseup') {
      this.heldComponents = undefined
    }
  }
}
