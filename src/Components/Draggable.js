import Component from './Component.js'

export default class Draggable extends Component {
  constructor ({
    component,
    componentOffset: { left, top }
  }) {
    super()

    this.component = component
    this.componentOffset = { left, top }

    this.component.addEventListener('mousedown', e => {
      this.draggedFrom = {
        left: this.componentOffset.left,
        top: this.componentOffset.top,
        clientX: e.clientX,
        clientY: e.clientY
      }

      return true
    })

    this.component.addEventListener('heldmousemove', e => {
      this.componentOffset.left = this.draggedFrom.left + (e.clientX - this.draggedFrom.clientX)
      this.componentOffset.top = this.draggedFrom.top + (e.clientY - this.draggedFrom.clientY)

      this.clearCache()

      return true
    })

    this.addChild({ component: this.component, offset: this.componentOffset })
  }

  get selfDimensions () {
    return {
      top: this.componentOffset.top,
      right: this.componentOffset.left,
      bottom: this.componentOffset.top,
      left: this.componentOffset.left
    }
  }
}
