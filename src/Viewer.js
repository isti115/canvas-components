import Component from './Components/Component.js'

const handleEvent = (type, e, root, [h, ...t]) => {
  let stopPropagation = false

  for (const listener of root.element.eventListeners.capture[type]) {
    stopPropagation = listener(e)
  }
  if (stopPropagation) { return true }

  if (h !== undefined) {
    stopPropagation = handleEvent(type, e, root.element.children[h], t)
  }
  if (stopPropagation) { return true }

  for (const listener of root.element.eventListeners.bubble[type]) {
    stopPropagation = listener(e)
  }
  if (stopPropagation) { return true }
}

const findTargets = (context, root, { x, y }) => {
  const hitRegions = root.collectHitRegions('root')

  const targets = hitRegions.filter(
    ({ path, id }) => context.isPointInPath(path, x, y)
  ).map(
    ({ path, id }) => id
  )

  return targets
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
    // this.addHitRegions()

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
    this.context.stroke(this.root.path)
  }

  addHitRegions () {
    const hitRegions = this.root.collectHitRegions('root')

    for (const hitRegion of hitRegions) {
      // this.context.stroke(hitRegion.path)
      this.context.addHitRegion(hitRegion)
    }
  }

  handleMouseEvent (e) {
    // if (e.region) {
    //   const [, ...t] = e.region.split('-').map(Number)
    //   handleEvent(e.type, e, this.root, t)
    // }

    const targets = findTargets(this.context, this.root, { x: e.clientX, y: e.clientY })
    const filteredTargets = targets.reduce(
      ([previousTarget, ...rest], currentTarget) => {
        if (currentTarget.startsWith(previousTarget)) {
          return [currentTarget, ...rest]
        } else {
          return [currentTarget, previousTarget, ...rest]
        }
      },
      ['']
    ).filter(t => t !== '')
    for (const target of filteredTargets) {
      const [, ...t] = target.split('-').map(Number)
      handleEvent(e.type, e, { element: this.root }, t)
    }
  }
}
