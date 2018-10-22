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

    this.cache = {
      data: {},
      get: (id, compute) => {
        if (this.cache.data[id] === undefined) {
          this.cache.data[id] = compute()
        }

        return this.cache.data[id]

        // return compute()
      },
      clear: (id) => {
        delete this.cache.data[id]
      },
      clearAll: (id) => {
        this.cache.data = {}
      }
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

  get path () {
    const path = new window.Path2D()

    path.addPath(this.selfPath)
    path.addPath(joinPaths(this.transformedChildrenPaths))

    return path
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

  _collectHitRegions (prefix) {
    const transformedChildrenHitRegions = this.children.map(
      (c, i) => c.component.collectHitRegions(`${prefix}-${i++}`).map(
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

  collectHitRegions (prefix) {
    return this.cache.get(
      'collectHitRegions',
      () => this._collectHitRegions(prefix)
    )
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
