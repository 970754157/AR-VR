export class ResourceStore {
  constructor(config) {
    this.stone = config.stone || 0
    this.wood = config.wood || 0
    this.food = config.food || 0
    this.gold = config.gold || 0
    this.workers = config.workers || 0
  }
  has(cost) {
    return (!cost.stone || this.stone >= cost.stone) &&
      (!cost.wood || this.wood >= cost.wood) &&
      (!cost.food || this.food >= cost.food) &&
      (!cost.gold || this.gold >= cost.gold)
  }
  consume(cost) {
    if (!this.has(cost)) return false
    this.stone -= cost.stone || 0
    this.wood -= cost.wood || 0
    this.food -= cost.food || 0
    this.gold -= cost.gold || 0
    return true
  }
  add(delta) {
    this.stone += delta.stone || 0
    this.wood += delta.wood || 0
    this.food += delta.food || 0
    this.gold += delta.gold || 0
    this.workers += delta.workers || 0
  }
}
