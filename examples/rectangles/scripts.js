import CanvasComponents from '../../index.js'

const randBetween = (n, m) => n + Math.floor(m * Math.random())

const makeRandomRectangles = n => (
  [...Array(n)].map(
    x => {
      const left = randBetween(100, 1000)
      const top = randBetween(50, 700)
      const width = randBetween(200, 500)
      const height = randBetween(200, 500)

      return new CanvasComponents.Components.Draggable({
        component: new CanvasComponents.Components.Rectangle({ width, height }),
        componentOffset: { left, top }
      })
    }
  )
)

const makeRandomCircles = n => (
  [...Array(n)].map(
    x => {
      const left = randBetween(50, 450)
      const top = randBetween(50, 450)
      const radius = randBetween(10, 50)

      return new CanvasComponents.Components.Draggable({
        component: new CanvasComponents.Components.Circle({ radius }),
        componentOffset: { left, top }
      })
    }
  )
)

const init = () => {
  const width = window.document.body.clientWidth
  const height = window.document.body.clientHeight
  // const width = 1920
  // const height = 1080
  const viewer = new CanvasComponents.Viewer(width, height)

  viewer.init(window.document.body)

  const draggableRectangles = makeRandomRectangles(1)
  for (const draggableRectangle of draggableRectangles) {
    const draggableCircles = makeRandomCircles(randBetween(0, 0))
    for (const draggableCircle of draggableCircles) {
      draggableRectangle.component.addChild({
        component: draggableCircle,
        offset: { left: 0, top: 0 }
      })
    }
    viewer.root.addChild({
      component: draggableRectangle,
      offset: { left: 0, top: 0 }
    })
  }

  window.v = viewer

  viewer.start()
}

window.addEventListener('load', init, false)
