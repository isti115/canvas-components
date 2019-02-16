import Cache from '../Cache.js'
import CanvasCache from '../CanvasCache.js'
import * as utilities from '../utilities.js'

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

    this.canvasCache = new CanvasCache(0, 0)
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

  get selfDimensions () {
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  }

  get dimensions () {
    return {
      top: Math.min(...this.children.map(
        c => c.offset.top + c.component.dimensions.top
      ), this.selfDimensions.top),
      right: Math.max(...this.children.map(
        c => c.offset.left + c.component.dimensions.right
      ), this.selfDimensions.right),
      bottom: Math.max(...this.children.map(
        c => c.offset.top + c.component.dimensions.bottom
      ), this.selfDimensions.bottom),
      left: Math.min(...this.children.map(
        c => c.offset.left + c.component.dimensions.left
      ), this.selfDimensions.left)
    }
  }

  get _transformedChildrenPaths () {
    return this.children.map(
      ({ component, offset }) => utilities.offsetPath(offset, component.path)
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
    path.addPath(utilities.joinPaths(this.transformedChildrenPaths))

    return path
  }

  get path () {
    return this.cache.get(
      'path',
      () => this._path
    )
  }

  get _image () {
    this.canvasCache.setDimensions({
      width: this.dimensions.right - this.dimensions.left,
      height: this.dimensions.bottom - this.dimensions.top
    })

    this.canvasCache.strokePath(utilities.offsetPath(
      {
        left: -this.dimensions.left,
        top: -this.dimensions.top
      },
      this.selfPath
    ))

    this.children.forEach(child => {
      this.canvasCache.drawImage(child.component.image, child.offset)
    })

    return this.canvasCache.image
  }

  get image () {
    return this._image
    // this.cache.get(
    //   'image',
    //   () => this._image
    // )
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
