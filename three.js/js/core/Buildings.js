import * as THREE from 'https://unpkg.com/three@0.164.0/build/three.module.js'
import { t } from '../i18n.js'
import { OBJLoader } from 'https://unpkg.com/three@0.164.0/examples/jsm/loaders/OBJLoader.js'

// 建筑创建相关功能
export class Buildings {
  constructor(game) {
    this.game = game
    // 模型缓存对象，存储已加载的建筑模型
    this.modelCache = {
      castle: null,   // 城堡模型
      library: null,  // 图书馆模型
      school: null    // 学校模型
    }
    // 初始化时异步加载所有建筑模型
    this.loadModels()
  }

  /**
   * 异步加载所有建筑模型文件
   * 使用 OBJLoader 从 model 目录加载 .obj 格式的模型文件
   */
  async loadModels() {
    const loader = new OBJLoader()
    
    try {
      // 加载城堡模型文件
      const castleModel = await loader.loadAsync('./model/Castle.obj')
      this.modelCache.castle = castleModel
      
      // 加载图书馆模型文件
      const libraryModel = await loader.loadAsync('./model/library.obj')
      this.modelCache.library = libraryModel
      
      // 加载学校模型文件
      const schoolModel = await loader.loadAsync('./model/school.obj')
      this.modelCache.school = schoolModel
    } catch (error) {
      // 如果模型加载失败，输出错误信息但不中断游戏
      console.error('加载建筑模型失败:', error)
    }
  }

  createFadeMaterial(color) {
    const mat = new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.0 })
    return mat
  }

  createCastleVariant(at) {
    const group = new THREE.Group()
    group.position.copy(at)
    group.position.y = 20  // 在Y轴上抬高20个单位
    
    // 如果模型已加载，使用模型；否则使用占位符
    if (this.modelCache.castle) {
      const model = this.modelCache.castle.clone()
      
      // 设置材质和淡入效果
      const mats = []
      model.traverse((child) => {
        if (child.isMesh) {
          // 保持原有材质或使用默认材质
          if (!child.material || !child.material.color) {
            child.material = this.createFadeMaterial(0xa7abb0)
          } else {
            // 如果模型有材质，创建淡入材质
            const originalColor = child.material.color ? child.material.color.getHex() : 0xa7abb0
            child.material = this.createFadeMaterial(originalColor)
          }
          mats.push(child.material)
        }
      })
      
      // 计算模型边界框以确定缩放
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const maxSize = Math.max(size.x, size.y, size.z)
      const targetSize = 1000 // 目标大小（放大三倍：100 * 3 = 300）
      const modelScale = targetSize / maxSize
      model.scale.set(modelScale, modelScale, modelScale)
      
      // 调整位置使模型底部对齐地面
      box.setFromObject(model)
      const minY = box.min.y
      model.position.y = -minY
      
      group.add(model)
      group.userData.fade = 0
      group.userData.mats = mats.length > 0 ? mats : []
    } else {
      // 模型未加载时使用占位符（也放大三倍）
      const placeholder = new THREE.Mesh(
        new THREE.BoxGeometry(1000, 9, 18),  // 放大三倍：100*3, 3*3, 6*3
        this.createFadeMaterial(0xa7abb0)
      )
      group.add(placeholder)
      group.userData.fade = 0
      group.userData.mats = [placeholder.material]
    }
    
    group.visible = false
    return group
  }

  createLibraryVariant(at) {
    const group = new THREE.Group()
    group.position.copy(at)
    group.position.y = 0
    
    // 如果模型已加载，使用模型；否则使用占位符
    if (this.modelCache.library) {
      const model = this.modelCache.library.clone()
      
      // 设置材质和淡入效果
      const mats = []
      model.traverse((child) => {
        if (child.isMesh) {
          if (!child.material || !child.material.color) {
            child.material = this.createFadeMaterial(0xb3b7bb)
          } else {
            const originalColor = child.material.color ? child.material.color.getHex() : 0xb3b7bb
            child.material = this.createFadeMaterial(originalColor)
          }
          mats.push(child.material)
        }
      })
      
      // 计算模型边界框以确定缩放
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const maxSize = Math.max(size.x, size.y, size.z)
      const targetSize = 24 // 目标大小（放大3倍）
      const modelScale = targetSize / maxSize
      model.scale.set(modelScale, modelScale, modelScale)
      
      // 调整位置使模型底部对齐地面
      box.setFromObject(model)
      const minY = box.min.y
      model.position.y = -minY
      
      group.add(model)
      group.userData.fade = 0
      group.userData.mats = mats.length > 0 ? mats : []
    } else {
      // 模型未加载时使用占位符
      const placeholder = new THREE.Mesh(
        new THREE.BoxGeometry(24, 3.2, 6),
        this.createFadeMaterial(0xb3b7bb)
      )
      group.add(placeholder)
      group.userData.fade = 0
      group.userData.mats = [placeholder.material]
    }
    
    group.visible = false
    return group
  }

  createWallVariant(at) {
    const v = Math.floor(Math.random() * 3)
    const group = new THREE.Group()
    group.position.copy(at); group.position.y = 0
    const stone = this.createFadeMaterial(0x9aa0a3)
    const accent = this.createFadeMaterial(0x8b7d6b)
    if (v === 0) {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(12, 2.2, 2.6), stone)
      wall.position.set(0, 1.1, 0); wall.castShadow = true; wall.receiveShadow = true; group.add(wall)
      group.userData.mats = [stone, wall.material]
    } else if (v === 1) {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(12, 2.6, 2.6), stone)
      wall.position.set(0, 1.3, 0); wall.castShadow = true; wall.receiveShadow = true; group.add(wall)
      for (let i = -5; i <= 5; i += 2) {
        const crenel = new THREE.Mesh(new THREE.BoxGeometry(1, 0.6, 0.6), accent)
        crenel.position.set(i, 3.0, 0.9)
        group.add(crenel)
      }
      group.userData.mats = [stone, accent, wall.material]
    } else {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(14, 2.2, 3.0), stone)
      wall.position.set(0, 1.1, 0); wall.castShadow = true; wall.receiveShadow = true; group.add(wall)
      const towerL = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 3.6, 12), stone)
      const towerR = towerL.clone()
      towerL.position.set(-7.2, 1.8, -0.6); towerR.position.set(7.2, 1.8, -0.6)
      group.add(towerL); group.add(towerR)
      group.userData.mats = [stone, wall.material, towerL.material]
    }
    group.userData.fade = 0
    group.visible = false
    return group
  }

  createFarmVariant(at) {
    const group = new THREE.Group()
    group.position.copy(at); group.position.y = 0
    const soil = new THREE.MeshStandardMaterial({ color: 0x8c6b4f })
    const patch = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), soil)
    patch.rotation.x = -Math.PI/2
    patch.position.y = 0.03 // 防止与地面Z-fighting
    patch.receiveShadow = true
    patch.castShadow = false
    group.add(patch)
    group.userData.type = 'farm'
    group.userData.crops = []
    group.visible = true
    return group
  }

  createSchoolVariant(at) {
    const group = new THREE.Group()
    group.position.copy(at)
    group.position.y = 0
    
    // 如果模型已加载，使用模型；否则使用占位符
    if (this.modelCache.school) {
      const model = this.modelCache.school.clone()
      
      // 设置材质和淡入效果
      const mats = []
      model.traverse((child) => {
        if (child.isMesh) {
          if (!child.material || !child.material.color) {
            child.material = this.createFadeMaterial(0xbdbfc2)
          } else {
            const originalColor = child.material.color ? child.material.color.getHex() : 0xbdbfc2
            child.material = this.createFadeMaterial(originalColor)
          }
          mats.push(child.material)
        }
      })
      
      // 计算模型边界框以确定缩放
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const maxSize = Math.max(size.x, size.y, size.z)
      const targetSize = 30 // 目标大小（进一步放大）
      const modelScale = targetSize / maxSize
      model.scale.set(modelScale, modelScale, modelScale)
      
      // 调整位置使模型底部对齐地面
      box.setFromObject(model)
      const minY = box.min.y
      model.position.y = -minY
      
      group.add(model)
      group.userData.fade = 0
      group.userData.mats = mats.length > 0 ? mats : []
    } else {
      // 模型未加载时使用占位符
      const placeholder = new THREE.Mesh(
        new THREE.BoxGeometry(30, 2.6, 4),
        this.createFadeMaterial(0xbdbfc2)
      )
      group.add(placeholder)
      group.userData.fade = 0
      group.userData.mats = [placeholder.material]
    }
    
    group.visible = false
    return group
  }

  createRoadVariant(at) {
    const v = Math.floor(Math.random() * 3)
    const group = new THREE.Group()
    group.position.copy(at); group.position.y = 0
    const asphalt = this.createFadeMaterial(0x4a4d52)
    const edge = this.createFadeMaterial(0xbfbfbf)
    const len = v===0? 14 : v===1 ? 10 : 8
    const w = v===0? 3 : v===1 ? 2.5 : 2.2
    const road = new THREE.Mesh(new THREE.BoxGeometry(len, 0.1, w), asphalt)
    road.position.set(0,0.05,0); road.castShadow=false; road.receiveShadow=true; group.add(road)
    const e1 = new THREE.Mesh(new THREE.BoxGeometry(len, 0.05, 0.1), edge); e1.position.set(0,0.1, w/2 - 0.05); group.add(e1)
    const e2 = e1.clone(); e2.position.set(0,0.1, -w/2 + 0.05); group.add(e2)
    group.userData.fade = 0; group.userData.mats = [asphalt, edge, road.material, e1.material]
    group.visible = false
    return group
  }

  createRiverVariant(at) {
    const v = Math.floor(Math.random() * 3)
    const group = new THREE.Group()
    group.position.copy(at); group.position.y = 0
    const water = new THREE.MeshStandardMaterial({ color: 0x3da0ff, transparent: true, opacity: 0.0, roughness: 0.2, metalness: 0.0 })
    const len = v===0? 16 : v===1? 12 : 10
    const w = v===0? 4 : v===1? 3.5 : 3.0
    const plane = new THREE.Mesh(new THREE.BoxGeometry(len, 0.05, w), water)
    plane.position.set(0,0.025,0)
    group.add(plane)
    group.userData.fade = 0; group.userData.mats = [water, plane.material]
    group.visible = false
    return group
  }

  createCabin(at) {
    const group = new THREE.Group()
    group.position.copy(at)
    group.position.y = 0
    
    const woodMat = new THREE.MeshStandardMaterial({ 
      color: 0x9d7a5a,
      roughness: 0.8,
      metalness: 0.1
    })
    const darkWoodMat = new THREE.MeshStandardMaterial({ 
      color: 0x7a6a4a,
      roughness: 0.9,
      metalness: 0.05
    })
    const roofMat = new THREE.MeshStandardMaterial({ 
      color: 0x5a4a3a,
      roughness: 0.7,
      metalness: 0.15
    })
    const doorMat = new THREE.MeshStandardMaterial({ 
      color: 0x3a2a1a,
      roughness: 0.6
    })
    const windowMat = new THREE.MeshStandardMaterial({ 
      color: 0x0a0a0a,
      emissive: 0x1a1a2a,
      emissiveIntensity: 0.1
    })
    const frameMat = new THREE.MeshStandardMaterial({ 
      color: 0x8b6f47,
      roughness: 0.7
    })
    const chimneyMat = new THREE.MeshStandardMaterial({ 
      color: 0x6a5a4a,
      roughness: 0.8
    })
    
    const floor1_main = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 2.8, 3.8),
      woodMat
    )
    floor1_main.position.set(0.1, 1.4, -0.1)
    floor1_main.rotation.y = 0.05
    floor1_main.castShadow = true
    floor1_main.receiveShadow = true
    group.add(floor1_main)
    
    const floor1_ext1 = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 2.5, 2.2),
      darkWoodMat
    )
    floor1_ext1.position.set(2.2, 1.25, 0.8)
    floor1_ext1.rotation.y = -0.1
    floor1_ext1.castShadow = true
    floor1_ext1.receiveShadow = true
    group.add(floor1_ext1)
    
    const floor1_ext2 = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 2.6, 2.0),
      darkWoodMat
    )
    floor1_ext2.position.set(-1.9, 1.3, -0.5)
    floor1_ext2.rotation.y = 0.08
    floor1_ext2.castShadow = true
    floor1_ext2.receiveShadow = true
    group.add(floor1_ext2)
    
    const balcony1 = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.2, 3.6),
      woodMat
    )
    balcony1.position.set(0.2, 2.9, -0.1)
    balcony1.rotation.y = 0.03
    balcony1.castShadow = true
    balcony1.receiveShadow = true
    group.add(balcony1)
    
    const balcony2 = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.2, 2.2),
      darkWoodMat
    )
    balcony2.position.set(2.1, 2.95, 0.9)
    balcony2.rotation.y = -0.1
    balcony2.castShadow = true
    balcony2.receiveShadow = true
    group.add(balcony2)
    
    const floor2_main = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 2.6, 3.4),
      woodMat
    )
    floor2_main.position.set(-0.1, 4.3, 0.1)
    floor2_main.rotation.y = -0.03
    floor2_main.castShadow = true
    floor2_main.receiveShadow = true
    group.add(floor2_main)
    
    const floor2_ext = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 2.4, 1.8),
      darkWoodMat
    )
    floor2_ext.position.set(0.3, 4.2, -1.6)
    floor2_ext.rotation.y = 0.05
    floor2_ext.castShadow = true
    floor2_ext.receiveShadow = true
    group.add(floor2_ext)
    
    const roof1 = new THREE.Mesh(
      new THREE.ConeGeometry(3.2, 1.6, 4),
      roofMat
    )
    roof1.rotation.y = Math.PI / 4 + 0.1
    roof1.position.set(0.1, 6.9, -0.1)
    roof1.castShadow = true
    roof1.receiveShadow = true
    group.add(roof1)
    
    const roof2 = new THREE.Mesh(
      new THREE.ConeGeometry(2.0, 1.2, 4),
      roofMat
    )
    roof2.rotation.y = Math.PI / 4 - 0.15
    roof2.position.set(2.3, 6.8, 1.0)
    roof2.castShadow = true
    roof2.receiveShadow = true
    group.add(roof2)
    
    const doorGroup = new THREE.Group()
    const doorFrame = new THREE.Mesh(
      new THREE.PlaneGeometry(1.0, 2.0),
      frameMat
    )
    doorFrame.position.set(0, 0, 0.01)
    doorGroup.add(doorFrame)
    
    const door1 = new THREE.Mesh(
      new THREE.PlaneGeometry(0.9, 1.9),
      doorMat
    )
    door1.position.set(0, 0, 0)
    door1.castShadow = true
    door1.receiveShadow = true
    doorGroup.add(door1)
    
    const handleMat = new THREE.MeshStandardMaterial({ 
      color: 0xffd700,
      metalness: 0.8,
      roughness: 0.2
    })
    const handle = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 8, 8),
      handleMat
    )
    handle.position.set(0.35, 0, 0.01)
    doorGroup.add(handle)
    
    doorGroup.position.set(0.15, 1.0, 1.95)
    doorGroup.rotation.y = 0.02
    group.add(doorGroup)
    
    const createWindow = (pos, size, rotY = 0) => {
      const windowGroup = new THREE.Group()
      const frameThickness = 0.05
      const frameOuter = new THREE.Mesh(
        new THREE.PlaneGeometry(size.x + frameThickness * 2, size.y + frameThickness * 2),
        frameMat
      )
      frameOuter.position.set(0, 0, 0.01)
      windowGroup.add(frameOuter)
      
      const glass = new THREE.Mesh(
        new THREE.PlaneGeometry(size.x, size.y),
        windowMat
      )
      windowGroup.add(glass)
      
      const pane1 = new THREE.Mesh(
        new THREE.PlaneGeometry(size.x, 0.02),
        frameMat
      )
      pane1.position.set(0, 0, 0.02)
      windowGroup.add(pane1)
      
      const pane2 = new THREE.Mesh(
        new THREE.PlaneGeometry(0.02, size.y),
        frameMat
      )
      pane2.position.set(0, 0, 0.02)
      windowGroup.add(pane2)
      
      windowGroup.position.copy(pos)
      windowGroup.rotation.y = rotY
      return windowGroup
    }
    
    const window1_1 = createWindow(new THREE.Vector3(-1.3, 2.1, 1.95), new THREE.Vector2(0.55, 0.55), 0.01)
    group.add(window1_1)
    
    const window1_2 = createWindow(new THREE.Vector3(1.4, 2.0, 1.98), new THREE.Vector2(0.6, 0.5), -0.02)
    group.add(window1_2)
    
    const window2_1 = createWindow(new THREE.Vector3(-1.4, 4.4, 1.92), new THREE.Vector2(0.5, 0.55), 0.01)
    group.add(window2_1)
    
    const window2_2 = createWindow(new THREE.Vector3(0.1, 4.5, 1.96), new THREE.Vector2(0.6, 0.6), 0)
    group.add(window2_2)
    
    const window2_3 = createWindow(new THREE.Vector3(1.5, 4.3, 1.94), new THREE.Vector2(0.55, 0.5), -0.01)
    group.add(window2_3)
    
    const window2_left = createWindow(new THREE.Vector3(-1.95, 4.4, -0.2), new THREE.Vector2(0.5, 0.55), Math.PI / 2 + 0.02)
    group.add(window2_left)
    
    const window2_right = createWindow(new THREE.Vector3(2.05, 4.3, 0.3), new THREE.Vector2(0.55, 0.5), -Math.PI / 2 - 0.01)
    group.add(window2_right)
    
    const stairMat = new THREE.MeshStandardMaterial({ 
      color: 0x6b5a4a,
      roughness: 0.8
    })
    for (let i = 0; i < 3; i++) {
      const stair = new THREE.Mesh(
        new THREE.BoxGeometry(1.4 - i * 0.1, 0.15, 0.9 - i * 0.1),
        stairMat
      )
      stair.position.set(1.8 - i * 0.2, 0.075 + i * 0.15, 1.6 - i * 0.1)
      stair.rotation.y = 0.1 - i * 0.02
      stair.castShadow = true
      stair.receiveShadow = true
      group.add(stair)
    }
    
    const chimney = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.3, 1.5, 8),
      chimneyMat
    )
    chimney.position.set(1.2, 7.5, -0.8)
    chimney.rotation.z = 0.1
    chimney.castShadow = true
    chimney.receiveShadow = true
    group.add(chimney)
    
    const chimneyTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.3, 0.2, 8),
      chimneyMat
    )
    chimneyTop.position.set(1.2, 8.3, -0.8)
    chimneyTop.castShadow = true
    chimneyTop.receiveShadow = true
    group.add(chimneyTop)
    
    const railingMat = new THREE.MeshStandardMaterial({ 
      color: 0x8b6f47,
      roughness: 0.7
    })
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2
      const radius = 2.0
      const railingPost = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8),
        railingMat
      )
      railingPost.position.set(
        Math.cos(angle) * radius,
        4.6,
        Math.sin(angle) * radius
      )
      railingPost.castShadow = true
      railingPost.receiveShadow = true
      group.add(railingPost)
    }
    
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2
      const radius = 2.0
      const railingBar = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.04, radius * 2),
        railingMat
      )
      railingBar.position.set(
        Math.cos(angle) * radius,
        4.4 + (i % 2) * 0.2,
        Math.sin(angle) * radius
      )
      railingBar.rotation.y = angle + Math.PI / 2
      railingBar.castShadow = true
      railingBar.receiveShadow = true
      group.add(railingBar)
    }
    
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2
      const radius = 2.2 + Math.random() * 0.3
      const height = 1.5 + Math.random() * 1.5
      const smallBlock = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.25, 0.25),
        Math.random() > 0.5 ? woodMat : darkWoodMat
      )
      smallBlock.position.set(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      )
      smallBlock.rotation.set(
        Math.random() * 0.2,
        Math.random() * Math.PI * 2,
        Math.random() * 0.2
      )
      smallBlock.castShadow = true
      smallBlock.receiveShadow = true
      group.add(smallBlock)
    }
    
    group.userData.type = 'cabin'
    group.castShadow = true
    group.receiveShadow = true
    
    return group
  }

  createCampfire(at) {
    const group = new THREE.Group()
    group.position.copy(at)
    group.position.y = 0
    
    const logMat = new THREE.MeshStandardMaterial({ color: 0x5a4a3a })
    const fireMat = new THREE.MeshStandardMaterial({ 
      color: 0xff6600, 
      emissive: 0xff4400, 
      emissiveIntensity: 0.8 
    })
    
    const log1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 1.5, 8),
      logMat
    )
    log1.rotation.z = Math.PI / 2
    log1.position.set(0, 0.3, 0)
    log1.castShadow = true
    log1.receiveShadow = true
    group.add(log1)
    
    const log2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 1.5, 8),
      logMat
    )
    log2.rotation.x = Math.PI / 2
    log2.position.set(0, 0.3, 0)
    log2.castShadow = true
    log2.receiveShadow = true
    group.add(log2)
    
    const fire1 = new THREE.Mesh(
      new THREE.ConeGeometry(0.3, 0.8, 8),
      fireMat
    )
    fire1.position.set(0, 0.8, 0)
    group.add(fire1)
    
    const fire2 = new THREE.Mesh(
      new THREE.ConeGeometry(0.25, 0.6, 8),
      fireMat
    )
    fire2.position.set(0.2, 0.7, 0.1)
    fire2.rotation.z = 0.2
    group.add(fire2)
    
    const fire3 = new THREE.Mesh(
      new THREE.ConeGeometry(0.25, 0.6, 8),
      fireMat
    )
    fire3.position.set(-0.2, 0.7, -0.1)
    fire3.rotation.z = -0.2
    group.add(fire3)
    
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x666666 })
    const ground = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.8, 0.1, 16),
      stoneMat
    )
    ground.rotation.x = Math.PI / 2
    ground.position.set(0, 0.05, 0)
    ground.receiveShadow = true
    group.add(ground)
    
    group.userData.type = 'campfire'
    group.castShadow = true
    group.receiveShadow = true
    
    return group
  }

  createInitialStructures() {
    const cabinPos = new THREE.Vector3(-30, 0, 0)
    const cabin = this.createCabin(cabinPos)
    this.game.scene.add(cabin)
    this.game.state.addStructure({ 
      type: 'cabin', 
      mesh: cabin, 
      completed: true
    })
    
    const campfirePos = new THREE.Vector3(-20, 0, 10)
    const campfire = this.createCampfire(campfirePos)
    this.game.scene.add(campfire)
    this.game.state.addStructure({ 
      type: 'campfire', 
      mesh: campfire, 
      completed: true
    })
  }

  addFoundationAt(point, buildType = 'castle') {
    if (!this.game.state.isBuildingUnlocked(buildType)) {
      const requiredLevel = this.game.state.getBuildingRequiredLevel(buildType)
      const buildingName = t(`building.${buildType}`) || buildType
      this.game.notify(t('msg.needLevel', { name: buildingName, required: requiredLevel, current: this.game.state.playerLevel }))
      return false
    }
    const configs = {
      castle: { size: new THREE.Vector3(8, 1, 6), cost: { food: 50, wood: 25 } },
      library: { size: new THREE.Vector3(8, 1, 8), cost: { food: 40, wood: 20 } },
      farm: { size: new THREE.Vector3(4, 1, 4), cost: { food: 10, wood: 5 } },
      school: { size: new THREE.Vector3(7, 1, 7), cost: { food: 35, wood: 25 } },
      wall: { size: new THREE.Vector3(12, 1, 3), cost: { food: 60, wood: 15 } },
      road: { size: new THREE.Vector3(16, 0.5, 3), cost: { food: 20, wood: 5 } },
      river: { size: new THREE.Vector3(12, 0.2, 3), cost: { food: 0, wood: 0 } }
    }
    const cfg = configs[buildType] || configs.castle
    if (!this.game.state.resources.consume(cfg.cost)) return false
    const geo = new THREE.BoxGeometry(cfg.size.x, cfg.size.y, cfg.size.z)
    const mat = new THREE.MeshStandardMaterial({ color: 0x8b7d6b })
    const base = new THREE.Mesh(geo, mat)
    base.position.set(point.x, 0.5, point.z)
    base.castShadow = true
    base.receiveShadow = true
    this.game.scene.add(base)
    base.scale.y = 0.1
    this.game.state.addStructure({ type: 'foundation', mesh: base, progress: 0, completed: false, forType: buildType })
    
    // 立即触发工人分配，让附近的工人前来建造
    this.game.assignWork()
    
    return true
  }

  addFoundation() {
    const cost = { stone: 30, wood: 10 }
    if (!this.game.state.resources.consume(cost)) return false
    const geo = new THREE.BoxGeometry(6, 1, 6)
    const mat = new THREE.MeshStandardMaterial({ color: 0x8b7d6b })
    const base = new THREE.Mesh(geo, mat)
    base.position.set(0, 0.5, 0)
    base.castShadow = true
    base.receiveShadow = true
    this.game.scene.add(base)
    base.scale.y = 0.1
    this.game.state.addStructure({ type: 'foundation', mesh: base, progress: 0, completed: false })
    return true
  }
}
