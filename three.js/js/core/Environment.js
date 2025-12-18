import * as THREE from 'https://unpkg.com/three@0.164.0/build/three.module.js'

// 环境相关功能（地面、野花）
export class Environment {
  constructor(game) {
    this.game = game
  }

  createGround() {
    const geo = new THREE.PlaneGeometry(300, 300)
    const mat = new THREE.MeshStandardMaterial({ color: 0x7ea36c })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.rotation.x = -Math.PI / 2
    mesh.receiveShadow = true
    return mesh
  }

  createWildFlowers() {
    const mapLimit = 145
    const flowerCount = 80 + Math.floor(Math.random() * 40)
    
    const avoidAreas = [
      { center: new THREE.Vector3(80, 0, 80), radius: 60 },
      { center: new THREE.Vector3(-115, 0, -115), radius: 50 },
      { center: new THREE.Vector3(-35, 0, -115), radius: 40 },
      { center: new THREE.Vector3(-30, 0, 0), radius: 5 },
      { center: new THREE.Vector3(-20, 0, 10), radius: 3 }
    ]
    
    for (let i = 0; i < flowerCount; i++) {
      let attempts = 0
      let validPos = false
      let flowerPos
      
      while (!validPos && attempts < 50) {
        flowerPos = new THREE.Vector3(
          (Math.random() - 0.5) * (mapLimit * 2 - 20),
          0,
          (Math.random() - 0.5) * (mapLimit * 2 - 20)
        )
        
        validPos = true
        for (const area of avoidAreas) {
          const distance = flowerPos.distanceTo(area.center)
          if (distance < area.radius) {
            validPos = false
            break
          }
        }
        attempts++
      }
      
      if (validPos) {
        const flower = this.createWildFlower(flowerPos)
        this.game.scene.add(flower)
      }
    }
  }

  createWildFlower(at) {
    const group = new THREE.Group()
    group.position.copy(at)
    group.position.y = 0
    
    const flowerColors = [
      0xff6b6b, 0xffd93d, 0x4ecdc4, 0xff9ff3,
      0xf7f7f7, 0xa29bfe, 0xfd79a8, 0xfdcb6e
    ]
    const flowerColor = flowerColors[Math.floor(Math.random() * flowerColors.length)]
    
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x4a7c59 })
    const flowerMat = new THREE.MeshStandardMaterial({ color: flowerColor })
    const centerMat = new THREE.MeshStandardMaterial({ color: 0xffd700 })
    
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.15, 6),
      stemMat
    )
    stem.position.set(0, 0.075, 0)
    stem.castShadow = true
    stem.receiveShadow = true
    group.add(stem)
    
    const petalCount = 5 + Math.floor(Math.random() * 3)
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2
      const petal = new THREE.Mesh(
        new THREE.ConeGeometry(0.03, 0.08, 6),
        flowerMat
      )
      petal.rotation.z = Math.PI / 2
      petal.rotation.y = angle
      petal.position.set(
        Math.cos(angle) * 0.04,
        0.15,
        Math.sin(angle) * 0.04
      )
      petal.castShadow = true
      petal.receiveShadow = true
      group.add(petal)
    }
    
    const center = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 8, 8),
      centerMat
    )
    center.position.set(0, 0.15, 0)
    center.castShadow = true
    center.receiveShadow = true
    group.add(center)
    
    group.rotation.y = Math.random() * Math.PI * 2
    const scale = 0.8 + Math.random() * 0.4
    group.scale.setScalar(scale)
    
    group.userData.type = 'wildflower'
    group.castShadow = true
    group.receiveShadow = true
    
    return group
  }
}

