import * as THREE from 'https://unpkg.com/three@0.164.0/build/three.module.js'
import { GameState } from './GameState.js'
import { AIManager } from './AI.js'
import { t } from '../i18n.js'

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
import { Buildings } from './Buildings.js'
import { Resources } from './Resources.js'
import { Environment } from './Environment.js'
import { Workers } from './Workers.js'
import { Crops } from './Crops.js'
import { Animals } from './Animals.js'
import { Cats } from './Cats.js'
import { Evacuation } from './Evacuation.js'
import { UIComponents } from './UIComponents.js'

export class Game {
  constructor(scene, config, camera, notify) {
    this.scene = scene
    this.state = new GameState(config)
    this.ai = new AIManager(this)
    this.camera = camera
    this.notify = notify || (() => {})
    
    // 初始化各个模块
    this.buildings = new Buildings(this)
    this.resources = new Resources(this)
    this.environment = new Environment(this)
    this.workers = new Workers(this)
    this.crops = new Crops(this)
    this.animals = new Animals(this)
    this.cats = new Cats(this)
    this.evacuation = new Evacuation(this)
    this.uiComponents = new UIComponents(this)
    
    // 初始化游戏环境
    this.ground = this.environment.createGround()
    this.scene.add(this.ground)
    
    // 资源列表（从 resources 模块获取）
    this.trees = this.resources.trees
    this.rocks = this.resources.rocks
    this.goldMines = this.resources.goldMines
    
    // 工人相关
    this.workerMeshes = []
    this.moveSpeed = this.workers.moveSpeed
    
    // 初始化
    this.workers.updateWorkersIdleWeights()
    this.resources.createForest()
    this.resources.createMountain()
    this.resources.createGoldMine()
    this.buildings.createInitialStructures()
    this.environment.createWildFlowers()
  }

  // 委托给 Buildings 模块
  createFadeMaterial(color) { return this.buildings.createFadeMaterial(color) }
  createCastleVariant(at) { return this.buildings.createCastleVariant(at) }
  createLibraryVariant(at) { return this.buildings.createLibraryVariant(at) }
  createWallVariant(at) { return this.buildings.createWallVariant(at) }
  createFarmVariant(at) { return this.buildings.createFarmVariant(at) }
  createSchoolVariant(at) { return this.buildings.createSchoolVariant(at) }
  createRoadVariant(at) { return this.buildings.createRoadVariant(at) }
  createRiverVariant(at) { return this.buildings.createRiverVariant(at) }
  createCabin(at) { return this.buildings.createCabin(at) }
  createCampfire(at) { return this.buildings.createCampfire(at) }
  createInitialStructures() { return this.buildings.createInitialStructures() }
  addFoundationAt(point, buildType) { return this.buildings.addFoundationAt(point, buildType) }
  addFoundation() { return this.buildings.addFoundation() }

  // 委托给 Resources 模块
  createForest() { return this.resources.createForest() }
  createTree(at) { return this.resources.createTree(at) }
  harvestTree(treeMesh) { return this.resources.harvestTree(treeMesh) }
  createMountain() { return this.resources.createMountain() }
  createRock(at) { return this.resources.createRock(at) }
  harvestRock(rockMesh) { return this.resources.harvestRock(rockMesh) }
  createGoldMine() { return this.resources.createGoldMine() }
  createGoldOre(at) { return this.resources.createGoldOre(at) }
  harvestGold(goldMesh) { return this.resources.harvestGold(goldMesh) }

  // 委托给 Environment 模块
  createGround() { return this.environment.createGround() }
  createWildFlowers() { return this.environment.createWildFlowers() }
  createWildFlower(at) { return this.environment.createWildFlower(at) }

  // 委托给 Workers 模块
  spawnWorker() { 
    const result = this.workers.spawnWorker()
    if (result) {
      // 更新 workerMeshes 列表
      const newWorker = this.state.workers[this.state.workers.length - 1]
      if (newWorker && newWorker.mesh) {
        this.workerMeshes.push(newWorker.mesh)
      }
    }
    return result
  }
  createStickWorker() { return this.workers.createStickWorker() }
  createPlayerModel() { return this.workers.createPlayerModel() }
  applyPersonality(w) { return this.workers.applyPersonality(w) }
  updateWorkersIdleWeights() { return this.workers.updateWorkersIdleWeights() }
  killWorker(w) { return this.workers.killWorker(w) }
  assignWork() { return this.workers.assignWork() }
  assignWorkToWorker(worker, foundation) { return this.workers.assignWorkToWorker(worker, foundation) }
  assignDemolishWork(structure) { return this.workers.assignDemolishWork(structure) }
  updateWalkerPose(w, dt, intensity) { return this.workers.updateWalkerPose(w, dt, intensity) }
  updateBuildingPose(w, dt) { return this.workers.updateBuildingPose(w, dt) }

  // 委托给 Crops 模块
  createCrop(at, cropType) { return this.crops.createCrop(at, cropType) }
  plantCrop(farmMesh, cropType) { return this.crops.plantCrop(farmMesh, cropType) }
  harvestCrop(cropMesh) { return this.crops.harvestCrop(cropMesh) }

  // 委托给 Animals 模块
  createSheep(at) { return this.animals.createSheep(at) }
  createPig(at) { return this.animals.createPig(at) }
  createCow(at) { return this.animals.createCow(at) }
  updateAnimals(dt) { return this.animals.updateAnimals(dt) }
  updateAnimalWalkAnimation(animal, dt, speedMultiplier) { return this.animals.updateAnimalWalkAnimation(animal, dt, speedMultiplier) }
  resetAnimalLegs(animal) { return this.animals.resetAnimalLegs(animal) }
  makeAnimalRun(animal, targetPos) { return this.animals.makeAnimalRun(animal, targetPos) }

  // 委托给 Cats 模块
  createCat(at) { return this.cats.createCat(at) }
  spawnRandomCat() { return this.cats.spawnRandomCat() }
  makeCatFollow(cat, playerPos) { return this.cats.makeCatFollow(cat, playerPos) }
  updateCats(dt, playerPos, playerRotY) { return this.cats.updateCats(dt, playerPos, playerRotY) }
  getAllCats() { return this.cats.getAllCats() }

  // 委托给 UIComponents 模块
  createProgressBar() { return this.uiComponents.createProgressBar() }
  createCropProgressBar() { return this.uiComponents.createCropProgressBar() }

  // 保留 update 方法（因为太复杂，需要保持原有逻辑）
  // 注意：这个方法很长（约650行），包含工人状态更新、资源再生、农作物成熟等逻辑
  // 为了保持功能完整性，暂时保留原有实现
  update(dt) {
    // 这里需要保留原有的 update 方法实现
    // 由于方法太长，我会从原文件复制过来
    // 但会更新方法调用以使用模块
    this.state.tick(dt)
    
    // 工人更新逻辑（保留原有实现，但使用模块方法）
    for (const w of this.state.workers) {
      if (w.state === 'moving' && w.path) {
        if (w.targetStructure && w.targetStructure.completed && !w.demolishing) {
          w.targetStructure = null
          w.state = 'idle'
          w.path = null
          if (w.hp != null && w.hp > 0) {
            this.assignWorkToWorker(w)
          }
          continue
        }
        const target = w.path[Math.min(w.pathIndex, w.path.length - 1)]
        const t = new THREE.Vector3(target.x, target.y, target.z)
        w.mesh.position.lerp(t, Math.min(1, dt * this.moveSpeed))
        
        // 计算朝向目标的方向并平滑旋转
        const direction = new THREE.Vector3()
        direction.subVectors(t, w.mesh.position)
        direction.y = 0
        if (direction.length() > 0.01) {
          direction.normalize()
          const targetAngle = Math.atan2(direction.x, direction.z)
          const rotationSpeed = 8 // 旋转速度
          w.mesh.rotation.y = lerpAngle(w.mesh.rotation.y, targetAngle, Math.min(1, dt * rotationSpeed))
        }
        
        this.updateWalkerPose(w, dt, 1)
        
        if (w.progressBar) {
          w.progressBar.position.copy(w.mesh.position).add(new THREE.Vector3(0, 1.3, 0))
          w.progressBar.lookAt(this.camera.position)
          w.progressBar.visible = true
          if (w.hp != null && w.progressBar.userData.hpFill) {
            const ratio = Math.max(0, w.hp / 100)
            w.progressBar.userData.hpFill.scale.x = ratio
          }
          if (w.progressBar.userData.fill) {
            w.progressBar.userData.fill.scale.x = 0
          }
        }
        
        if (w.mesh.position.distanceTo(t) < 0.05) {
          w.pathIndex += 1
          if (w.pathIndex >= w.path.length) {
            w.state = 'working'
            w.workTime = 0
            w._buildPhase = 0
            if (!w.progressBar) {
              w.progressBar = this.createProgressBar()
              this.scene.add(w.progressBar)
            }
            w.progressBar.visible = true
            if (w.demolishing && w.progressBar.userData.fill) {
              w.progressBar.userData.fill.material.color.set(0xff4444)
            }
          }
        }
      } else if (w.state === 'working') {
        w.workTime += dt * this.state.speed
        this.updateBuildingPose(w, dt)
        
        if (w.progressBar) {
          const pct = Math.min(1, w.workTime / 2)
          w.progressBar.userData.fill.scale.x = pct
          w.progressBar.position.copy(w.mesh.position).add(new THREE.Vector3(0, 1.3, 0))
          w.progressBar.lookAt(this.camera.position)
          if (w.hp != null && w.progressBar.userData.hpFill) {
            const ratio = Math.max(0, w.hp / 100)
            w.progressBar.userData.hpFill.scale.x = ratio
          }
        }
        if (w.workTime >= 2) {
          if (w.progressBar) {
            w.progressBar.visible = true
            w.progressBar.userData.fill.scale.x = 0
            if (w.hp != null && w.progressBar.userData.hpFill) {
              const ratio = Math.max(0, w.hp / 100)
              w.progressBar.userData.hpFill.scale.x = ratio
            }
          }
          if (w.demolishing && w.targetStructure) {
            const canDemolish = w.targetStructure.type !== 'foundation' || w.targetStructure.completed
            if (canDemolish) {
              const structure = w.targetStructure
              const buildingCosts = {
                castle: { food: 50, wood: 25 },
                library: { food: 40, wood: 20 },
                farm: { food: 10, wood: 5 },
                school: { food: 35, wood: 25 },
                wall: { food: 60, wood: 15 },
                road: { food: 20, wood: 5 },
                river: { food: 0, wood: 0 },
                cabin: { food: 5, wood: 8 },
                campfire: { food: 2, wood: 3 }
              }
              const buildingType = structure.type === 'foundation' ? (structure.forType || 'castle') : structure.type
              const cost = buildingCosts[buildingType] || buildingCosts.castle
              const refund = {
                food: Math.floor(cost.food / 2),
                wood: Math.floor(cost.wood / 2)
              }
              if (refund.food > 0 || refund.wood > 0) {
                this.state.resources.add(refund)
    this.notify(t('msg.demolishedRefund', { food: refund.food, wood: refund.wood }))
              } else {
    this.notify(t('msg.demolished'))
              }
              this.scene.remove(structure.mesh)
              if (structure.type === 'farm' && structure.mesh.userData.crops) {
                for (const crop of structure.mesh.userData.crops) {
                  if (crop.userData.progressBar) {
                    this.scene.remove(crop.userData.progressBar)
                  }
                  this.scene.remove(crop)
                }
              }
              const idx = this.state.structures.indexOf(structure)
              if (idx >= 0) this.state.structures.splice(idx, 1)
              if (w) this.killWorker(w)
              w.targetStructure = null
              w.demolishing = false
            }
          } else {
            const foundation = (w.targetStructure && !w.targetStructure.completed) ? w.targetStructure : null
            if (foundation) {
              const foundationStillExists = this.state.structures.includes(foundation)
              if (!foundationStillExists || foundation.completed) {
                w.targetStructure = null
                w.demolishing = false
                w.state = 'idle'
                w.path = null
                w.pathIndex = 0
                w.idleBehavior = null
                w.idleTimer = 0
                if (w.hp != null && w.hp > 0) {
                  this.assignWorkToWorker(w)
                } else if (w.hp != null && w.hp <= 0) {
                  if (w) this.killWorker(w)
                }
              } else {
                foundation.progress = Math.min(1, foundation.progress + 0.25)
                foundation.mesh.scale.y = Math.max(0.1, foundation.progress)
                if (w.hp != null) w.hp = Math.max(0, w.hp - 25)
                
                if (w.hp != null && w.hp <= 0) {
                  w.targetStructure = null
                  w.demolishing = false
                   this.notify(t('msg.workerDied'))
                  if (w) this.killWorker(w)
                  continue
                }
                
                if (foundation.progress >= 1 && !foundation.completed) {
                  foundation.completed = true
                  this.notify(t('msg.foundationComplete'))
                  let building
                  const buildType = foundation.forType || 'castle'
                  if (buildType === 'castle') building = this.createCastleVariant(foundation.mesh.position)
                  else if (buildType === 'library') building = this.createLibraryVariant(foundation.mesh.position)
                  else if (buildType === 'farm') building = this.createFarmVariant(foundation.mesh.position)
                  else if (buildType === 'school') building = this.createSchoolVariant(foundation.mesh.position)
                  else if (buildType === 'wall') building = this.createWallVariant(foundation.mesh.position)
                  else if (buildType === 'road') building = this.createRoadVariant(foundation.mesh.position)
                  else if (buildType === 'river') building = this.createRiverVariant(foundation.mesh.position)
                  else building = this.createCastleVariant(foundation.mesh.position)
                  this.scene.add(building)
                  building.visible = true
                  this.state.addStructure({ type: buildType, mesh: building })
                  const name = t(`building.${buildType}`) || buildType
                  this.notify(t('msg.buildingShown', { name }))
                  this.scene.remove(foundation.mesh)
                  const idx = this.state.structures.indexOf(foundation)
                  if (idx >= 0) this.state.structures.splice(idx, 1)
                  
                  const leveledUp = this.state.addPlayerExp(this.state.getExpReward())
                  if (leveledUp) {
                    this.notify(t('msg.levelUp', { level: this.state.playerLevel }))
                    if (this.onLevelUp) this.onLevelUp()
                  }
                  
                  w.targetStructure = null
                  w.demolishing = false
                  w.state = 'idle'
                  w.path = null
                  w.pathIndex = 0
                  w.idleBehavior = null
                  w.idleTimer = 0
                  
                  if (w.hp != null && w.hp > 0) {
                    this.assignWorkToWorker(w)
                  } else {
                    w.targetStructure = null
                    if (w) this.killWorker(w)
                  }
                } else {
                  if (w.hp != null && w.hp > 0) {
                    w.state = 'working'
                    w.workTime = 0
                    if (w.progressBar) {
                      w.progressBar.visible = true
                      w.progressBar.userData.fill.scale.x = 0
                    }
                  } else {
                    w.targetStructure = null
                    w.demolishing = false
                     this.notify(t('msg.workerDied'))
                    if (w) this.killWorker(w)
                    continue
                  }
                }
              }
            } else {
              if (w.hp != null && w.hp > 0 && !w.demolishing) {
                w.targetStructure = null
                w.demolishing = false
                w.state = 'idle'
                w.path = null
                w.pathIndex = 0
                w.idleBehavior = null
                w.idleTimer = 0
                this.assignWorkToWorker(w)
              } else if (w.hp != null && w.hp <= 0) {
                w.targetStructure = null
                if (w) this.killWorker(w)
              }
            }
          }
          if (w.state === 'working' && !w.targetStructure) {
            w.state = 'idle'
            w.path = null
            w.pathIndex = 0
            w.demolishing = false
            w.idleBehavior = null
            w.idleTimer = 0
            w.workTime = 0
            if (w.hp != null && w.hp > 0) {
              this.assignWorkToWorker(w)
            } else if (w.hp != null && w.hp <= 0) {
              w.targetStructure = null
              if (w) this.killWorker(w)
            }
          }
        }
      } else if (w.state === 'wandering' && w.path) {
        if (w.targetStructure || w.demolishing) {
          w.state = 'idle'
          w.path = null
          w.pathIndex = 0
          w.idleBehavior = null
          w.idleTimer = 0
          const limbs = w.mesh.userData && w.mesh.userData.limbs
          if (limbs) {
            w.mesh.position.y = w.baseY || w.mesh.position.y
            limbs.legL.rotation.x = 0.1
            limbs.legR.rotation.x = -0.1
            limbs.armL.rotation.x = 0
            limbs.armR.rotation.x = 0
            limbs.armL.rotation.z = 0
            limbs.armR.rotation.z = 0
          }
          if (w.targetStructure && !w.path) {
            if (!w.demolishing) {
              this.assignWorkToWorker(w)
            }
          }
          continue
        }
        
        const target = w.path[Math.min(w.pathIndex, w.path.length - 1)]
        const t = new THREE.Vector3(target.x, target.y, target.z)
        w.mesh.position.lerp(t, Math.min(1, dt * (this.moveSpeed * 0.6)))
        
        // 计算朝向目标的方向并平滑旋转
        const direction = new THREE.Vector3()
        direction.subVectors(t, w.mesh.position)
        direction.y = 0
        if (direction.length() > 0.01) {
          direction.normalize()
          const targetAngle = Math.atan2(direction.x, direction.z)
          const rotationSpeed = 8 // 旋转速度
          w.mesh.rotation.y = lerpAngle(w.mesh.rotation.y, targetAngle, Math.min(1, dt * rotationSpeed))
        }
        
        this.updateWalkerPose(w, dt, 0.7)
        
        if (w.progressBar) {
          w.progressBar.position.copy(w.mesh.position).add(new THREE.Vector3(0, 1.3, 0))
          w.progressBar.lookAt(this.camera.position)
          w.progressBar.visible = true
          if (w.hp != null && w.progressBar.userData.hpFill) {
            const ratio = Math.max(0, w.hp / 100)
            w.progressBar.userData.hpFill.scale.x = ratio
          }
          if (w.progressBar.userData.fill) {
            w.progressBar.userData.fill.scale.x = 0
          }
        }
        
        if (!w._lastTaskCheck) w._lastTaskCheck = 0
        w._lastTaskCheck += dt
        if (w._lastTaskCheck >= 0.5) {
          w._lastTaskCheck = 0
          if (w.hp != null && w.hp > 0 && !w.targetStructure && !w.demolishing) {
            const hasIncompleteTasks = this.state.structures.some(s => s.type === 'foundation' && !s.completed)
            if (hasIncompleteTasks) {
              // 打断工人的当前动作（随机行走）
              this.workers.interruptWorkerAction(w)
              this.assignWorkToWorker(w)
              continue
            }
          }
        }
        
        if (w.mesh.position.distanceTo(t) < 0.05) {
          w.pathIndex += 1
          if (w.pathIndex >= w.path.length) {
            w.state = 'idle'
            w.path = null
            if (w.hp != null && w.hp > 0 && !w.targetStructure && !w.demolishing) {
              const hasIncompleteTasks = this.state.structures.some(s => s.type === 'foundation' && !s.completed)
              if (hasIncompleteTasks) {
                this.assignWorkToWorker(w)
              }
            }
          }
        }
      } else if (w.state === 'idle') {
        if (w.targetStructure || w.demolishing) {
          w.idleBehavior = null
          w.idleTimer = 0
          const limbs = w.mesh.userData && w.mesh.userData.limbs
          if (limbs) {
            w.mesh.position.y = w.baseY || w.mesh.position.y
            w.mesh.rotation.x = 0
            w.mesh.rotation.z = 0
            limbs.legL.rotation.x = 0.1
            limbs.legR.rotation.x = -0.1
            limbs.armL.rotation.x = 0
            limbs.armR.rotation.x = 0
            limbs.armL.rotation.z = 0
            limbs.armR.rotation.z = 0
          }
          if (w.targetStructure && !w.path) {
            if (!w.demolishing) {
              this.assignWorkToWorker(w)
            }
          }
          continue
        }
        
        if (w.progressBar) {
          w.progressBar.position.copy(w.mesh.position).add(new THREE.Vector3(0, 1.3, 0))
          w.progressBar.lookAt(this.camera.position)
          w.progressBar.visible = true
          if (w.hp != null && w.progressBar.userData.hpFill) {
            const ratio = Math.max(0, w.hp / 100)
            w.progressBar.userData.hpFill.scale.x = ratio
          }
          if (w.progressBar.userData.fill) {
            w.progressBar.userData.fill.scale.x = 0
          }
        }
        
        if (!w._lastTaskCheck) w._lastTaskCheck = 0
        w._lastTaskCheck += dt
        if (w._lastTaskCheck >= 0.5) {
          w._lastTaskCheck = 0
          if (w.hp != null && w.hp > 0 && !w.targetStructure && !w.demolishing) {
            const hasIncompleteTasks = this.state.structures.some(s => s.type === 'foundation' && !s.completed)
            if (hasIncompleteTasks) {
              // 打断工人的当前动作（休息、欢呼）
              this.workers.interruptWorkerAction(w)
              this.assignWorkToWorker(w)
              continue
            }
          }
        }
        
        const limbs = w.mesh.userData && w.mesh.userData.limbs
        if (w.idleTimer > 0) {
          // 在休息或欢呼时，检查是否有未完成的任务，如果有则打断
          const hasIncompleteTasks = this.state.structures.some(s => s.type === 'foundation' && !s.completed)
          if (hasIncompleteTasks && !w.targetStructure && !w.demolishing) {
            // 有任务，打断当前动作并分配工作
            this.workers.interruptWorkerAction(w)
            this.assignWorkToWorker(w)
            continue
          }
          
          w.idleTimer -= dt
          if (w.idleBehavior === 'rest') {
            if (limbs) {
              limbs.legL.rotation.x = 0.3
              limbs.legR.rotation.x = 0.3
              limbs.armL.rotation.x = 0.2
              limbs.armR.rotation.x = 0.2
              limbs.armL.rotation.z = 0.3
              limbs.armR.rotation.z = -0.3
            }
          } else if (w.idleBehavior === 'cheer') {
            const phase = (w._cheerPhase || 0) + dt * 6
            w._cheerPhase = phase
            w.mesh.position.y = w.baseY + Math.sin(phase) * 0.2
            w.mesh.rotation.y += dt * 0.8
            if (limbs) {
              limbs.armL.rotation.x = -1.2 + Math.sin(phase) * 0.3
              limbs.armR.rotation.x = -1.2 + Math.sin(phase) * 0.3
              limbs.armL.rotation.z = 0.2
              limbs.armR.rotation.z = -0.2
              limbs.legL.rotation.x = 0.2 + Math.sin(phase) * 0.1
              limbs.legR.rotation.x = 0.2 + Math.sin(phase) * 0.1
            }
          }
          if (w.idleTimer <= 0) {
            if (w.idleBehavior === 'rest') {
              if (w._idleRot) {
                w.mesh.rotation.x = w._idleRot.x
                w.mesh.rotation.y = w._idleRot.y
                w.mesh.rotation.z = w._idleRot.z
              }
              w.mesh.position.y = w.baseY
            } else if (w.idleBehavior === 'cheer') {
              w.mesh.position.y = w.baseY
            }
            w.idleBehavior = null
            if (limbs) {
              limbs.legL.rotation.x = 0.1
              limbs.legR.rotation.x = -0.1
              limbs.armL.rotation.x = 0
              limbs.armR.rotation.x = 0
              limbs.armL.rotation.z = 0
              limbs.armR.rotation.z = 0
            }
          }
        } else {
          // 在开始新的空闲行为之前，先检查是否有未完成的任务
          const hasIncompleteTasks = this.state.structures.some(s => s.type === 'foundation' && !s.completed)
          if (hasIncompleteTasks) {
            // 有任务，打断并分配工作
            this.workers.interruptWorkerAction(w)
            this.assignWorkToWorker(w)
            continue
          }
          
          if (limbs) {
            limbs.legL.rotation.x = 0.1
            limbs.legR.rotation.x = -0.1
            limbs.armL.rotation.x = 0
            limbs.armR.rotation.x = 0
            limbs.armL.rotation.z = 0
            limbs.armR.rotation.z = 0
          }
          const weights = w.idleWeights || this.state.idleWeights
          const r = Math.random()
          if (r < weights.rest) {
            w.idleBehavior = 'rest'
            w.idleTimer = 3 + Math.random() * 4
            w._idleRot = { x: w.mesh.rotation.x, y: w.mesh.rotation.y, z: w.mesh.rotation.z }
            w.mesh.rotation.z = Math.PI / 2
            w.mesh.rotation.x = 0
            w.mesh.position.y = 0.3
          } else if (r < (weights.rest + weights.cheer)) {
            w.idleBehavior = 'cheer'
            w.idleTimer = 2 + Math.random() * 3
            w._cheerPhase = 0
          } else {
            w.idleBehavior = 'wander'
            const start = w.mesh.position.clone()
            const angle = Math.random() * Math.PI * 2
            const distance = 5 + Math.random() * 7
            const end = start.clone().add(new THREE.Vector3(
              Math.cos(angle) * distance,
              0,
              Math.sin(angle) * distance
            ))
            const limit = 145
            end.x = Math.max(-limit, Math.min(limit, end.x))
            end.z = Math.max(-limit, Math.min(limit, end.z))
            this.ai.findPath({ x: start.x, y: start.y, z: start.z }, { x: end.x, y: end.y, z: end.z }).then(path => {
              if (w.state === 'idle' && w.idleBehavior === 'wander' && !w.targetStructure && (w.hp == null || w.hp > 0)) {
                const hasIncompleteTasks = this.state.structures.some(s => s.type === 'foundation' && !s.completed)
                if (hasIncompleteTasks) {
                  w.idleBehavior = null
                  w.idleTimer = 0
                  this.assignWorkToWorker(w)
                  return
                }
                w.path = path
                w.pathIndex = 0
                w.state = 'wandering'
                w.idleBehavior = null
              }
            })
          }
        }
      }
    }
    
    // 检查已开采的树木，5秒后重新生成
    for (const treeObj of this.trees) {
      if (treeObj.harvested && treeObj.harvestTime !== undefined) {
        const elapsed = this.state.time - treeObj.harvestTime
        if (elapsed >= 5) {
          treeObj.harvested = false
          treeObj.harvestTime = undefined
          if (treeObj.mesh) {
            treeObj.mesh.visible = true
          } else {
            const newTree = this.createTree(treeObj.position)
            this.scene.add(newTree)
            treeObj.mesh = newTree
          }
        }
      }
    }
    
    // 检查所有农田中的农作物是否成熟
    const farms = this.state.structures.filter(s => s.type === 'farm' && s.mesh && s.mesh.userData.crops)
    for (const farm of farms) {
      for (const crop of farm.mesh.userData.crops) {
        if (['carrot', 'watermelon', 'grape'].includes(crop.userData.type)) {
          if (!crop.userData.isMature) {
            const elapsed = this.state.time - crop.userData.plantTime
            const progress = Math.min(1, elapsed / crop.userData.matureTime)
            
            if (crop.userData.progressBar) {
              crop.userData.progressBar.userData.fill.scale.x = progress
              crop.userData.progressBar.position.copy(crop.position).add(new THREE.Vector3(0, 0.8, 0))
              crop.userData.progressBar.lookAt(this.camera.position)
              crop.userData.progressBar.visible = true
            }
            
            if (elapsed >= crop.userData.matureTime) {
              crop.userData.isMature = true
              crop.scale.setScalar(1.3)
              if (crop.userData.cropMesh) {
                if (crop.userData.type === 'carrot') {
                  crop.userData.cropMesh.material.color.set(0xffa500)
                } else if (crop.userData.type === 'watermelon') {
                  crop.userData.cropMesh.material.color.set(0x32CD32)
                } else if (crop.userData.type === 'grape') {
                  crop.userData.cropMesh.material.color.set(0x9932CC)
                }
              }
              if (crop.userData.progressBar) {
                crop.userData.progressBar.visible = false
              }
            }
          } else {
            if (crop.userData.progressBar) {
              crop.userData.progressBar.visible = false
            }
          }
        }
      }
    }
    
    // 建筑淡入效果
    const builds = this.state.structures.filter(s => ['castle','library','school','wall','road','river'].includes(s.type))
    for (const p of builds) {
      if (!p.mesh.userData.mats) continue
      p.mesh.userData.fade = Math.min(1, p.mesh.userData.fade + dt * 0.7)
      const f = p.mesh.userData.fade
      for (const m of p.mesh.userData.mats) m.opacity = f
      p.mesh.scale.setScalar(0.9 + 0.1 * f)
    }
    
    // 更新动物行为
    this.updateAnimals(dt)
    
    // 执行人群疏散检查
    this.evacuation.update(dt)
  }
}
