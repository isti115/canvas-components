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
    this.cached = this.cached.bind(this)
    this.addChild = this.addChild.bind(this)
    this.removeChild = this.removeChild.bind(this)
    // this.selfPath = this.selfPath.bind(this)
    // this.selfDimensions = this.selfDimensions.bind(this)
    // this._dimensions = this._dimensions.bind(this)
    // this.dimensions = this.dimensions.bind(this)
    // this._transformedChildrenPaths = this._transformedChildrenPaths.bind(this)
    // this.transformedChildrenPaths = this.transformedChildrenPaths.bind(this)
    // this._path = this._path.bind(this)
    // this.path = this.path.bind(this)
    // this._image = this._image.bind(this)
    // this.image = this.image.bind(this)
    this.clearCache = this.clearCache.bind(this)
    this.getChildrenWithPointInPath = this.getChildrenWithPointInPath.bind(this)
    this.addEventListener = this.addEventListener.bind(this)
    this.removeEventListener = this.removeEventListener.bind(this)

    this.children = []

    this.eventListeners = {
      capture: { ...emptyEventListeners },
      bubble: { ...emptyEventListeners }
    }

    this.canvasCache = new CanvasCache(0, 0)
    this.cache = new Cache()
  }

  cached (property) {
    return this.cache.get(property, () => this[`_${property}`])
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

  get _dimensions () {
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

  get dimensions () { return this.cached('dimensions') }

  get _transformedChildrenPaths () {
    return this.children.map(
      ({ component, offset }) => utilities.offsetPath(offset, component.path)
    )
  }

  get transformedChildrenPaths () { return this.cached('transformedChildrenPaths') }

  get _path () {
    const path = new window.Path2D()

    path.addPath(this.selfPath)
    path.addPath(utilities.joinPaths(this.transformedChildrenPaths))

    return path
  }

  get path () { return this.cached('path') }

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
      this.canvasCache.drawImage(
        child.component.image,
        {
          left: child.offset.left - this.dimensions.left + child.component.dimensions.left,
          top: child.offset.top - this.dimensions.top + child.component.dimensions.top
        }
      )
    })

    return this.canvasCache.image
  }

  get image () {
    return this.cached('image')
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
