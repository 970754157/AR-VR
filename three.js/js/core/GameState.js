import { ResourceStore } from './Resource.js'
export class GameState {
  constructor(config) {
    this.resources = new ResourceStore(config.initialResources || {})
    this.speed = 1
    this.tasks = []
    this.workers = []
    this.structures = []
    this.time = 0
    this.pendingBuild = false
    this.pendingType = 'palace'
    const ib = (config.idleBehavior || {})
    this.idleWeights = {
      rest: ib.rest ?? 0.33,
      cheer: ib.cheer ?? 0.33,
      wander: ib.wander ?? 0.34
    }
    this.personalityVariance = config.personalityVariance ?? 0.2
  }
  setSpeed(s) { this.speed = s }
  tick(dt) { this.time += dt * this.speed }
  addWorker(worker) { this.workers.push(worker); this.resources.add({ workers: 1 }) }
  addTask(task) { this.tasks.push(task) }
  addStructure(s) { this.structures.push(s) }
  setIdleWeights(weights) {
    const total = (weights.rest || 0) + (weights.cheer || 0) + (weights.wander || 0)
    if (total <= 0) return
    this.idleWeights = {
      rest: (weights.rest || 0) / total,
      cheer: (weights.cheer || 0) / total,
      wander: (weights.wander || 0) / total
    }
  }
}
