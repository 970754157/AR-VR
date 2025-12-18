import * as THREE from 'https://unpkg.com/three@0.164.0/build/three.module.js'

/**
 * 人群疏散管理类
 * 负责检测和疏散过于密集的工人和动物
 * 确保每个10x10区域不超过2个单位
 */
export class Evacuation {
  /**
   * 构造函数
   * @param {Object} game - 游戏主对象
   */
  constructor(game) {
    this.game = game
    // 区域大小（10x10）
    this.regionSize = 10
    // 每个区域最大单位数
    this.maxUnitsPerRegion = 2
    // 疏散检查间隔（秒）
    this.checkInterval = 2.0
    // 疏散检查计时器
    this.checkTimer = 0.0
    // 疏散速度
    this.evacuationSpeed = 12
  }

  /**
   * 将世界坐标转换为区域坐标
   * @param {number} worldX - 世界X坐标
   * @param {number} worldZ - 世界Z坐标
   * @returns {Object} 区域坐标 {regionX, regionZ}
   */
  worldToRegion(worldX, worldZ) {
    const regionX = Math.floor((worldX + 145) / this.regionSize)
    const regionZ = Math.floor((worldZ + 145) / this.regionSize)
    return { regionX, regionZ }
  }

  /**
   * 将区域坐标转换为世界坐标（区域中心）
   * @param {number} regionX - 区域X坐标
   * @param {number} regionZ - 区域Z坐标
   * @returns {THREE.Vector3} 世界坐标
   */
  regionToWorld(regionX, regionZ) {
    const worldX = regionX * this.regionSize - 145 + this.regionSize / 2
    const worldZ = regionZ * this.regionSize - 145 + this.regionSize / 2
    return new THREE.Vector3(worldX, 0.7, worldZ)
  }

  /**
   * 获取所有需要疏散的单位（工人和动物）
   * @returns {Array} 单位数组，每个单位包含 {type, object, position, region}
   */
  getAllUnits() {
    const units = []

    // 获取所有工人
    for (const worker of this.game.state.workers) {
      if (worker.mesh && worker.mesh.parent) {
        const pos = worker.mesh.position
        const region = this.worldToRegion(pos.x, pos.z)
        units.push({
          type: 'worker',
          object: worker,
          position: pos,
          region: region
        })
      }
    }

    // 获取所有动物（从场景中筛选）
    const animals = this.game.scene.children.filter(
      child => child.userData && child.userData.animal
    )
    for (const animal of animals) {
      if (animal.parent) {
        const pos = animal.position
        const region = this.worldToRegion(pos.x, pos.z)
        units.push({
          type: 'animal',
          object: animal,
          position: pos,
          region: region
        })
      }
    }

    return units
  }

  /**
   * 找到疏散目标位置（人少的区域）
   * @param {THREE.Vector3} currentPos - 当前位置
   * @param {Object} regionCounts - 区域单位计数
   * @returns {THREE.Vector3|null} 疏散目标位置，如果找不到返回null
   */
  findEvacuationTarget(currentPos, regionCounts) {
    const limit = 145
    const searchRadius = 50  // 搜索半径
    const maxAttempts = 20   // 最大尝试次数
    
    // 按距离排序，优先选择近的空闲区域
    const candidateRegions = []
    for (let regionX = 0; regionX < 30; regionX++) {
      for (let regionZ = 0; regionZ < 30; regionZ++) {
        const regionKey = `${regionX},${regionZ}`
        const count = regionCounts[regionKey] || 0
        
        if (count < this.maxUnitsPerRegion) {
          const worldPos = this.regionToWorld(regionX, regionZ)
          const distance = currentPos.distanceTo(worldPos)
          
          // 确保在游戏边界内
          if (Math.abs(worldPos.x) <= limit && Math.abs(worldPos.z) <= limit) {
            candidateRegions.push({
              regionX,
              regionZ,
              position: worldPos,
              distance: distance,
              count: count
            })
          }
        }
      }
    }
    
    // 按距离和单位数排序（优先选择近的、人少的）
    candidateRegions.sort((a, b) => {
      if (a.count !== b.count) return a.count - b.count
      return a.distance - b.distance
    })
    
    // 返回最近的合适区域
    if (candidateRegions.length > 0) {
      return candidateRegions[0].position
    }
    
    // 如果找不到合适的区域，随机选择一个位置
    const angle = Math.random() * Math.PI * 2
    const distance = 20 + Math.random() * 30
    const targetX = Math.max(-limit, Math.min(limit, currentPos.x + Math.cos(angle) * distance))
    const targetZ = Math.max(-limit, Math.min(limit, currentPos.z + Math.sin(angle) * distance))
    return new THREE.Vector3(targetX, 0.7, targetZ)
  }

  /**
   * 疏散单位到目标位置
   * @param {Object} unit - 单位对象
   * @param {THREE.Vector3} targetPos - 目标位置
   */
  evacuateUnit(unit, targetPos) {
    if (unit.type === 'worker') {
      const worker = unit.object
      // 为工人设置疏散路径
      this.game.ai.findPath(
        { x: worker.mesh.position.x, y: worker.mesh.position.y, z: worker.mesh.position.z },
        { x: targetPos.x, y: targetPos.y, z: targetPos.z }
      ).then(path => {
        if (path && path.length > 0) {
          worker.path = path
          worker.pathIndex = 0
          worker.state = 'moving'
          worker.targetStructure = null  // 清除当前任务
        }
      })
    } else if (unit.type === 'animal') {
      const animal = unit.object
      // 让动物逃跑（使用现有的makeAnimalRun方法）
      this.game.makeAnimalRun(animal, targetPos)
    }
  }

  /**
   * 执行疏散检查和处理
   * @param {number} dt - 时间差（秒）
   */
  update(dt) {
    this.checkTimer += dt
    
    // 每隔一定时间检查一次
    if (this.checkTimer < this.checkInterval) {
      return
    }
    
    this.checkTimer = 0.0
    
    // 获取所有单位
    const units = this.getAllUnits()
    
    // 统计每个区域的单位数
    const regionCounts = {}
    const unitsByRegion = {}
    
    for (const unit of units) {
      const regionKey = `${unit.region.regionX},${unit.region.regionZ}`
      regionCounts[regionKey] = (regionCounts[regionKey] || 0) + 1
      
      if (!unitsByRegion[regionKey]) {
        unitsByRegion[regionKey] = []
      }
      unitsByRegion[regionKey].push(unit)
    }
    
    // 检查每个区域，如果超过最大数量则疏散
    for (const regionKey in unitsByRegion) {
      const count = regionCounts[regionKey]
      
      if (count > this.maxUnitsPerRegion) {
        // 需要疏散的单位数
        const excessCount = count - this.maxUnitsPerRegion
        const regionUnits = unitsByRegion[regionKey]
        
        // 随机选择需要疏散的单位（避免总是疏散同一个）
        const unitsToEvacuate = []
        const shuffled = [...regionUnits].sort(() => Math.random() - 0.5)
        
        for (let i = 0; i < excessCount && i < shuffled.length; i++) {
          const unit = shuffled[i]
          
          // 检查单位是否已经在移动（避免打断正在执行的任务）
          if (unit.type === 'worker') {
            const worker = unit.object
            // 如果工人正在工作、正在移动执行任务，或者有目标建筑，跳过
            if (worker.state === 'working' || 
                (worker.state === 'moving' && worker.path && worker.targetStructure) ||
                worker.targetStructure) {
              continue
            }
          } else if (unit.type === 'animal') {
            const animal = unit.object
            // 如果动物正在逃跑，跳过
            if (animal.userData && animal.userData.state === 'running') {
              continue
            }
          }
          
          unitsToEvacuate.push(unit)
        }
        
        // 疏散多余的单位
        for (const unit of unitsToEvacuate) {
          const targetPos = this.findEvacuationTarget(unit.position, regionCounts)
          if (targetPos) {
            this.evacuateUnit(unit, targetPos)
            
            // 更新区域计数（假设单位会移动到新区域）
            const targetRegion = this.worldToRegion(targetPos.x, targetPos.z)
            const targetRegionKey = `${targetRegion.regionX},${targetRegion.regionZ}`
            regionCounts[targetRegionKey] = (regionCounts[targetRegionKey] || 0) + 1
            regionCounts[regionKey] = (regionCounts[regionKey] || 0) - 1
          }
        }
      }
    }
  }
}

