import { ResourceStore } from './Resource.js'
export class GameState {
  constructor(config) {
    this.resources = new ResourceStore(config.initialResources || {})
    this.speed = 1
    this.tasks = []
    this.workers = []
    this.structures = []
    this.animals = [] // 存储所有动物
    this.time = 0
    this.pendingBuild = false
    this.pendingType = 'castle'
    this.pendingDemolish = false
    this.pendingPlant = false
    this.pendingCropType = 'carrot'
    this.pendingSpawnAnimal = false
    this.pendingAnimalType = 'sheep'
    const ib = (config.idleBehavior || {})
    this.idleWeights = {
      rest: ib.rest ?? 0.33,
      cheer: ib.cheer ?? 0.33,
      wander: ib.wander ?? 0.34
    }
    this.personalityVariance = config.personalityVariance ?? 0.2
    // 玩家等级系统
    this.playerLevel = config.playerLevel ?? 1
    this.playerExp = config.playerExp ?? 0
    // 玩家名字
    this.playerName = config.playerName ?? '未命名'
    // 解锁顺序：每级解锁一种建筑、一种动物、一种植物
    // 1级：farm, carrot, sheep
    // 2级：school, watermelon, pig
    // 3级：library, grape, ...
    // 城堡放在最后，需要最高等级解锁
    this.buildingUnlockOrder = ['farm', 'school', 'library', 'wall', 'road', 'river', 'castle']
    this.cropUnlockOrder = ['carrot', 'watermelon', 'grape']
    this.animalUnlockOrder = ['sheep', 'pig', 'cow']
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
  // 检查建筑是否已解锁
  isBuildingUnlocked(buildingType) {
    const index = this.buildingUnlockOrder.indexOf(buildingType)
    if (index === -1) return true // 未知建筑类型，默认解锁
    return this.playerLevel > index // 等级需要大于索引（1级解锁索引0，即农田）
  }
  // 检查农作物是否已解锁
  isCropUnlocked(cropType) {
    const index = this.cropUnlockOrder.indexOf(cropType)
    if (index === -1) return true // 未知农作物类型，默认解锁
    return this.playerLevel > index
  }
  // 检查动物是否已解锁
  isAnimalUnlocked(animalType) {
    const index = this.animalUnlockOrder.indexOf(animalType)
    if (index === -1) return true // 未知动物类型，默认解锁
    return this.playerLevel > index
  }
  // 获取建筑所需的等级
  getBuildingRequiredLevel(buildingType) {
    const index = this.buildingUnlockOrder.indexOf(buildingType)
    if (index === -1) return 1 // 未知建筑类型，默认1级
    return index + 1 // 索引0需要1级，索引1需要2级...
  }
  // 获取农作物所需的等级
  getCropRequiredLevel(cropType) {
    const index = this.cropUnlockOrder.indexOf(cropType)
    if (index === -1) return 1
    return index + 1
  }
  // 获取动物所需的等级
  getAnimalRequiredLevel(animalType) {
    const index = this.animalUnlockOrder.indexOf(animalType)
    if (index === -1) return 1
    return index + 1
  }
  // 获取已解锁的建筑列表
  getUnlockedBuildings() {
    return this.buildingUnlockOrder.filter((_, index) => this.playerLevel > index)
  }
  // 获取已解锁的农作物列表
  getUnlockedCrops() {
    return this.cropUnlockOrder.filter((_, index) => this.playerLevel > index)
  }
  // 获取已解锁的动物列表
  getUnlockedAnimals() {
    return this.animalUnlockOrder.filter((_, index) => this.playerLevel > index)
  }
  // 获取当前等级应该获得的经验值（基础5点，每升一级加1点）
  getExpReward() {
    return 4 + this.playerLevel // 1级=5, 2级=6, 3级=7...
  }
  // 获取当前等级应该获得的木材数量（基础5，每升一级加1）
  getWoodReward() {
    return 4 + this.playerLevel // 1级=5, 2级=6, 3级=7...
  }
  // 获取当前等级应该获得的石材数量（基础5，每升一级加1）
  getStoneReward() {
    return 4 + this.playerLevel // 1级=5, 2级=6, 3级=7...
  }
  // 获取当前等级应该获得的金币数量（基础10，每升一级加1）
  getGoldReward() {
    return 9 + this.playerLevel // 1级=10, 2级=11, 3级=12...
  }
  // 获取当前等级应该获得的食物数量（基础10，每升一级加1）
  getFoodReward() {
    return 9 + this.playerLevel // 1级=10, 2级=11, 3级=12...
  }
  // 增加玩家经验
  addPlayerExp(amount) {
    this.playerExp += amount
    return this.checkLevelUp()
  }
  // 获取当前等级升级所需的经验值（随等级增长）
  getExpRequiredForLevel(level) {
    // 基础10点，每级增加5点：1级升2级=10，2级升3级=15，3级升4级=20...
    return 10 + (level - 1) * 5
  }
  // 获取当前等级升级所需的经验值
  getExpRequired() {
    return this.getExpRequiredForLevel(this.playerLevel)
  }
  // 检查是否升级
  checkLevelUp() {
    let leveledUp = false
    while (true) {
      const expRequired = this.getExpRequiredForLevel(this.playerLevel)
      if (this.playerExp < expRequired) break
      this.playerExp -= expRequired
      this.playerLevel += 1
      leveledUp = true
    }
    return leveledUp
  }
}
