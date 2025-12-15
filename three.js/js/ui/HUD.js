export class HUD {
  constructor(root) {
    this.root = root
    this.ids = {
      stone: root.querySelector('#res-stone'),
      wood: root.querySelector('#res-wood'),
      food: root.querySelector('#res-food'),
      gold: root.querySelector('#res-gold'),
      workers: root.querySelector('#res-workers'),
      speed: root.querySelector('#game-speed')
    }
  }
  update(resources, speed) {
    this.ids.stone.textContent = resources.stone.toString()
    this.ids.wood.textContent = resources.wood.toString()
    this.ids.food.textContent = resources.food.toString()
    this.ids.gold.textContent = resources.gold.toString()
    this.ids.workers.textContent = resources.workers.toString()
    this.ids.speed.textContent = speed + 'x'
  }
}
