import * as THREE from 'three'

// 输入处理相关功能
export class InputHandler {
  constructor(game, ui, playerController, container, cameraSys) {
    this.game = game
    this.ui = ui
    this.playerController = playerController
    this.container = container
    this.cameraSys = cameraSys
    this.raycaster = new THREE.Raycaster()
    
    this.container.addEventListener('pointerdown', (e) => this.onPointerDown(e))
  }

  onPointerDown(e) {
    const rect = this.container.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    this.raycaster.setFromCamera({ x, y }, this.cameraSys.getCamera())
    
    if (this.game.state.pendingDemolish) {
      for (const struct of this.game.state.structures) {
        if (!struct.mesh) continue
        if (struct.type === 'foundation' && !struct.completed) continue
        const intersects = this.raycaster.intersectObject(struct.mesh, true)
        if (intersects.length > 0) {
          const assigned = this.game.assignDemolishWork(struct)
          if (assigned) {
            this.ui.toast('已分配工人拆除建筑')
            this.game.state.pendingDemolish = false
          } else {
            this.ui.toast('没有空闲工人')
          }
          return
        }
      }
      this.ui.toast('请点击要删除的建筑')
      return
    }
    
    let clickedGold = null
    for (const goldObj of this.game.goldMines) {
      if (goldObj.harvested) continue
      const intersects = this.raycaster.intersectObject(goldObj.mesh, true)
      if (intersects.length > 0) {
        clickedGold = goldObj.mesh
        break
      }
    }
    
    if (clickedGold) {
      const targetPos = clickedGold.position.clone()
      const angle = Math.random() * Math.PI * 2
      const offset = new THREE.Vector3(Math.cos(angle) * 2, 0, Math.sin(angle) * 2)
      targetPos.add(offset)
      targetPos.y = 0.7
      
      this.game.ai.findPath(
        { x: this.playerController.getPlayer().position.x, y: this.playerController.getPlayer().position.y, z: this.playerController.getPlayer().position.z },
        { x: targetPos.x, y: targetPos.y, z: targetPos.z }
      ).then(path => {
        this.playerController.setTarget(clickedGold, path)
        this.ui.toast('正在前往金矿...')
      })
      return
    }
    
    let clickedRock = null
    for (const rockObj of this.game.rocks) {
      if (rockObj.harvested) continue
      const intersects = this.raycaster.intersectObject(rockObj.mesh, true)
      if (intersects.length > 0) {
        clickedRock = rockObj.mesh
        break
      }
    }
    
    if (clickedRock) {
      const targetPos = clickedRock.position.clone()
      const angle = Math.random() * Math.PI * 2
      const offset = new THREE.Vector3(Math.cos(angle) * 2, 0, Math.sin(angle) * 2)
      targetPos.add(offset)
      targetPos.y = 0.7
      
      this.game.ai.findPath(
        { x: this.playerController.getPlayer().position.x, y: this.playerController.getPlayer().position.y, z: this.playerController.getPlayer().position.z },
        { x: targetPos.x, y: targetPos.y, z: targetPos.z }
      ).then(path => {
        this.playerController.setTarget(clickedRock, path)
        this.ui.toast('正在前往石山...')
      })
      return
    }
    
    let clickedTree = null
    for (const treeObj of this.game.trees) {
      if (treeObj.harvested) continue
      const intersects = this.raycaster.intersectObject(treeObj.mesh, true)
      if (intersects.length > 0) {
        clickedTree = treeObj.mesh
        break
      }
    }
    
    if (clickedTree) {
      const targetPos = clickedTree.position.clone()
      const angle = Math.random() * Math.PI * 2
      const offset = new THREE.Vector3(Math.cos(angle) * 2, 0, Math.sin(angle) * 2)
      targetPos.add(offset)
      targetPos.y = 0.7
      
      this.game.ai.findPath(
        { x: this.playerController.getPlayer().position.x, y: this.playerController.getPlayer().position.y, z: this.playerController.getPlayer().position.z },
        { x: targetPos.x, y: targetPos.y, z: targetPos.z }
      ).then(path => {
        this.playerController.setTarget(clickedTree, path)
        this.ui.toast('正在前往树木...')
      })
      return
    }
    
    // 检查是否点击了小猫（优先于其他动物）
    let clickedCat = null
    const cats = this.game.getAllCats()
    for (const cat of cats) {
      if (!cat.userData.following) {  // 只检测未跟随的小猫
        const intersects = this.raycaster.intersectObject(cat, true)
        if (intersects.length > 0) {
          clickedCat = cat
          break
        }
      }
    }
    
    if (clickedCat) {
      // 让小猫跟随玩家
      const playerPos = this.playerController.getPlayer().position
      const followed = this.game.makeCatFollow(clickedCat, playerPos)
      if (followed) {
        this.ui.toast('小猫开始跟随你了！')
      }
      return
    }
    
    let clickedAnimal = null
    const animals = this.game.scene.children.filter(child => child.userData && child.userData.animal)
    for (const animal of animals) {
      const intersects = this.raycaster.intersectObject(animal, true)
      if (intersects.length > 0) {
        clickedAnimal = animal
        break
      }
    }
    
    if (clickedAnimal) {
      const animalPos = clickedAnimal.position.clone()
      const clickPos = this.raycaster.ray.origin.clone()
      const direction = new THREE.Vector3()
      direction.subVectors(animalPos, clickPos)
      direction.y = 0
      direction.normalize()
      
      if (direction.length() === 0) {
        const angle = Math.random() * Math.PI * 2
        direction.set(Math.cos(angle), 0, Math.sin(angle))
      }
      
      const runDistance = 5 + Math.random() * 5
      const targetPos = animalPos.clone().add(direction.multiplyScalar(runDistance))
      
      const limit = 145
      targetPos.x = Math.max(-limit, Math.min(limit, targetPos.x))
      targetPos.z = Math.max(-limit, Math.min(limit, targetPos.z))
      targetPos.y = 0
      
      this.game.makeAnimalRun(clickedAnimal, targetPos)
      
      const animalNames = { sheep: '小羊', pig: '小猪', cow: '小牛' }
      const animalName = animalNames[clickedAnimal.userData.type] || clickedAnimal.userData.type
      this.ui.toast(`${animalName}被吓跑了！`)
      return
    }
    
    let clickedCrop = null
    const farmStructures = this.game.state.structures.filter(s => s.type === 'farm' && s.mesh)
    for (const farmStruct of farmStructures) {
      if (!farmStruct.mesh.userData.crops) continue
      for (const crop of farmStruct.mesh.userData.crops) {
        if (['carrot', 'watermelon', 'grape'].includes(crop.userData.type) && crop.userData.isMature) {
          const intersects = this.raycaster.intersectObject(crop, true)
          if (intersects.length > 0) {
            clickedCrop = crop
            break
          }
        }
      }
      if (clickedCrop) break
    }
    
    if (clickedCrop) {
      const harvested = this.game.harvestCrop(clickedCrop)
      if (harvested) {
        const cropNames = { carrot: '胡萝卜', watermelon: '西瓜', grape: '葡萄' }
        const cropName = cropNames[clickedCrop.userData.type] || clickedCrop.userData.type
        const foodReward = this.game.state.getFoodReward()
        this.ui.toast(`收获${cropName}，获得 ${foodReward} 食物`)
      } else {
        const cropNames = { carrot: '胡萝卜', watermelon: '西瓜', grape: '葡萄' }
        const cropName = cropNames[clickedCrop.userData.type] || clickedCrop.userData.type
        this.ui.toast(`${cropName}还未成熟`)
      }
      return
    }
    
    let clickedFarm = null
    const groundInter = this.raycaster.intersectObject(this.game.ground, false)[0]
    if (groundInter && groundInter.point) {
      for (const farmStruct of farmStructures) {
        const farmMesh = farmStruct.mesh
        const farmPos = farmMesh.position
        const clickPos = groundInter.point
        
        const distX = Math.abs(clickPos.x - farmPos.x)
        const distZ = Math.abs(clickPos.z - farmPos.z)
        
        if (distX <= 2 && distZ <= 2) {
          clickedFarm = farmMesh
          break
        }
      }
    }
    
    if (clickedFarm) {
      if (this.game.state.pendingPlant) {
        const planted = this.game.plantCrop(clickedFarm, this.game.state.pendingCropType)
        if (planted) {
          const cropNames = { carrot: '胡萝卜', watermelon: '西瓜', grape: '葡萄' }
          const cropName = cropNames[this.game.state.pendingCropType] || this.game.state.pendingCropType
          this.ui.toast(`已种植${cropName}`)
          this.game.state.pendingPlant = false
        } else {
          this.ui.toast('该农田已有农作物或未解锁')
        }
        return
      } else {
        const targetPos = clickedFarm.position.clone()
        const angle = Math.random() * Math.PI * 2
        const offset = new THREE.Vector3(Math.cos(angle) * 3, 0, Math.sin(angle) * 3)
        targetPos.add(offset)
        targetPos.y = 0.7
        
        this.game.ai.findPath(
          { x: this.playerController.getPlayer().position.x, y: this.playerController.getPlayer().position.y, z: this.playerController.getPlayer().position.z },
          { x: targetPos.x, y: targetPos.y, z: targetPos.z }
        ).then(path => {
          this.playerController.setTarget(clickedFarm, path)
          this.ui.toast('正在前往农田...')
        })
        return
      }
    }
    
    if (this.game.state.pendingSpawnAnimal) {
      const inter = this.raycaster.intersectObject(this.game.ground, false)[0]
      if (inter && inter.point) {
        // 检查资源：10金币10食物
        const animalCost = { gold: 10, food: 10 }
        if (!this.game.state.resources.has(animalCost)) {
          this.ui.toast('资源不足：需要10金币和10食物')
          // 资源不足时不取消模式，允许玩家补充资源后继续放置
          return
        }
        
        // 扣除资源
        this.game.state.resources.consume(animalCost)
        
        let animal
        if (this.game.state.pendingAnimalType === 'sheep') {
          animal = this.game.createSheep(inter.point)
        } else if (this.game.state.pendingAnimalType === 'pig') {
          animal = this.game.createPig(inter.point)
        } else if (this.game.state.pendingAnimalType === 'cow') {
          animal = this.game.createCow(inter.point)
        }
        if (animal) {
          this.game.scene.add(animal)
          this.game.state.animals.push(animal)
          const animalNames = { sheep: '小羊', pig: '小猪', cow: '小牛' }
          const animalName = animalNames[this.game.state.pendingAnimalType] || this.game.state.pendingAnimalType
          this.ui.toast(`已放置${animalName}`)
          
          // 获得经验奖励
          const leveledUp = this.game.state.addPlayerExp(this.game.state.getExpReward())
          if (leveledUp) {
            this.ui.toast(`玩家升级到 ${this.game.state.playerLevel} 级！解锁新建筑！`)
            if (this.game.onLevelUp) this.game.onLevelUp()
          }
          
          // 保持连续放置模式，不取消 pendingSpawnAnimal
        }
      }
      return
    }
    
    if (!this.game.state.pendingBuild) return
    const inter = this.raycaster.intersectObject(this.game.ground, false)[0]
    if (inter && inter.point) {
      const ok = this.game.addFoundationAt(inter.point, this.game.state.pendingType)
      if (ok) { 
        this.ui.toast('已安置地基')
        this.game.state.pendingBuild = false
      } else { 
        this.ui.toast('资源不足')
      }
    }
  }
}

