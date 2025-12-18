import * as THREE from 'https://unpkg.com/three@0.164.0/build/three.module.js'
import { OBJLoader } from 'https://unpkg.com/three@0.164.0/examples/jsm/loaders/OBJLoader.js'

/**
 * 小猫管理类
 * 负责创建、管理和更新游戏中的小猫
 * 包括模型加载、位置设置、跟随逻辑
 */
export class Cats {
  /**
   * 构造函数
   * @param {Object} game - 游戏主对象，用于访问场景和状态
   */
  constructor(game) {
    this.game = game
    // 模型缓存对象，存储已加载的小猫模型
    this.modelCache = {
      cat: null  // 小猫模型
    }
    // 存储所有小猫对象
    this.cats = []
    // 小猫生成间隔时间（秒）
    this.spawnInterval = 5.0
    // 小猫生成计时器
    this.spawnTimer = 0.0
    // 最大小猫数量
    this.maxCats = 20
    // 初始化时异步加载小猫模型
    this.loadModels()
  }

  /**
   * 异步加载小猫模型文件
   * 使用 OBJLoader 从 model 目录加载 .obj 格式的模型文件
   */
  async loadModels() {
    const loader = new OBJLoader()
    
    try {
      // 加载小猫模型文件
      const catModel = await loader.loadAsync('./model/fat_cat.obj')
      this.modelCache.cat = catModel
      console.log('小猫模型加载成功')
    } catch (error) {
      // 如果模型加载失败，输出错误信息但不中断游戏
      console.error('加载小猫模型失败:', error)
    }
  }

  /**
   * 创建一只小猫
   * @param {THREE.Vector3} at - 小猫的初始位置坐标
   * @returns {THREE.Group} 返回包含小猫模型的组对象
   */
  createCat(at) {
    const group = new THREE.Group()
    const scale = 0.6  // 小猫的缩放倍数
    
    // 如果模型已加载，使用模型；否则使用占位符
    if (this.modelCache.cat) {
      // 克隆模型，避免修改原始缓存模型
      const model = this.modelCache.cat.clone()
      
      // 遍历模型的所有子对象，设置材质
      // 使用橙色材质，符合小猫的外观特征
      model.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({ color: 0xffaa00 })
        }
      })
      
      // 计算模型边界框以确定合适的缩放比例
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const maxSize = Math.max(size.x, size.y, size.z)
      const targetSize = scale
      const modelScale = targetSize / maxSize
      model.scale.set(modelScale, modelScale, modelScale)
      
      // 调整位置使模型底部对齐地面
      box.setFromObject(model)
      const minY = box.min.y
      model.position.y = -minY
      
      group.add(model)
    } else {
      // 模型未加载时使用占位符（橙色立方体）
      const placeholder = new THREE.Mesh(
        new THREE.BoxGeometry(scale, scale, scale),
        new THREE.MeshStandardMaterial({ color: 0xffaa00 })
      )
      group.add(placeholder)
    }
    
    // 设置组的位置
    group.position.copy(at)
    group.position.y = 0
    
    // 设置用户数据，用于标识和状态管理
    group.userData.type = 'cat'           // 小猫类型
    group.userData.cat = true             // 标识这是一个小猫对象
    group.userData.following = false      // 是否正在跟随玩家
    group.userData.followOffset = null    // 跟随时的偏移位置（相对于玩家）
    group.userData.followStartTime = 0    // 开始跟随的时间
    group.userData.escapeChecked = false  // 是否已检查过逃跑
    
    return group
  }

  /**
   * 随机生成一只小猫在地图上
   * @returns {THREE.Group|null} 如果成功生成返回小猫对象，否则返回null
   */
  spawnRandomCat() {
    // 检查是否已达到最大数量
    if (this.cats.length >= this.maxCats) {
      return null
    }
    
    // 随机生成位置（在游戏边界内，但远离中心）
    const limit = 120  // 稍微小于游戏边界，避免太靠近边缘
    const angle = Math.random() * Math.PI * 2
    const distance = 30 + Math.random() * 90  // 距离中心30-120单位
    const x = Math.cos(angle) * distance
    const z = Math.sin(angle) * distance
    
    // 确保在边界内
    const pos = new THREE.Vector3(
      Math.max(-limit, Math.min(limit, x)),
      0,
      Math.max(-limit, Math.min(limit, z))
    )
    
    // 创建小猫
    const cat = this.createCat(pos)
    this.game.scene.add(cat)
    this.cats.push(cat)
    
    return cat
  }

  /**
   * 让小猫开始跟随玩家
   * @param {THREE.Group} cat - 小猫对象
   * @param {THREE.Vector3} playerPos - 玩家位置
   * @returns {boolean} 如果成功设置跟随状态返回true，否则返回false
   */
  makeCatFollow(cat, playerPos) {
    // 验证小猫对象是否有效
    if (!cat || !cat.userData || !cat.userData.cat) return false
    
    // 如果已经在跟随，不重复设置
    if (cat.userData.following) return false
    
    // 设置跟随状态
    cat.userData.following = true
    cat.userData.escapeChecked = false  // 重置逃跑检查标志
    
    // 计算跟随偏移（在玩家身后，稍微随机化位置）
    // 基础偏移在玩家身后（-Z方向），然后添加一些随机偏移
    const baseDistance = 1.5
    const randomAngle = (Math.random() - 0.5) * Math.PI * 0.3  // ±30度随机角度
    const randomDistance = Math.random() * 0.5  // 0-0.5单位的随机距离
    const totalDistance = baseDistance + randomDistance
    
    // 默认在玩家身后（-Z方向），加上随机角度
    const offsetX = Math.sin(randomAngle) * totalDistance
    const offsetZ = -Math.cos(randomAngle) * totalDistance
    
    cat.userData.followOffset = new THREE.Vector3(offsetX, 0, offsetZ)
    
    return true
  }

  /**
   * 更新所有小猫的状态和行为
   * 每帧调用一次，处理跟随逻辑
   * @param {number} dt - 上一帧到当前帧的时间差（秒）
   * @param {THREE.Vector3} playerPos - 玩家位置
   * @param {number} playerRotY - 玩家旋转角度（Y轴）
   */
  updateCats(dt, playerPos, playerRotY) {
    // 定时生成新小猫（每5秒生成一只）
    if (this.cats.length < this.maxCats) {
      this.spawnTimer += dt
      if (this.spawnTimer >= this.spawnInterval) {
        this.spawnRandomCat()
        this.spawnTimer = 0.0  // 重置计时器
      }
    } else {
      // 如果已达到最大数量，重置计时器
      this.spawnTimer = 0.0
    }
    
    // 更新所有小猫
    for (let i = this.cats.length - 1; i >= 0; i--) {
      const cat = this.cats[i]
      if (!cat || !cat.parent) {
        // 如果小猫已被移除，从列表中删除
        this.cats.splice(i, 1)
        continue
      }
      
      // 如果小猫正在跟随玩家
      if (cat.userData.following && playerPos) {
        // 计算目标位置（玩家身后，考虑玩家旋转）
        const offset = cat.userData.followOffset || new THREE.Vector3(-1.5, 0, 0)
        
        // 根据玩家旋转计算偏移
        const rotatedOffset = new THREE.Vector3()
        rotatedOffset.x = offset.x * Math.cos(playerRotY) - offset.z * Math.sin(playerRotY)
        rotatedOffset.z = offset.x * Math.sin(playerRotY) + offset.z * Math.cos(playerRotY)
        rotatedOffset.y = 0
        
        const targetPos = playerPos.clone().add(rotatedOffset)
        targetPos.y = 0.7  // 与玩家相同的高度
        
        // 计算距离
        const dist = cat.position.distanceTo(targetPos)
        
        if (dist > 0.1) {
          // 移动小猫（速度与初始宠物统一：玩家速度的一半）
          const speed = 10  // 跟随速度（playerSpeed * 0.5 = 20 * 0.5 = 10）
          const moveDist = Math.min(dist, speed * dt)
          
          const dir = targetPos.clone().sub(cat.position).normalize()
          cat.position.add(dir.multiplyScalar(moveDist))
          cat.position.y = 0.7 + Math.sin(Date.now() * 0.015) * 0.05  // 简单的浮动动画
          
          // 面向移动方向，但向左转90度再转180度（总共270度，即向右转90度）
          if (moveDist > 0.001) {
            const targetRot = Math.atan2(dir.x, dir.z) - Math.PI / 2 + Math.PI  // 向左转90度再转180度
            let rotDiff = targetRot - cat.rotation.y
            while (rotDiff > Math.PI) rotDiff -= Math.PI * 2
            while (rotDiff < -Math.PI) rotDiff += Math.PI * 2
            cat.rotation.y += rotDiff * dt * 5
          }
        } else {
          // 已到达目标位置，保持浮动
          cat.position.y = 0.7 + Math.sin(Date.now() * 0.005) * 0.02
          
          // 到达目标位置后，有50%概率逃跑
          if (!cat.userData.escapeChecked) {
            cat.userData.escapeChecked = true
            if (Math.random() < 0.5) {
              // 扣除10金币
              const stolenGold = 10
              if (this.game.state.resources.gold >= stolenGold) {
                this.game.state.resources.consume({ gold: stolenGold })
                this.game.notify('小猫偷走你的10块钱！')
              } else {
                // 如果金币不足，扣除所有金币
                const actualGold = this.game.state.resources.gold
                if (actualGold > 0) {
                  this.game.state.resources.consume({ gold: actualGold })
                  this.game.notify(`小猫偷走你的${actualGold}块钱！`)
                } else {
                  this.game.notify('小猫逃跑了！')
                }
              }
              
              // 从场景中移除小猫
              this.game.scene.remove(cat)
              // 从列表中删除
              this.cats.splice(i, 1)
              continue
            }
          }
          
          // 面向玩家，但向左转90度再转180度（总共270度，即向右转90度）
          const targetRot = playerRotY - Math.PI / 2 + Math.PI  // 相对于玩家向左转90度再转180度
          let rotDiff = targetRot - cat.rotation.y
          while (rotDiff > Math.PI) rotDiff -= Math.PI * 2
          while (rotDiff < -Math.PI) rotDiff += Math.PI * 2
          cat.rotation.y += rotDiff * dt * 3
        }
      }
    }
  }

  /**
   * 获取所有小猫对象
   * @returns {Array} 小猫对象数组
   */
  getAllCats() {
    return this.cats
  }
}

