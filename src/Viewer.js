import Component from './Components/Component.js'

const collectHitRegions = (root, prefix) => {
  const childrenHitRegions = root.children.map(
    (c, i) => collectHitRegions(c, `${prefix}-${i++}`)
  )

  const transformedChildrenHitRegions = (
    [].concat(...childrenHitRegions).map(
      ({ path, id }) => {
        const p = new window.Path2D()
        p.addPath(path, root.transform)
        return ({ path: p, id })
      }
    )
  )

  const transformedHitRegions = [
    { path: root.path, id: prefix }
  ].concat(
    ...transformedChildrenHitRegions
  )

  return transformedHitRegions
}

const handleEvent = (type, e, root, [h, ...t]) => {
  let stopPropagation = false

  for (const listener of root.eventListeners.capture[type]) {
    stopPropagation = listener(e)
  }
  if (stopPropagation) { return true }

  if (h !== undefined) {
    stopPropagation = handleEvent(type, e, root.children[h], t)
  }
  if (stopPropagation) { return true }

  for (const listener of root.eventListeners.bubble[type]) {
    stopPropagation = listener(e)
  }
  if (stopPropagation) { return true }
}

export default class Viewer {
  constructor (width, height) {
    this.width = width
    this.height = height

    this.canvas = window.document.createElement('canvas')
    this.canvas.width = this.width
    this.canvas.height = this.height

    this.context = this.canvas.getContext('2d', { alpha: false })

    this.root = new Component({ left: 0, top: 0 })

    this.active = false
    this.zoom = 1

    this.handleClick = this.handleClick.bind(this)
    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleMouseUp = this.handleMouseUp.bind(this)
    this.canvas.addEventListener('click', this.handleClick)
    this.canvas.addEventListener('mousedown', this.handleMouseDown)
    this.canvas.addEventListener('mousemove', this.handleMouseMove)
    this.canvas.addEventListener('mouseup', this.handleMouseUp)

    this.canvas.addEventListener('wheel', e => {
      const direction = e.deltaY < 0 ? -1 : 1
      this.zoom += direction * 0.5

      this.context.setTransform(this.zoom, 0, 0, this.zoom, 0, 0)
    })
  }

  init (container) {
    this.container = container
    this.container.appendChild(this.canvas)
  }

  loop () {
    this.draw()
    this.addHitRegions()

    if (this.active) {
      window.requestAnimationFrame(() => this.loop())
    }
  }

  start () {
    this.active = true
    this.addHitRegions()
    this.loop()
  }

  stop () {
    this.active = false
  }

  draw () {
    this.context.fillStyle = '#ffffff'
    this.context.fillRect(0, 0, this.width / this.zoom, this.height / this.zoom)
    // this.context.clearRect(0, 0, this.width / this.zoom, this.height / this.zoom)
    this.context.stroke(this.root.path)
  }

  addHitRegions () {
    const hitRegions = collectHitRegions(this.root, 'root')

    for (const hitRegion of hitRegions) {
      this.context.stroke(hitRegion.path)
      this.context.addHitRegion(hitRegion)
    }
  }

  handleClick (e) {
    if (e.region) {
      const [, ...t] = e.region.split('-').map(Number)
      handleEvent('click', e, this.root, t)
    }
  }

  handleMouseDown (e) {
    if (e.region) {
      const [, ...t] = e.region.split('-').map(Number)
      handleEvent('mousedown', e, this.root, t)
    }
  }

  handleMouseMove (e) {
    if (e.region) {
      const [, ...t] = e.region.split('-').map(Number)
      handleEvent('mousemove', e, this.root, t)
    }
  }

  handleMouseUp (e) {
    if (e.region) {
      const [, ...t] = e.region.split('-').map(Number)
      handleEvent('mouseup', e, this.root, t)
    }
  }
}
