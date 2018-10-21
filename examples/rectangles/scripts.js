import CanvasComponents from '../../index.js'

const { Viewer, Components } = CanvasComponents
const { Rectangle } = Components

class DraggableRectangle extends Rectangle {
  constructor (offset, rect) {
    super(offset, rect)

    this.beingDragged = false
    this.draggedFrom = { x: 0, y: 0, clientX: 0, clientY: 0 }
    this.addEventListener('mousedown', e => {
      this.beingDragged = true
      this.draggedFrom = {
        x: this.rect.x,
        y: this.rect.y,
        clientX: e.clientX,
        clientY: e.clientY
      }
    })
    this.addEventListener('mousemove', e => {
      if (this.beingDragged) {
        this.rect.x = this.draggedFrom.x + (e.clientX - this.draggedFrom.clientX)
        this.rect.y = this.draggedFrom.y + (e.clientY - this.draggedFrom.clientY)

        return true
      }
    })
    this.addEventListener('mouseup', () => {
      this.beingDragged = false
    })
  }
}

const randBetween = (n, m) => n + Math.floor(m * Math.random())

const makeRandomRectangles = n => (
  [...Array(n)].map(
    x => {
      const left = randBetween(100, 1000)
      const top = randBetween(50, 700)
      const width = randBetween(50, 500)
      const height = randBetween(50, 500)

      return {
        element: new DraggableRectangle({ x: 0, y: 0, width, height }),
        offset: { left, top }
      }
    }
  )
)

const makeSmallRandomRectangles = n => (
  [...Array(n)].map(
    x => {
      const left = randBetween(10, 100)
      const top = randBetween(10, 100)
      const width = randBetween(50, 200)
      const height = randBetween(50, 200)

      return {
        element: new DraggableRectangle({ x: 0, y: 0, width, height }),
        offset: { left, top }
      }
    }
  )
)

// const oldInit = viewer => {
//   const rectangle = new DraggableRectangle(
//     { left: 100, top: 20 },
//     { x: 0, y: 0, width: 200, height: 300 }
//   )
//   viewer.root.addChild(rectangle)
//   rectangle.addEventListener('click', () => {
//     console.log('sajt')
//     rectangle.rect.width = 50 + Math.floor(Math.random() * 100)
//   })

//   const a = new DraggableRectangle(
//     { left: 0, top: 0 },
//     { x: 20, y: 40, width: 50, height: 50 }
//   )
//   viewer.root.addChild(a)

//   const b = new Rectangle(
//     { left: 70, top: 25 },
//     { x: 0, y: 0, width: 50, height: 50 }
//   )
//   rectangle.addChild(b)
// }

const init = () => {
  const viewer = new Viewer(1500, 850)

  viewer.init(window.document.body)

  const draggableRectangles = makeRandomRectangles(10)
  for (const draggableRectangle of draggableRectangles) {
    const children = makeSmallRandomRectangles(randBetween(0, 5))
    for (const child of children) {
      draggableRectangle.element.addChild(child)
    }
    viewer.root.addChild(draggableRectangle)
  }

  viewer.start()

  window.v = viewer
}

window.addEventListener('load', init, false)
