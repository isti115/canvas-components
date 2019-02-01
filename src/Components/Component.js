import Cache from '../Cache.js'
import { joinPaths, offsetPath } from '../utilities.js'

const eventTypes = [
  'click',
  'mousedown',
  'mousemove',
  'heldmousemove',
  'mouseup',
  //
  'cacheclear'
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

    this.cache = new Cache()
  }

  addChild (child) {
    this.children = [...this.children, child]
    child.component.addEventListener('cacheclear', () => {
      this.clearCache()
    })
  }

  removeChild (child) {
    this.children = this.children.filter(c => c !== child)
  }

  get selfPath () {
    return new window.Path2D()
  }

  get _transformedChildrenPaths () {
    return this.children.map(
      ({ component, offset }) => offsetPath(offset, component.path)
    )
  }

  get transformedChildrenPaths () {
    return this.cache.get(
      'transformedChildrenPaths',
      () => this._transformedChildrenPaths
    )
  }

  get _path () {
    const path = new window.Path2D()

    path.addPath(this.selfPath)
    path.addPath(joinPaths(this.transformedChildrenPaths))

    return path
  }

  get path () {
    return this.cache.get(
      'path',
      () => this._path
    )
  }

  draw (context) {
    context.stroke(this.selfPath)
    this.children.forEach(c => {
      context.transform(1, 0, 0, 1, c.offset.left, c.offset.top)
      c.component.draw(context)
      context.transform(1, 0, 0, 1, -c.offset.left, -c.offset.top)
    })
  }

  clearCache () {
    this.cache.clearAll()
    this.eventListeners.bubble['cacheclear'].map(
      e => e()
    )
  }

  getChildrenWithPointInPath (test, point) {
    const filteredChildren = this.children.filter(c =>
      test(
        c.component.path,
        {
          x: point.x - c.offset.left,
          y: point.y - c.offset.top
        }
      )
    )

    const childrenWithPointInPath = filteredChildren.map(
      c => c.component.getChildrenWithPointInPath(
        test,
        {
          x: point.x - c.offset.left,
          y: point.y - c.offset.top
        }
      )
    )

    return {
      component: this,
      childrenWithPointInPath
    }
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
