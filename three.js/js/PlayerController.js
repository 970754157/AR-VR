import * as THREE from 'three'
import { OBJLoader } from 'https://unpkg.com/three@0.164.0/examples/jsm/loaders/OBJLoader.js'

// 玩家控制相关功能
export class PlayerController {
  constructor(game, cameraSys, scene) {
    this.game = game
    this.cameraSys = cameraSys
    this.scene = scene
    this.player = game.createPlayerModel()
    this.player.position.set(0, 0.7, 0)
    this.scene.add(this.player)
    
    this.pet = null // 宠物对象
    
    this.movement = {
      forward: 0,
      right: 0
    }
    
    this.playerSpeed = 20
    this.playerTarget = null
    this.playerPath = null
    this.playerPathIndex = 0
    this.playerHarvesting = false
    
    this.init()
  }

  async loadPetModel() {
    const loader = new OBJLoader()
    try {
      const model = await loader.loadAsync('./model/fat_cat.obj')
      
      model.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({ color: 0xffaa00 })
        }
      })
      
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const maxSize = Math.max(size.x, size.y, size.z)
      const targetSize = 0.6
      const scale = targetSize / maxSize
      model.scale.set(scale, scale, scale)
      
      box.setFromObject(model)
      const minY = box.min.y
      model.position.y = -minY

      this.pet = new THREE.Group()
      this.pet.add(model)
      
      this.pet.position.copy(this.player.position)
      this.pet.position.x -= 1
      
      this.scene.add(this.pet)
      
    } catch (error) {
      console.error('Failed to load pet model:', error)
    }
  }

  init() {
    this.loadPetModel()
    
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return
      if (e.code === 'KeyW') this.movement.forward = 1
      if (e.code === 'KeyS') this.movement.forward = -1
      if (e.code === 'KeyA') this.movement.right = -1
      if (e.code === 'KeyD') this.movement.right = 1
    })

    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyW' && this.movement.forward === 1) this.movement.forward = 0
      if (e.code === 'KeyS' && this.movement.forward === -1) this.movement.forward = 0
      if (e.code === 'KeyA' && this.movement.right === -1) this.movement.right = 0
      if (e.code === 'KeyD' && this.movement.right === 1) this.movement.right = 0
    })
  }

  update(dt, tutorialCompleted) {
    if (!tutorialCompleted) return
    
    const cam = this.cameraSys.getCamera()
    const forward = new THREE.Vector3()
    cam.getWorldDirection(forward)
    forward.y = 0
    forward.normalize()

    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()

    let moveDir = new THREE.Vector3()
    let isMoving = false

    if (this.playerPath && this.playerPath.length > 0 && this.playerPathIndex < this.playerPath.length) {
      const target = this.playerPath[Math.min(this.playerPathIndex, this.playerPath.length - 1)]
      const targetPos = new THREE.Vector3(target.x, target.y, target.z)
      const dirToTarget = targetPos.clone().sub(this.player.position).normalize()
      dirToTarget.y = 0
      
      if (this.player.position.distanceTo(targetPos) > 0.5) {
        moveDir = dirToTarget
        isMoving = true
        this.player.position.add(moveDir.multiplyScalar(this.playerSpeed * dt))
        
        const targetRotY = Math.atan2(moveDir.x, moveDir.z)
        this.player.rotation.y = targetRotY
      } else {
        this.playerPathIndex++
        if (this.playerPathIndex >= this.playerPath.length) {
          const targetFarm = this.playerTarget
          this.playerPath = null
          this.playerPathIndex = 0
          this.playerTarget = null
          
          if (targetFarm && targetFarm.userData) {
            if (targetFarm.userData.type === 'farm') {
              const planted = this.game.plantCrop(targetFarm)
              if (planted) {
                // UI toast 会在 InputHandler 中处理
              } else {
                // UI toast 会在 InputHandler 中处理
              }
            } else if (targetFarm.userData.type === 'tree') {
              this.playerHarvesting = true
              setTimeout(() => {
                const harvested = this.game.harvestTree(targetFarm)
                if (harvested) {
                  // UI toast 会在 InputHandler 中处理
                }
                this.playerHarvesting = false
              }, 1000)
            } else if (targetFarm.userData.type === 'rock') {
              this.playerHarvesting = true
              setTimeout(() => {
                const harvested = this.game.harvestRock(targetFarm)
                if (harvested) {
                  // UI toast 会在 InputHandler 中处理
                }
                this.playerHarvesting = false
              }, 1000)
            } else if (targetFarm.userData.type === 'gold') {
              this.playerHarvesting = true
              setTimeout(() => {
                const harvested = this.game.harvestGold(targetFarm)
                if (harvested) {
                  // UI toast 会在 InputHandler 中处理
                }
                this.playerHarvesting = false
              }, 1000)
            }
          }
        }
      }
    } else {
      if (this.movement.forward !== 0) moveDir.add(forward.clone().multiplyScalar(this.movement.forward))
      if (this.movement.right !== 0) moveDir.add(right.clone().multiplyScalar(this.movement.right))
      
      if (moveDir.lengthSq() > 0) {
        isMoving = true
        moveDir.normalize()
        this.player.position.add(moveDir.multiplyScalar(this.playerSpeed * dt))
        
        const targetRotY = Math.atan2(moveDir.x, moveDir.z)
        this.player.rotation.y = targetRotY
      }
    }

    this.player.position.y = 0.7
    const limit = 145
    this.player.position.x = Math.max(-limit, Math.min(limit, this.player.position.x))
    this.player.position.z = Math.max(-limit, Math.min(limit, this.player.position.z))

    // 更新小猫跟随逻辑
    this.game.updateCats(dt, this.player.position, this.player.rotation.y)

    // 宠物逻辑：跟随玩家（保留原有逻辑，但可能不再需要）
    if (this.pet) {
      // 计算目标位置（玩家身后）
      const playerRot = this.player.rotation.y
      const offsetDist = 1.5
      const backX = -Math.sin(playerRot) * offsetDist
      const backZ = -Math.cos(playerRot) * offsetDist
      
      const targetX = this.player.position.x + backX
      const targetZ = this.player.position.z + backZ
      const targetPos = new THREE.Vector3(targetX, this.player.position.y, targetZ)
      
      const dist = this.pet.position.distanceTo(targetPos)
      if (dist > 0.1) {
        // 速度是玩家的一半
        const speed = this.playerSpeed * 0.5
        const moveDist = Math.min(dist, speed * dt)
        
        const dir = targetPos.clone().sub(this.pet.position).normalize()
        this.pet.position.add(dir.multiplyScalar(moveDist))
        this.pet.position.y = 0.7 + Math.sin(Date.now() * 0.015) * 0.05 // 简单的浮动动画
        
        // 面向移动方向
        if (moveDist > 0.001) {
          // 模型本身的朝向可能需要修正（如果模型默认朝向不是+Z）
          // 这里假设模型默认朝向是+X，所以需要减去90度（Math.PI/2）或者加上90度
          const targetRot = Math.atan2(dir.x, dir.z) + Math.PI / 2
          let rotDiff = targetRot - this.pet.rotation.y
          while (rotDiff > Math.PI) rotDiff -= Math.PI * 2
          while (rotDiff < -Math.PI) rotDiff += Math.PI * 2
          this.pet.rotation.y += rotDiff * dt * 5
        }
      } else {
        // 停止时也要保持浮动
        this.pet.position.y = 0.7 + Math.sin(Date.now() * 0.005) * 0.02
        
        // 停止时，宠物面向玩家
        const dx = this.player.position.x - this.pet.position.x
        const dz = this.player.position.z - this.pet.position.z
        // 同样修正朝向：目标角度 + 90度
        const targetRot = Math.atan2(dx, dz) + Math.PI / 2
        let rotDiff = targetRot - this.pet.rotation.y
        while (rotDiff > Math.PI) rotDiff -= Math.PI * 2
        while (rotDiff < -Math.PI) rotDiff += Math.PI * 2
        this.pet.rotation.y += rotDiff * dt * 3
      }
    }

    const limbs = this.player.userData && this.player.userData.limbs

    if (isMoving) {
      this.player._walkPhase = (this.player._walkPhase || 0) + dt * 10
      const phase = this.player._walkPhase
      if (limbs) {
        const legAmp = 0.45
        const armAmp = 0.7
        limbs.legL.rotation.x = 0.1 + Math.sin(phase) * legAmp
        limbs.legR.rotation.x = -0.1 - Math.sin(phase) * legAmp
        limbs.armL.rotation.x = Math.sin(phase + Math.PI) * armAmp
        limbs.armR.rotation.x = Math.sin(phase) * armAmp
      }
    } else {
      if (limbs) {
        limbs.legL.rotation.x += (0.1 - limbs.legL.rotation.x) * 6 * dt
        limbs.legR.rotation.x += (-0.1 - limbs.legR.rotation.x) * 6 * dt
        limbs.armL.rotation.x += (0 - limbs.armL.rotation.x) * 6 * dt
        limbs.armR.rotation.x += (0 - limbs.armR.rotation.x) * 6 * dt
      }
    }

    // 根据玩家是否移动来决定相机行为
    if (isMoving) {
      // 玩家移动时，相机跟随玩家
      this.cameraSys.setFollowPlayer(true)
      this.cameraSys.setPlayerPosition(this.player.position)
      
      const controls = this.cameraSys.getControls()
      const prevTarget = controls.target.clone()
      const prevDist = cam.position.distanceTo(prevTarget)
      const desiredTarget = new THREE.Vector3(this.player.position.x, this.player.position.y + 1.2, this.player.position.z)
      controls.target.lerp(desiredTarget, 0.15)
      const dir = cam.position.clone().sub(prevTarget).normalize()
      cam.position.copy(controls.target).add(dir.multiplyScalar(prevDist))
    } else {
      // 玩家不移动时，允许相机使用方向键平移
      this.cameraSys.setFollowPlayer(false)
    }
  }

  getPlayer() {
    return this.player
  }

  setTarget(target, path) {
    this.playerTarget = target
    this.playerPath = path
    this.playerPathIndex = 0
  }
}

