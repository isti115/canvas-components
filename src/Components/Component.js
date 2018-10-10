import { joinPaths } from '../utilities.js'

const eventTypes = ['click', 'mousedown', 'mousemove', 'mouseup']

const emptyEventListeners = eventTypes.reduce(
  (listeners, eventType) => ({ ...listeners, [eventType]: [] }),
  {}
)

export default class Component {
  constructor (offset) {
    this.children = []

    this.offset = offset

    this.eventListeners = {
      capture: { ...emptyEventListeners },
      bubble: { ...emptyEventListeners }
    }

    // this._path = undefined
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

  get childrenPath () {
    return joinPaths(this.children.map(c => c.path))
  }

  get path () {
    // if (this._path) {
    //   return this._path
    // }

    const path = new window.Path2D()

    // path.moveTo(this.offset.left, this.offset.top)
    path.addPath(this.selfPath, this.transform)
    path.addPath(this.childrenPath, this.transform)

    // this._path = path
    return path
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
