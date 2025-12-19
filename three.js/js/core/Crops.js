import * as THREE from 'https://unpkg.com/three@0.164.0/build/three.module.js'
import { t } from '../i18n.js'

// 农作物相关功能
export class Crops {
  constructor(game) {
    this.game = game
  }

  createCrop(at, cropType = 'carrot') {
    const group = new THREE.Group()
    
    if (cropType === 'carrot') {
      const carrotMat = new THREE.MeshStandardMaterial({ color: 0xff8c00 })
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x4caf50 })
      
      const carrot = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.5, 12), carrotMat)
      carrot.position.set(0, 0.25, 0)
      carrot.rotation.z = Math.PI
      carrot.castShadow = true
      carrot.receiveShadow = true
      group.add(carrot)
      
      const leafCount = 4
      for (let i = 0; i < leafCount; i++) {
        const angle = (i / leafCount) * Math.PI * 2
        const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.3, 0.02), leafMat)
        leaf.position.set(Math.cos(angle) * 0.1, 0.55, Math.sin(angle) * 0.1)
        leaf.rotation.z = Math.cos(angle) * 0.3
        leaf.rotation.x = Math.sin(angle) * 0.3
        leaf.castShadow = true
        group.add(leaf)
      }
      
      group.userData.type = 'carrot'
      group.userData.matureTime = 10
      group.userData.cropMesh = carrot
    } else if (cropType === 'watermelon') {
      const watermelonMat = new THREE.MeshStandardMaterial({ color: 0x228B22 })
      const watermelon = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), watermelonMat)
      watermelon.position.set(0, 0.4, 0)
      watermelon.castShadow = true
      watermelon.receiveShadow = true
      group.add(watermelon)
      
      const vineMat = new THREE.MeshStandardMaterial({ color: 0x2d5016 })
      const vine = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8), vineMat)
      vine.position.set(0, 0.15, 0)
      vine.rotation.z = Math.PI / 4
      vine.castShadow = true
      group.add(vine)
      
      group.userData.type = 'watermelon'
      group.userData.matureTime = 15
      group.userData.cropMesh = watermelon
    } else if (cropType === 'grape') {
      const grapeMat = new THREE.MeshStandardMaterial({ color: 0x8B00FF })
      const grapeCount = 8
      for (let i = 0; i < grapeCount; i++) {
        const angle = (i / grapeCount) * Math.PI * 2
        const radius = 0.15
        const grape = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), grapeMat)
        grape.position.set(
          Math.cos(angle) * radius,
          0.2 + Math.sin(i * 0.5) * 0.1,
          Math.sin(angle) * radius
        )
        grape.castShadow = true
        grape.receiveShadow = true
        group.add(grape)
      }
      
      const vineMat = new THREE.MeshStandardMaterial({ color: 0x2d5016 })
      const vine = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8), vineMat)
      vine.position.set(0, 0.2, 0)
      vine.castShadow = true
      group.add(vine)
      
      group.userData.type = 'grape'
      group.userData.matureTime = 12
      group.userData.cropMesh = group.children[0]
    }
    
    group.position.copy(at)
    group.position.y = 0
    group.castShadow = true
    group.receiveShadow = true
    
    group.userData.plantTime = this.game.state.time
    group.userData.isMature = false
    
    return group
  }

  plantCrop(farmMesh, cropType = 'carrot') {
    if (!farmMesh || !farmMesh.userData || farmMesh.userData.type !== 'farm') return false
    
    if (!this.game.state.isCropUnlocked(cropType)) {
      const requiredLevel = this.game.state.getCropRequiredLevel(cropType)
      const cropName = t(`crop.${cropType}`) || cropType
      this.game.notify(t('msg.needLevel', { name: cropName, required: requiredLevel, current: this.game.state.playerLevel }))
      return false
    }
    
    if (!farmMesh.userData.crops) farmMesh.userData.crops = []
    if (farmMesh.userData.crops.length > 0) {
      return false
    }
    
    const plantPos = farmMesh.position.clone()
    plantPos.y = 0
    
    const crop = this.createCrop(plantPos, cropType)
    crop.userData.plantTime = this.game.state.time
    const progressBar = this.game.uiComponents.createCropProgressBar()
    crop.userData.progressBar = progressBar
    this.game.scene.add(crop)
    this.game.scene.add(progressBar)
    
    farmMesh.userData.crops.push(crop)
    
    return true
  }

  harvestCrop(cropMesh) {
    if (!cropMesh || !['carrot', 'watermelon', 'grape'].includes(cropMesh.userData.type)) return false
    if (!cropMesh.userData.isMature) return false
    
    const farmStruct = this.game.state.structures.find(s => 
      s.type === 'farm' && 
      s.mesh && 
      s.mesh.userData.crops && 
      s.mesh.userData.crops.includes(cropMesh)
    )
    
    if (farmStruct && farmStruct.mesh) {
      const cropIndex = farmStruct.mesh.userData.crops.indexOf(cropMesh)
      if (cropIndex >= 0) {
        farmStruct.mesh.userData.crops.splice(cropIndex, 1)
      }
    }
    
    const leveledUp = this.game.state.addPlayerExp(this.game.state.getExpReward())
    if (leveledUp) {
      this.game.notify(t('msg.levelUp', { level: this.game.state.playerLevel }))
      if (this.game.onLevelUp) this.game.onLevelUp()
    }
    
    if (cropMesh.userData.progressBar) {
      this.game.scene.remove(cropMesh.userData.progressBar)
    }
    
    this.game.scene.remove(cropMesh)
    
    this.game.state.resources.add({ food: this.game.state.getFoodReward() })
    
    return true
  }
}

