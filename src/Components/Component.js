import { joinPaths, offsetPath } from '../utilities.js'

const eventTypes = [
  'click',
  'mousedown',
  'mousemove',
  'heldmousemove',
  'mouseup'
]

const emptyEventListeners = eventTypes.reduce(
  (listeners, eventType) => ({ ...listeners, [eventType]: [] }),
  {}
)

export default class Component {
  constructor () {
    this.children = []

    this.eventListeners = {
      capture: { ...emptyEventListeners },
      bubble: { ...emptyEventListeners }
    }
  }

  addChild (child) {
    this.children = [...this.children, child]
  }

  removeChild (child) {
    this.children = this.children.filter(c => c !== child)
  }

  get transform () {
    return {
      a: 1,
      b: 0,
      c: 0,
      d: 1,
      e: this.offset.left,
      f: this.offset.top
    }
  }

  get selfPath () {
    return new window.Path2D()
  }

  get transformedChildrenPaths () {
    return this.children.map(
      ({ element, offset }) => offsetPath(offset, element.path)
    )
  }

  get path () {
    const path = new window.Path2D()

    path.addPath(this.selfPath)
    path.addPath(joinPaths(this.transformedChildrenPaths))

    return path
  }

  collectHitRegions (prefix) {
    const transformedChildrenHitRegions = this.children.map(
      (c, i) => c.element.collectHitRegions(`${prefix}-${i++}`).map(
        ({ path, id }) => ({
          path: offsetPath(c.offset, path),
          id
        })
      )
    )

    const transformedHitRegions = [
      { path: this.path, id: prefix }
    ].concat(
      ...transformedChildrenHitRegions
    )

    return transformedHitRegions
  }

  addEventListener (type, listener, useCapture = false) {
    const phase = useCapture ? 'capture' : 'bubble'

    this.eventListeners[phase][type] = [
      ...this.eventListeners[phase][type],
      listener
    ]
  }

  removeEventListener (type, listener, useCapture = false) {
    const phase = useCapture ? 'capture' : 'bubble'

    this.eventListeners[phase][type] = (
      this.eventListeners[phase][type].filter(l => l !== listener)
    )
  }
}
