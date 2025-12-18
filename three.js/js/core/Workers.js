import * as THREE from 'https://unpkg.com/three@0.164.0/build/three.module.js'

/**
 * 角度插值函数，使旋转更自然
 * @param {number} a - 起始角度
 * @param {number} b - 目标角度
 * @param {number} t - 插值系数 (0-1)
 * @returns {number} 插值后的角度
 */
function lerpAngle(a, b, t) {
  let diff = b - a
  while (diff < -Math.PI) diff += Math.PI * 2
  while (diff > Math.PI) diff -= Math.PI * 2
  return a + diff * t
}

// 工人相关功能
export class Workers {
  constructor(game) {
    this.game = game
    this.moveSpeed = 14
  }

  spawnWorker() {
    if (!this.game.state.resources.consume({ food: 5, gold: 5 })) return false
    const mesh = this.createStickWorker()
    mesh.position.set((Math.random() - 0.5) * 100, 0.7, (Math.random() - 0.5) * 100)
    mesh.castShadow = true
    this.game.scene.add(mesh)
    const worker = { mesh, state: 'idle', hp: 100, baseY: mesh.position.y, idleTimer: 0, idleBehavior: null }
    worker.progressBar = this.game.uiComponents.createProgressBar()
    this.game.scene.add(worker.progressBar)
    worker.progressBar.visible = true
    this.game.state.addWorker(worker)
    this.applyPersonality(worker)
    return true
  }

  createStickWorker() {
    const group = new THREE.Group()
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3c556b })
    const limbMat = new THREE.MeshStandardMaterial({ color: 0x1f2a33 })
    const headMat = new THREE.MeshStandardMaterial({ color: 0xf2d3b1 })

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.35), bodyMat)
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), headMat)
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.6, 0.2), limbMat)
    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.6, 0.2), limbMat)
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.65, 0.25), limbMat)
    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.65, 0.25), limbMat)

    body.position.set(0, 0.4, 0)
    head.position.set(0, 0.95, 0)
    armL.position.set(-0.42, 0.45, 0)
    armR.position.set(0.42, 0.45, 0)
    legL.position.set(-0.18, -0.1, 0)
    legR.position.set(0.18, -0.1, 0)

    for (const m of [body, head, armL, armR, legL, legR]) { m.castShadow = true; m.receiveShadow = true; group.add(m) }
    group.userData.type = 'worker'
    group.userData.limbs = { body, head, armL, armR, legL, legR }
    return group
  }

  createPlayerModel() {
    const group = new THREE.Group()
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffc857 })
    const limbMat = new THREE.MeshStandardMaterial({ color: 0x333333 })
    const headMat = new THREE.MeshStandardMaterial({ color: 0xf2e3cf, emissive: 0x333333, emissiveIntensity: 0.35 })

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.4), bodyMat)
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), headMat)
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.7, 0.24), limbMat)
    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.7, 0.24), limbMat)
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.7, 0.3), limbMat)
    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.7, 0.3), limbMat)

    body.position.set(0, 0.45, 0)
    head.position.set(0, 1.0, 0)
    armL.position.set(-0.5, 0.5, 0)
    armR.position.set(0.5, 0.5, 0)
    legL.position.set(-0.2, -0.05, 0)
    legR.position.set(0.2, -0.05, 0)

    for (const m of [body, head, armL, armR, legL, legR]) { m.castShadow = true; m.receiveShadow = true; group.add(m) }
    group.userData.type = 'player'
    group.userData.limbs = { body, head, armL, armR, legL, legR }
    return group
  }

  applyPersonality(w) {
    const base = this.game.state.idleWeights
    const v = this.game.state.personalityVariance
    const jitter = (x) => x * (1 + (Math.random() * 2 - 1) * v)
    const r = jitter(base.rest), c = jitter(base.cheer), wa = jitter(base.wander)
    const sum = r + c + wa
    w.idleWeights = { rest: r / sum, cheer: c / sum, wander: wa / sum }
  }

  updateWorkersIdleWeights() {
    for (const w of this.game.state.workers) this.applyPersonality(w)
  }

  killWorker(w) {
    this.game.scene.remove(w.mesh)
    if (w.progressBar) this.game.scene.remove(w.progressBar)
    const idx = this.game.state.workers.indexOf(w)
    if (idx >= 0) this.game.state.workers.splice(idx, 1)
    this.game.state.resources.add({ workers: -1 })
  }

  /**
   * 计算某个任务（foundation/structure）已经分配了多少个工人
   * @param {Object} task - 任务对象（foundation或structure）
   * @returns {number} 已分配的工人数量
   */
  getWorkerCountForTask(task) {
    if (!task) return 0
    // 统计所有指向该任务的工人（包括移动中、工作中、建造中等所有状态）
    return this.game.state.workers.filter(w => w.targetStructure === task).length
  }

  /**
   * 计算工人到任务的距离（仅考虑XZ平面）
   * @param {Object} worker - 工人对象
   * @param {Object} task - 任务对象（foundation或structure）
   * @returns {number} 距离
   */
  getDistanceToTask(worker, task) {
    if (!worker || !worker.mesh || !task || !task.mesh) return Infinity
    const workerPos = worker.mesh.position
    const taskPos = task.mesh.position
    const dx = workerPos.x - taskPos.x
    const dz = workerPos.z - taskPos.z
    return Math.sqrt(dx * dx + dz * dz)
  }

  /**
   * 打断工人的当前动作（休息、欢呼、随机行走）
   * @param {Object} worker - 工人对象
   */
  interruptWorkerAction(worker) {
    if (!worker || !worker.mesh) return
    
    // 清除所有空闲行为
    worker.idleBehavior = null
    worker.idleTimer = 0
    worker.path = null
    worker.pathIndex = 0
    
    // 恢复站立姿势
    if (worker.mesh.userData && worker.mesh.userData.limbs) {
      const limbs = worker.mesh.userData.limbs
      worker.mesh.position.y = worker.baseY || worker.mesh.position.y
      worker.mesh.rotation.x = 0
      worker.mesh.rotation.z = 0
      limbs.legL.rotation.x = 0.1
      limbs.legR.rotation.x = -0.1
      limbs.armL.rotation.x = 0
      limbs.armR.rotation.x = 0
      limbs.armL.rotation.z = 0
      limbs.armR.rotation.z = 0
    }
    
    // 如果正在行走，停止行走
    if (worker.state === 'wandering') {
      worker.state = 'idle'
    }
  }

  /**
   * 找到距离任务最近的工人（包括可以打断的工人）
   * @param {Object} task - 任务对象
   * @param {number} count - 需要找到的工人数量（默认3）
   * @param {boolean} allowInterrupt - 是否允许打断正在休息/欢呼/行走的工人（默认true）
   * @param {boolean} excludeAssigned - 是否排除已有任务的工人（默认true）
   * @returns {Array} 最近的工人数组
   */
  findNearestWorkers(task, count = 3, allowInterrupt = true, excludeAssigned = true) {
    // 第一步：筛选所有可用的工人
    // 排除条件：
    // 1. 死亡的工人（HP <= 0）
    // 2. 正在执行其他任务的工人（moving 或 working 状态）
    // 3. 如果 excludeAssigned 为 true，排除已有 targetStructure 的工人
    const availableWorkers = this.game.state.workers.filter(w => {
      // 排除死亡的工人
      if (w.hp != null && w.hp <= 0) return false
      
      // 排除正在执行任务的工人（moving 或 working 状态）
      // 这些工人已经在前往任务或正在工作，不能打断
      if (w.state === 'moving' || w.state === 'working') return false
      
      // 如果排除已有任务的工人（excludeAssigned = true）
      if (excludeAssigned && w.targetStructure) return false
      
      // 如果允许打断，可以包括 idle（休息/欢呼）和 wandering（随机行走）状态的工人
      if (allowInterrupt) {
        return w.state === 'idle' || w.state === 'wandering'
      } else {
        // 不允许打断，只找真正的空闲工人（idle 或 wandering 且没有任务）
        return (w.state === 'idle' || w.state === 'wandering') && !w.targetStructure
      }
    })
    
    if (availableWorkers.length === 0) {
      console.log(`[找工人] 没有可用的工人（任务位置: x=${task.mesh.position.x.toFixed(2)}, z=${task.mesh.position.z.toFixed(2)}）`)
      return []
    }
    
    // 第二步：计算每个工人到任务的距离
    const workersWithDistance = availableWorkers.map(w => ({
      worker: w,
      distance: this.getDistanceToTask(w, task)
    }))
    
    // 第三步：按距离从近到远排序
    workersWithDistance.sort((a, b) => a.distance - b.distance)
    
    // 第四步：返回距离最近的 count 个工人
    const selectedWorkers = workersWithDistance.slice(0, count).map(item => item.worker)
    
    // 输出调试信息
    const distances = workersWithDistance.slice(0, count).map(w => w.distance.toFixed(2))
    console.log(`[找工人] 从 ${availableWorkers.length} 个可用工人中，选择距离最近的 ${selectedWorkers.length} 个工人，距离: [${distances.join(', ')}]`)
    
    return selectedWorkers
  }

  assignWork() {
    const candidates = this.game.state.structures.filter(s => s.type === 'foundation' && !s.completed)
    if (!candidates.length) return
    
    // 找到进度最低且工人数量少于3个的地基
    const availableFoundations = candidates.filter(f => this.getWorkerCountForTask(f) < 3)
    if (!availableFoundations.length) return // 所有任务都已满员
    
    // 按进度排序，优先处理进度最低的任务
    availableFoundations.sort((a, b) => a.progress - b.progress)
    
    // 如果只有一个任务，调用离任务最近的三个工人（可以打断当前动作）
    if (availableFoundations.length === 1) {
      const foundation = availableFoundations[0]
      const currentWorkerCount = this.getWorkerCountForTask(foundation)
      const targetWorkerCount = 3 // 总是需要3个工人
      
      if (currentWorkerCount < targetWorkerCount) {
        // 找到距离最近的3个工人（排除已有任务的工人，避免重复分配）
        const nearestWorkers = this.findNearestWorkers(foundation, targetWorkerCount, true, true)
        console.log(`[任务分配] 单个任务，当前有 ${currentWorkerCount} 个工人，需要 ${targetWorkerCount} 个，找到 ${nearestWorkers.length} 个最近的工人`)
        
        // 只分配需要的数量（如果已经有工人，就只分配缺少的数量）
        const workersToAssign = nearestWorkers.slice(0, targetWorkerCount - currentWorkerCount)
        
        for (const worker of workersToAssign) {
          // 如果工人正在休息、欢呼或行走，打断当前动作
          if (worker.state === 'idle' && (worker.idleBehavior === 'rest' || worker.idleBehavior === 'cheer')) {
            this.interruptWorkerAction(worker)
          } else if (worker.state === 'wandering') {
            this.interruptWorkerAction(worker)
          }
          const assigned = this.assignWorkToWorker(worker, foundation)
          if (assigned) {
            const distance = this.getDistanceToTask(worker, foundation)
            console.log(`[任务分配] 已分配工人到任务，距离: ${distance.toFixed(2)}`)
          }
        }
      }
    } else {
      // 如果有多个任务，为每个任务调用没有任务的最近的三个工人
      console.log(`[任务分配] 多个任务 (${availableFoundations.length}个)，为每个任务分配最近的工人`)
      for (const foundation of availableFoundations) {
        const currentWorkerCount = this.getWorkerCountForTask(foundation)
        const targetWorkerCount = 3 // 每个任务总是需要3个工人
        const neededWorkers = targetWorkerCount - currentWorkerCount
        
        if (neededWorkers > 0) {
          // 找到距离最近的3个工人（排除已有任务的工人），但只分配缺少的数量
          const nearestWorkers = this.findNearestWorkers(foundation, targetWorkerCount, true, true)
          console.log(`[任务分配] 任务当前有 ${currentWorkerCount} 个工人，需要 ${targetWorkerCount} 个，找到 ${nearestWorkers.length} 个最近的工人`)
          
          // 只分配需要的数量
          const workersToAssign = nearestWorkers.slice(0, neededWorkers)
          
          for (const worker of workersToAssign) {
            // 如果工人正在休息、欢呼或行走，打断当前动作
            if (worker.state === 'idle' && (worker.idleBehavior === 'rest' || worker.idleBehavior === 'cheer')) {
              this.interruptWorkerAction(worker)
            } else if (worker.state === 'wandering') {
              this.interruptWorkerAction(worker)
            }
            const assigned = this.assignWorkToWorker(worker, foundation)
            if (assigned) {
              const distance = this.getDistanceToTask(worker, foundation)
              console.log(`[任务分配] 已分配工人到任务，距离: ${distance.toFixed(2)}`)
            }
          }
        }
      }
    }
  }

  assignWorkToWorker(worker, foundation = null) {
    if (!worker || (worker.hp != null && worker.hp <= 0)) return false
    
    // 如果工人已经有任务且正在移动或工作中，不能打断（除非是同一个任务）
    if (worker.targetStructure && worker.targetStructure !== foundation) {
      // 如果工人正在执行其他任务，不能打断
      if (worker.state === 'moving' || worker.state === 'working') {
        return false
      }
    }
    
    const candidates = this.game.state.structures.filter(s => s.type === 'foundation' && !s.completed)
    if (!candidates.length) return false
    
    if (!foundation) {
      // 找到进度最低且工人数量少于3个的地基
      const availableFoundations = candidates.filter(f => this.getWorkerCountForTask(f) < 3)
      if (!availableFoundations.length) return false // 所有任务都已满员，不分配
      foundation = availableFoundations.reduce((a, b) => (a.progress < b.progress ? a : b))
    } else {
      // 如果指定了foundation，检查是否已经有3个工人
      if (this.getWorkerCountForTask(foundation) >= 3) {
        // 尝试找其他可用的foundation
        const availableFoundations = candidates.filter(f => 
          f !== foundation && this.getWorkerCountForTask(f) < 3
        )
        if (availableFoundations.length) {
          foundation = availableFoundations.reduce((a, b) => (a.progress < b.progress ? a : b))
        } else {
          return false // 所有任务都已满员
        }
      }
    }
    
    // 打断工人的当前动作（如果正在休息、欢呼或行走）
    this.interruptWorkerAction(worker)
    
    worker.state = 'moving'
    worker.demolishing = false
    
    const start = worker.mesh.position.clone()
    const end = foundation.mesh.position.clone().add(new THREE.Vector3((Math.random() - 0.5) * 3, 0.7, (Math.random() - 0.5) * 3))
    this.game.ai.findPath({ x: start.x, y: start.y, z: start.z }, { x: end.x, y: end.y, z: end.z }).then(path => {
      if (worker.targetStructure && worker.targetStructure !== foundation) return
      if (worker.hp != null && worker.hp <= 0) return
      
      // 在设置targetStructure之前，再次检查该任务是否已经有3个工人
      // 防止异步竞态条件导致超过3个工人
      if (this.getWorkerCountForTask(foundation) >= 3) {
        // 任务已满员，取消分配，让工人保持空闲
        worker.state = 'idle'
        worker.path = null
        worker.pathIndex = 0
        return
      }
      
      worker.path = path
      worker.pathIndex = 0
      worker.state = 'moving'
      worker.targetStructure = foundation
    }).catch(err => {
      console.error('Pathfinding failed:', err)
      worker.state = 'idle'
      worker.path = null
      worker.pathIndex = 0
    })
    return true
  }

  assignDemolishWork(structure) {
    if (!structure) return false
    if (structure.type === 'foundation' && !structure.completed) return false
    
    // 检查该拆除任务是否已经有3个工人
    if (this.getWorkerCountForTask(structure) >= 3) {
      return false // 该任务已满员
    }
    
    // 找到距离最近的工人（可以打断当前动作）
    const neededWorkers = 3 - this.getWorkerCountForTask(structure)
    const nearestWorkers = this.findNearestWorkers(structure, neededWorkers, true, true)
    if (nearestWorkers.length === 0) return false
    
    // 为每个找到的工人分配拆除任务
    for (const worker of nearestWorkers) {
      // 如果工人正在休息、欢呼或行走，打断当前动作
      if (worker.state === 'idle' && (worker.idleBehavior === 'rest' || worker.idleBehavior === 'cheer')) {
        this.interruptWorkerAction(worker)
      } else if (worker.state === 'wandering') {
        this.interruptWorkerAction(worker)
      }
      
      worker.state = 'moving'
      worker.demolishing = true
      const start = worker.mesh.position.clone()
      const end = structure.mesh.position.clone().add(new THREE.Vector3((Math.random() - 0.5) * 3, 0.7, (Math.random() - 0.5) * 3))
      this.game.ai.findPath({ x: start.x, y: start.y, z: start.z }, { x: end.x, y: end.y, z: end.z }).then(path => {
        if (worker.targetStructure && worker.targetStructure !== structure) return
        if (worker.hp != null && worker.hp <= 0) return
        
        // 在设置targetStructure之前，再次检查该任务是否已经有3个工人
        // 防止异步竞态条件导致超过3个工人
        if (this.getWorkerCountForTask(structure) >= 3) {
          // 任务已满员，取消分配，让工人保持空闲
          worker.state = 'idle'
          worker.path = null
          worker.pathIndex = 0
          worker.demolishing = false
          return
        }
        
        worker.path = path
        worker.pathIndex = 0
        worker.state = 'moving'
        worker.targetStructure = structure
      }).catch(err => {
        console.error('Pathfinding failed:', err)
        worker.state = 'idle'
        worker.path = null
        worker.pathIndex = 0
        worker.demolishing = false
      })
    }
    return true
  }

  updateWalkerPose(w, dt, intensity = 1) {
    const mesh = w.mesh
    if (!mesh || !mesh.userData || !mesh.userData.limbs) return
    const limbs = mesh.userData.limbs
    w._walkPhase = (w._walkPhase || 0) + dt * 10 * (this.game.state ? this.game.state.speed : 1)
    const phase = w._walkPhase
    const legAmp = 0.4 * intensity
    const armAmp = 0.6 * intensity
    limbs.legL.rotation.x = 0.1 + Math.sin(phase) * legAmp
    limbs.legR.rotation.x = -0.1 - Math.sin(phase) * legAmp
    limbs.armL.rotation.x = Math.sin(phase + Math.PI) * armAmp
    limbs.armR.rotation.x = Math.sin(phase) * armAmp
  }

  updateBuildingPose(w, dt) {
    const mesh = w.mesh
    if (!mesh || !mesh.userData || !mesh.userData.limbs) return
    const limbs = mesh.userData.limbs
    
    w._buildPhase = (w._buildPhase || 0) + dt * 8 * (this.game.state ? this.game.state.speed : 1)
    const phase = w._buildPhase
    
    limbs.legL.rotation.x = 0.2
    limbs.legR.rotation.x = 0.2
    
    limbs.armL.rotation.x = 0.5 + Math.sin(phase) * 0.4
    limbs.armL.rotation.z = 0.3
    limbs.armR.rotation.x = 0.5 + Math.sin(phase + Math.PI) * 0.4
    limbs.armR.rotation.z = -0.3
    
    if (w.targetStructure && w.targetStructure.mesh) {
      const direction = new THREE.Vector3()
      direction.subVectors(w.targetStructure.mesh.position, w.mesh.position)
      direction.y = 0
      direction.normalize()
      if (direction.length() > 0) {
        const targetAngle = Math.atan2(direction.x, direction.z)
        // 使用角度插值使旋转更自然
        const rotationSpeed = 8 // 旋转速度
        w.mesh.rotation.y = lerpAngle(w.mesh.rotation.y, targetAngle, Math.min(1, dt * rotationSpeed))
      }
    }
    
    mesh.rotation.x = -0.1
  }
}

