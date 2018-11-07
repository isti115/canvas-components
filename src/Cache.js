export default class Cache {
  constructor () {
    this.data = {}

    this.get = this.get.bind(this)
    this.clear = this.clear.bind(this)
    this.clearAll = this.clearAll.bind(this)
  }

  get (id, compute) {
    if (this.data[id] === undefined) {
      this.data[id] = compute()
    }

    return this.data[id]
  }

  clear (id) {
    delete this.data[id]
  }

  clearAll (id) {
    this.data = {}
  }
}
