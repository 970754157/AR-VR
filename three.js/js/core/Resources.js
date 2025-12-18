import * as THREE from 'https://unpkg.com/three@0.164.0/build/three.module.js'

// 资源采集相关功能（树木、石头、金矿）
export class Resources {
  constructor(game) {
    this.game = game
    this.trees = []
    this.rocks = []
    this.goldMines = []
  }

  createForest() {
    const forestCenter = new THREE.Vector3(80, 0, 80)
    const forestSize = 100
    
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x5a7a4a })
    const groundGroup = new THREE.Group()
    const segmentCount = 0
    for (let i = 0; i < segmentCount; i++) {
      const angle = (i / segmentCount) * Math.PI * 2 + Math.random() * 0.4
      const radius = 15 + Math.random() * (forestSize / 2 - 15)
      const size = 20 + Math.random() * 25
      
      const segment = new THREE.Mesh(
        new THREE.PlaneGeometry(size, size),
        groundMat
      )
      segment.rotation.x = -Math.PI / 2
      segment.position.set(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      )
      segment.receiveShadow = true
      segment.castShadow = false
      groundGroup.add(segment)
    }
    groundGroup.position.copy(forestCenter)
    
    const treeCount = 35 + Math.floor(Math.random() * 15)
    for (let i = 0; i < treeCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * (forestSize / 2) * (0.6 + Math.random() * 0.4)
      const offsetX = Math.cos(angle) * radius + (Math.random() - 0.5) * 10
      const offsetZ = Math.sin(angle) * radius + (Math.random() - 0.5) * 10
      
      const treePos = forestCenter.clone().add(new THREE.Vector3(offsetX, 0, offsetZ))
      
      const tree = this.createTree(treePos)
      this.game.scene.add(tree)
      this.trees.push({
        mesh: tree,
        position: treePos,
        harvested: false
      })
    }
  }

  createTree(at) {
    const group = new THREE.Group()
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 })
    const leavesMat = new THREE.MeshStandardMaterial({ color: 0x228b22 })
    
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 4.0, 12), trunkMat)
    trunk.position.set(0, 2.0, 0)
    trunk.castShadow = true
    trunk.receiveShadow = true
    group.add(trunk)
    
    const leaves = new THREE.Mesh(new THREE.SphereGeometry(1.8, 16, 16), leavesMat)
    leaves.position.set(0, 4.5, 0)
    leaves.scale.y = 1.2
    leaves.castShadow = true
    leaves.receiveShadow = true
    group.add(leaves)
    
    const scale = 1.0 + Math.random() * 0.5
    group.scale.setScalar(scale)
    group.rotation.y = Math.random() * Math.PI * 2
    
    group.position.copy(at)
    group.position.y = 0
    group.userData.type = 'tree'
    group.castShadow = true
    group.receiveShadow = true
    
    return group
  }

  harvestTree(treeMesh) {
    if (!treeMesh || treeMesh.userData.type !== 'tree') return false
    
    const treeObj = this.trees.find(t => t.mesh === treeMesh)
    if (!treeObj || treeObj.harvested) return false
    
    treeObj.harvested = true
    treeObj.harvestTime = this.game.state.time
    
    treeMesh.visible = false
    
    this.game.state.resources.add({ wood: this.game.state.getWoodReward() })
    
    const leveledUp = this.game.state.addPlayerExp(this.game.state.getExpReward())
    if (leveledUp) {
      this.game.notify(`玩家升级到 ${this.game.state.playerLevel} 级！解锁新建筑！`)
      if (this.game.onLevelUp) this.game.onLevelUp()
    }
    
    return true
  }

  createMountain() {
    const mapLimit = 145
    const mountainMat = new THREE.MeshStandardMaterial({ color: 0x707070 })
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x5a5a5a })
    const lightMat = new THREE.MeshStandardMaterial({ color: 0x808080 })
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x6b6b6b })
    
    const cornerCenter = new THREE.Vector3(-mapLimit + 30, 0, -mapLimit + 30)
    const areaSize = 80
    
    const groundGroup = new THREE.Group()
    const segmentCount = 8 + Math.floor(Math.random() * 5)
    for (let i = 0; i < segmentCount; i++) {
      const angle = (i / segmentCount) * Math.PI * 2 + Math.random() * 0.3
      const radius = 10 + Math.random() * (areaSize / 2 - 10)
      const size = 15 + Math.random() * 20
      
      const segment = new THREE.Mesh(
        new THREE.PlaneGeometry(size, size),
        groundMat
      )
      segment.rotation.x = -Math.PI / 2
      segment.position.set(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      )
      segment.receiveShadow = true
      segment.castShadow = false
      groundGroup.add(segment)
    }
    groundGroup.position.copy(cornerCenter)
    
    const mountainCount = 12 + Math.floor(Math.random() * 8)
    for (let m = 0; m < mountainCount; m++) {
      const offsetX = (Math.random() - 0.3) * areaSize
      const offsetZ = (Math.random() - 0.3) * areaSize
      const mountainCenter = cornerCenter.clone().add(new THREE.Vector3(offsetX, 0, offsetZ))
      
      const mountainGroup = new THREE.Group()
      const blockCount = 2 + Math.floor(Math.random() * 4)
      
      for (let i = 0; i < blockCount; i++) {
        const blockSize = 6 + Math.random() * 14
        const blockHeight = 5 + Math.random() * 18
        const offsetX = (Math.random() - 0.5) * 12
        const offsetZ = (Math.random() - 0.5) * 12
        const offsetY = blockHeight / 2
        
        const block = new THREE.Mesh(
          new THREE.BoxGeometry(blockSize, blockHeight, blockSize),
          Math.random() > 0.5 ? (Math.random() > 0.5 ? mountainMat : darkMat) : lightMat
        )
        block.position.set(offsetX, offsetY, offsetZ)
        block.rotation.set(
          Math.random() * 0.4,
          Math.random() * Math.PI * 2,
          Math.random() * 0.4
        )
        block.castShadow = true
        block.receiveShadow = true
        mountainGroup.add(block)
      }
      
      const smallBlockCount = 1 + Math.floor(Math.random() * 4)
      for (let i = 0; i < smallBlockCount; i++) {
        const smallSize = 2 + Math.random() * 5
        const smallHeight = 2 + Math.random() * 8
        const offsetX = (Math.random() - 0.5) * 18
        const offsetZ = (Math.random() - 0.5) * 18
        
        const smallBlock = new THREE.Mesh(
          new THREE.BoxGeometry(smallSize, smallHeight, smallSize),
          Math.random() > 0.5 ? darkMat : lightMat
        )
        smallBlock.position.set(offsetX, smallHeight / 2, offsetZ)
        smallBlock.rotation.set(
          Math.random() * 0.6,
          Math.random() * Math.PI * 2,
          Math.random() * 0.6
        )
        smallBlock.castShadow = true
        smallBlock.receiveShadow = true
        mountainGroup.add(smallBlock)
      }
      
      mountainGroup.position.copy(mountainCenter)
      mountainGroup.rotation.y = Math.random() * Math.PI * 2
      this.game.scene.add(mountainGroup)
    }
    
    const rockCount = 15 + Math.floor(Math.random() * 10)
    for (let i = 0; i < rockCount; i++) {
      const offsetX = (Math.random() - 0.3) * areaSize
      const offsetZ = (Math.random() - 0.3) * areaSize
      const angle = Math.random() * Math.PI * 2
      const radius = 2 + Math.random() * 8
      const height = 0.5 + Math.random() * 15
      
      const rockPos = cornerCenter.clone().add(new THREE.Vector3(
        offsetX + Math.cos(angle) * radius,
        height,
        offsetZ + Math.sin(angle) * radius
      ))
      
      const rock = this.createRock(rockPos)
      this.game.scene.add(rock)
      this.rocks.push({
        mesh: rock,
        position: rockPos,
        harvested: false
      })
    }
  }

  createRock(at) {
    const group = new THREE.Group()
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x808080 })
    
    const mainRock = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.8, 2.0), rockMat)
    mainRock.position.set(0, 0.9, 0)
    mainRock.rotation.set(
      Math.random() * 0.4,
      Math.random() * Math.PI * 2,
      Math.random() * 0.4
    )
    mainRock.castShadow = true
    mainRock.receiveShadow = true
    group.add(mainRock)
    
    for (let i = 0; i < 2; i++) {
      const mediumRock = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.6, 0.8),
        rockMat
      )
      const angle = (i / 2) * Math.PI * 2
      const radius = 1.0
      mediumRock.position.set(
        Math.cos(angle) * radius,
        0.3 + Math.random() * 0.3,
        Math.sin(angle) * radius
      )
      mediumRock.rotation.set(
        Math.random() * 0.6,
        Math.random() * Math.PI * 2,
        Math.random() * 0.6
      )
      mediumRock.castShadow = true
      mediumRock.receiveShadow = true
      group.add(mediumRock)
    }
    
    const scale = 0.8 + Math.random() * 0.4
    group.scale.setScalar(scale)
    
    group.position.copy(at)
    group.userData.type = 'rock'
    group.castShadow = true
    group.receiveShadow = true
    
    return group
  }

  harvestRock(rockMesh) {
    if (!rockMesh || rockMesh.userData.type !== 'rock') return false
    
    const rockObj = this.rocks.find(r => r.mesh === rockMesh)
    if (!rockObj || rockObj.harvested) return false
    
    rockObj.harvested = true
    
    this.game.scene.remove(rockMesh)
    
    this.game.state.resources.add({ stone: this.game.state.getStoneReward() })
    
    const leveledUp = this.game.state.addPlayerExp(this.game.state.getExpReward())
    if (leveledUp) {
      this.game.notify(`玩家升级到 ${this.game.state.playerLevel} 级！解锁新建筑！`)
      if (this.game.onLevelUp) this.game.onLevelUp()
    }
    
    return true
  }

  createGoldMine() {
    const mapLimit = 145
    const mineMat = new THREE.MeshStandardMaterial({ color: 0x9d7a1a })
    const darkGoldMat = new THREE.MeshStandardMaterial({ color: 0x8b6914, emissive: 0x2a1a0a, emissiveIntensity: 0.15 })
    const brightGoldMat = new THREE.MeshStandardMaterial({ color: 0xb8860b, emissive: 0x4a3a0a, emissiveIntensity: 0.25 })
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x8b6914 })
    
    const mineCenter = new THREE.Vector3(-mapLimit + 110, 0, -mapLimit + 30)
    const areaSize = 60
    
    const groundGroup = new THREE.Group()
    const segmentCount = 6 + Math.floor(Math.random() * 4)
    for (let i = 0; i < segmentCount; i++) {
      const angle = (i / segmentCount) * Math.PI * 2 + Math.random() * 0.3
      const radius = 8 + Math.random() * (areaSize / 2 - 8)
      const size = 12 + Math.random() * 18
      
      const segment = new THREE.Mesh(
        new THREE.PlaneGeometry(size, size),
        groundMat
      )
      segment.rotation.x = -Math.PI / 2
      segment.position.set(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      )
      segment.receiveShadow = true
      segment.castShadow = false
      groundGroup.add(segment)
    }
    groundGroup.position.copy(mineCenter)
    
    const mineCount = 8 + Math.floor(Math.random() * 6)
    for (let m = 0; m < mineCount; m++) {
      const offsetX = (Math.random() - 0.5) * areaSize
      const offsetZ = (Math.random() - 0.5) * areaSize
      const goldMineCenter = mineCenter.clone().add(new THREE.Vector3(offsetX, 0, offsetZ))
      
      const mineGroup = new THREE.Group()
      const blockCount = 2 + Math.floor(Math.random() * 4)
      
      for (let i = 0; i < blockCount; i++) {
        const blockSize = 5 + Math.random() * 12
        const blockHeight = 2 + Math.random() * 8
        const offsetX = (Math.random() - 0.5) * 10
        const offsetZ = (Math.random() - 0.5) * 10
        const offsetY = blockHeight / 2
        
        const mat = Math.random() > 0.5 ? 
          (Math.random() > 0.5 ? mineMat : darkGoldMat) : 
          brightGoldMat
        
        const block = new THREE.Mesh(
          new THREE.BoxGeometry(blockSize, blockHeight, blockSize),
          mat
        )
        block.position.set(offsetX, offsetY, offsetZ)
        block.rotation.set(
          Math.random() * 0.4,
          Math.random() * Math.PI * 2,
          Math.random() * 0.4
        )
        block.castShadow = true
        block.receiveShadow = true
        mineGroup.add(block)
      }
      
      const smallBlockCount = 1 + Math.floor(Math.random() * 3)
      for (let i = 0; i < smallBlockCount; i++) {
        const smallSize = 2 + Math.random() * 4
        const smallHeight = 1 + Math.random() * 4
        const offsetX = (Math.random() - 0.5) * 15
        const offsetZ = (Math.random() - 0.5) * 15
        
        const smallBlock = new THREE.Mesh(
          new THREE.BoxGeometry(smallSize, smallHeight, smallSize),
          Math.random() > 0.5 ? brightGoldMat : darkGoldMat
        )
        smallBlock.position.set(offsetX, smallHeight / 2, offsetZ)
        smallBlock.rotation.set(
          Math.random() * 0.6,
          Math.random() * Math.PI * 2,
          Math.random() * 0.6
        )
        smallBlock.castShadow = true
        smallBlock.receiveShadow = true
        mineGroup.add(smallBlock)
      }
      
      mineGroup.position.copy(goldMineCenter)
      mineGroup.rotation.y = Math.random() * Math.PI * 2
      this.game.scene.add(mineGroup)
    }
    
    const goldCount = 10 + Math.floor(Math.random() * 8)
    for (let i = 0; i < goldCount; i++) {
      const offsetX = (Math.random() - 0.5) * areaSize
      const offsetZ = (Math.random() - 0.5) * areaSize
      const angle = Math.random() * Math.PI * 2
      const radius = 2 + Math.random() * 6
      const height = 0.5 + Math.random() * 5
      
      const goldPos = mineCenter.clone().add(new THREE.Vector3(
        offsetX + Math.cos(angle) * radius,
        height,
        offsetZ + Math.sin(angle) * radius
      ))
      
      const gold = this.createGoldOre(goldPos)
      this.game.scene.add(gold)
      this.goldMines.push({
        mesh: gold,
        position: goldPos,
        harvested: false
      })
    }
  }

  createGoldOre(at) {
    const group = new THREE.Group()
    const goldMat = new THREE.MeshStandardMaterial({ 
      color: 0xffd700,
      emissive: 0x4a3a0a,
      emissiveIntensity: 0.3
    })
    
    const mainGold = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.0, 2.2), goldMat)
    mainGold.position.set(0, 1.0, 0)
    mainGold.rotation.set(
      Math.random() * 0.4,
      Math.random() * Math.PI * 2,
      Math.random() * 0.4
    )
    mainGold.castShadow = true
    mainGold.receiveShadow = true
    group.add(mainGold)
    
    for (let i = 0; i < 2; i++) {
      const smallGold = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.7, 0.9),
        goldMat
      )
      const angle = (i / 2) * Math.PI * 2
      const radius = 1.2
      smallGold.position.set(
        Math.cos(angle) * radius,
        0.35 + Math.random() * 0.3,
        Math.sin(angle) * radius
      )
      smallGold.rotation.set(
        Math.random() * 0.6,
        Math.random() * Math.PI * 2,
        Math.random() * 0.6
      )
      smallGold.castShadow = true
      smallGold.receiveShadow = true
      group.add(smallGold)
    }
    
    const scale = 0.85 + Math.random() * 0.3
    group.scale.setScalar(scale)
    
    group.position.copy(at)
    group.userData.type = 'gold'
    group.castShadow = true
    group.receiveShadow = true
    
    return group
  }

  harvestGold(goldMesh) {
    if (!goldMesh || goldMesh.userData.type !== 'gold') return false
    
    const goldObj = this.goldMines.find(g => g.mesh === goldMesh)
    if (!goldObj || goldObj.harvested) return false
    
    goldObj.harvested = true
    
    this.game.scene.remove(goldMesh)
    
    this.game.state.resources.add({ gold: this.game.state.getGoldReward() })
    
    const leveledUp = this.game.state.addPlayerExp(this.game.state.getExpReward())
    if (leveledUp) {
      this.game.notify(`玩家升级到 ${this.game.state.playerLevel} 级！解锁新建筑！`)
      if (this.game.onLevelUp) this.game.onLevelUp()
    }
    
    return true
  }
}

