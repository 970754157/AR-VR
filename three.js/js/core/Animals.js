import * as THREE from 'https://unpkg.com/three@0.164.0/build/three.module.js'
import { OBJLoader } from 'https://unpkg.com/three@0.164.0/examples/jsm/loaders/OBJLoader.js'

/**
 * 动物管理类
 * 负责创建、管理和更新游戏中的动物（羊、猪、牛）
 * 包括模型加载、位置设置、动画控制和行为状态管理
 */
export class Animals {
  /**
   * 构造函数
   * @param {Object} game - 游戏主对象，用于访问场景和状态
   */
  constructor(game) {
    this.game = game
    // 模型缓存对象，存储已加载的动物模型，避免重复加载
    this.modelCache = {
      sheep: null,  // 羊模型
      pig: null,    // 猪模型
      cow: null     // 牛模型
    }
    // 初始化时异步加载所有动物模型
    this.loadModels()
  }

  /**
   * 异步加载所有动物模型文件
   * 使用 OBJLoader 从 model 目录加载 .obj 格式的模型文件
   * 加载完成后存储在 modelCache 中供后续使用
   */
  async loadModels() {
    const loader = new OBJLoader()
    
    try {
      // 加载羊模型文件
      const sheepModel = await loader.loadAsync('./model/sheep.obj')
      this.modelCache.sheep = sheepModel
      
      // 加载猪模型文件
      const pigModel = await loader.loadAsync('./model/Pig.obj')
      this.modelCache.pig = pigModel
      
      // 加载牛模型文件
      const cowModel = await loader.loadAsync('./model/cow.obj')
      this.modelCache.cow = cowModel
    } catch (error) {
      // 如果模型加载失败，输出错误信息但不中断游戏
      console.error('加载动物模型失败:', error)
    }
  }

  /**
   * 创建一只羊
   * @param {THREE.Vector3} at - 羊的初始位置坐标
   * @returns {THREE.Group} 返回包含羊模型的组对象
   */
  createSheep(at) {
    const group = new THREE.Group()
    const scale = 4  // 基础缩放倍数，用于统一控制模型大小
    
    // 如果模型已加载，使用模型；否则使用占位符
    if (this.modelCache.sheep) {
      // 克隆模型，避免修改原始缓存模型
      const model = this.modelCache.sheep.clone()
      
      // 遍历模型的所有子对象，设置材质
      // 使用白色材质，符合羊的外观特征
      model.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({ color: 0xffffff })
        }
      })
      
      // 计算模型边界框以确定合适的缩放比例
      // 确保不同大小的模型都能统一显示为合适的大小
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const maxSize = Math.max(size.x, size.y, size.z)  // 获取最大尺寸
      const targetSize = 1.2 * scale  // 目标显示大小
      const modelScale = targetSize / maxSize  // 计算缩放比例
      model.scale.set(modelScale, modelScale, modelScale)
      
      // 调整位置使模型底部对齐地面
      // 重新计算缩放后的边界框
      box.setFromObject(model)
      const minY = box.min.y  // 获取模型底部Y坐标
      model.position.y = -minY  // 将模型底部移动到Y=0位置
      
      group.add(model)
      
      // 尝试从模型中查找腿部（用于行走动画）
      // 优先查找名称中包含 'leg' 或 'foot' 的网格
      const legs = []
      model.traverse((child) => {
        if (child.isMesh && (child.name.toLowerCase().includes('leg') || child.name.toLowerCase().includes('foot'))) {
          legs.push(child)
          // 保存腿部的初始Y位置，用于动画时恢复
          child.userData.initialPos = child.position.y
        }
      })
      
      // 如果没有找到命名的腿部，尝试查找所有子网格作为备选
      // 这是一个后备方案，确保即使模型没有正确命名也能找到腿部
      if (legs.length === 0) {
        model.traverse((child) => {
          if (child.isMesh && child !== model) {
            legs.push(child)
            child.userData.initialPos = child.position.y
          }
        })
      }
      
      group.userData.legs = legs.length > 0 ? legs : []
    } else {
      // 模型未加载时使用占位符（简单的白色立方体）
      // 这样即使模型加载失败，游戏也能正常运行
      const placeholder = new THREE.Mesh(
        new THREE.BoxGeometry(0.5 * scale, 0.5 * scale, 0.5 * scale),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      )
      group.add(placeholder)
      group.userData.legs = []  // 占位符没有腿部，无法播放行走动画
    }
    
    // 设置组的位置
    group.position.copy(at)
    group.position.y = 0  // 确保Y坐标为0，贴地显示
    
    // 设置用户数据，用于标识和状态管理
    group.userData.type = 'sheep'           // 动物类型
    group.userData.animal = true            // 标识这是一个动物对象
    group.userData.state = 'idle'           // 初始状态：空闲
    group.userData.wanderTarget = null      // 漫游目标位置
    group.userData.wanderTimer = 0          // 漫游计时器
    group.userData.runTarget = null         // 逃跑目标位置
    group.userData.runSpeed = 0             // 逃跑速度
    group.userData.runTimer = 0             // 逃跑持续时间
    group.userData.walkPhase = 0            // 行走动画相位（用于腿部动画）
    
    return group
  }

  /**
   * 创建一只猪
   * @param {THREE.Vector3} at - 猪的初始位置坐标
   * @returns {THREE.Group} 返回包含猪模型的组对象
   */
  createPig(at) {
    const group = new THREE.Group()
    const scale = 4  // 基础缩放倍数
    
    // 如果模型已加载，使用模型；否则使用占位符
    if (this.modelCache.pig) {
      const model = this.modelCache.pig.clone()
      
      // 设置材质为粉红色，符合猪的外观特征
      model.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({ color: 0xffb6c1 })
        }
      })
      
      // 修正模型方向，使腿朝下
      // 通常OBJ模型可能需要绕X轴旋转-90度（从Z轴朝上转为Y轴朝上）
      model.rotation.x = -Math.PI / 2
      
      // 计算模型边界框以确定缩放
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const maxSize = Math.max(size.x, size.y, size.z)
      const targetSize = 1.4 * scale  // 猪的目标大小比羊稍大
      const modelScale = targetSize / maxSize
      model.scale.set(modelScale, modelScale, modelScale)
      
      // 调整位置使模型底部对齐地面
      box.setFromObject(model)
      const minY = box.min.y
      model.position.y = -minY
      
      group.add(model)
      
      // 尝试从模型中查找腿部（用于行走动画）
      const legs = []
      model.traverse((child) => {
        if (child.isMesh && (child.name.toLowerCase().includes('leg') || child.name.toLowerCase().includes('foot'))) {
          legs.push(child)
          child.userData.initialPos = child.position.y
        }
      })
      
      // 如果没有找到命名的腿部，尝试查找所有子网格作为备选
      if (legs.length === 0) {
        model.traverse((child) => {
          if (child.isMesh && child !== model) {
            legs.push(child)
            child.userData.initialPos = child.position.y
          }
        })
      }
      
      group.userData.legs = legs.length > 0 ? legs : []
    } else {
      // 模型未加载时使用占位符（粉红色立方体）
      const placeholder = new THREE.Mesh(
        new THREE.BoxGeometry(0.6 * scale, 0.6 * scale, 0.6 * scale),
        new THREE.MeshStandardMaterial({ color: 0xffb6c1 })
      )
      group.add(placeholder)
      group.userData.legs = []
    }
    
    // 设置组的位置
    group.position.copy(at)
    group.position.y = 0
    
    // 设置用户数据，用于标识和状态管理
    group.userData.type = 'pig'
    group.userData.animal = true
    group.userData.state = 'idle'
    group.userData.wanderTarget = null
    group.userData.wanderTimer = 0
    group.userData.runTarget = null
    group.userData.runSpeed = 0
    group.userData.runTimer = 0
    group.userData.walkPhase = 0
    
    return group
  }

  /**
   * 创建一头牛
   * @param {THREE.Vector3} at - 牛的初始位置坐标
   * @returns {THREE.Group} 返回包含牛模型的组对象
   */
  createCow(at) {
    const group = new THREE.Group()
    const scale = 4  // 基础缩放倍数
    
    // 如果模型已加载，使用模型；否则使用占位符
    if (this.modelCache.cow) {
      const model = this.modelCache.cow.clone()
      
      // 设置材质为棕色，符合牛的外观特征
      model.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({ color: 0x8B4513 })
        }
      })
      
      // 计算模型边界框以确定缩放
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const maxSize = Math.max(size.x, size.y, size.z)
      const targetSize = 1.6 * scale  // 牛的目标大小最大
      const modelScale = targetSize / maxSize
      model.scale.set(modelScale, modelScale, modelScale)
      
      // 调整位置使模型底部对齐地面
      box.setFromObject(model)
      const minY = box.min.y
      model.position.y = -minY
      
      group.add(model)
      
      // 尝试从模型中查找腿部（用于行走动画）
      const legs = []
      model.traverse((child) => {
        if (child.isMesh && (child.name.toLowerCase().includes('leg') || child.name.toLowerCase().includes('foot'))) {
          legs.push(child)
          child.userData.initialPos = child.position.y
        }
      })
      
      // 如果没有找到命名的腿部，尝试查找所有子网格作为备选
      if (legs.length === 0) {
        model.traverse((child) => {
          if (child.isMesh && child !== model) {
            legs.push(child)
            child.userData.initialPos = child.position.y
          }
        })
      }
      
      group.userData.legs = legs.length > 0 ? legs : []
    } else {
      // 模型未加载时使用占位符（棕色立方体）
      const placeholder = new THREE.Mesh(
        new THREE.BoxGeometry(0.8 * scale, 0.8 * scale, 0.8 * scale),
        new THREE.MeshStandardMaterial({ color: 0x8B4513 })
      )
      group.add(placeholder)
      group.userData.legs = []
    }
    
    // 设置组的位置
    group.position.copy(at)
    group.position.y = 0
    
    // 设置用户数据，用于标识和状态管理
    group.userData.type = 'cow'
    group.userData.animal = true
    group.userData.state = 'idle'
    group.userData.wanderTarget = null
    group.userData.wanderTimer = 0
    group.userData.runTarget = null
    group.userData.runSpeed = 0
    group.userData.runTimer = 0
    group.userData.walkPhase = 0
    
    return group
  }

  /**
   * 更新所有动物的状态和行为
   * 每帧调用一次，处理动物的移动、状态转换和动画
   * @param {number} dt - 上一帧到当前帧的时间差（秒）
   */
  updateAnimals(dt) {
    // 从场景中筛选出所有动物对象
    const animals = this.game.scene.children.filter(child => child.userData && child.userData.animal)
    
    for (const animal of animals) {
      if (!animal.userData) continue
      
      // 状态1：逃跑状态（running）
      // 当动物受到惊吓或被驱赶时进入此状态
      if (animal.userData.state === 'running' && animal.userData.runTarget) {
        // 计算朝向目标的方向向量
        const direction = new THREE.Vector3()
        direction.subVectors(animal.userData.runTarget, animal.position)
        direction.y = 0  // 保持Y轴为0，只在水平面移动
        const distance = direction.length()
        
        // 如果距离目标还较远，继续移动
        if (distance > 0.1) {
          direction.normalize()  // 归一化方向向量
          // 计算移动距离：速度 × 时间 × 游戏速度倍率
          const moveDistance = animal.userData.runSpeed * dt * this.game.state.speed
          animal.position.add(direction.multiplyScalar(moveDistance))
          // 旋转动物朝向移动方向
          animal.rotation.y = Math.atan2(direction.x, direction.z)
          
          // 更新行走动画，逃跑时速度更快（2.0倍速）
          this.updateAnimalWalkAnimation(animal, dt, 2.0)
          
          // 减少逃跑计时器
          animal.userData.runTimer -= dt
          // 如果计时器归零，停止逃跑，回到空闲状态
          if (animal.userData.runTimer <= 0) {
            animal.userData.state = 'idle'
            animal.userData.runTarget = null
            animal.userData.runSpeed = 0
            this.resetAnimalLegs(animal)
          }
        } else {
          // 已到达目标位置，停止逃跑
          animal.userData.state = 'idle'
          animal.userData.runTarget = null
          animal.userData.runSpeed = 0
          this.resetAnimalLegs(animal)
        }
        continue  // 处理完当前状态，继续下一个动物
      }
      
      // 状态2：漫游状态（wandering）
      // 动物在空闲一段时间后会自动开始漫游
      if (animal.userData.state === 'wandering' && animal.userData.wanderTarget) {
        // 计算朝向漫游目标的方向向量
        const direction = new THREE.Vector3()
        direction.subVectors(animal.userData.wanderTarget, animal.position)
        direction.y = 0
        const distance = direction.length()
        
        // 如果距离目标还较远，继续移动
        if (distance > 0.5) {
          direction.normalize()
          const wanderSpeed = 3  // 漫游速度（比逃跑慢）
          const moveDistance = wanderSpeed * dt * this.game.state.speed
          animal.position.add(direction.multiplyScalar(moveDistance))
          animal.rotation.y = Math.atan2(direction.x, direction.z)
          
          // 更新行走动画，正常速度（1.0倍速）
          this.updateAnimalWalkAnimation(animal, dt, 1.0)
        } else {
          // 已到达漫游目标，停止移动，回到空闲状态
          animal.userData.state = 'idle'
          animal.userData.wanderTarget = null
          // 设置下一次漫游的等待时间（2-5秒随机）
          animal.userData.wanderTimer = 2 + Math.random() * 3
          this.resetAnimalLegs(animal)
        }
        continue
      }
      
      // 状态3：空闲状态（idle）
      // 动物静止不动，等待下一次漫游
      if (animal.userData.state === 'idle') {
        // 重置腿部动画，保持静止姿态
        this.resetAnimalLegs(animal)
        
        // 减少漫游等待计时器
        animal.userData.wanderTimer -= dt * this.game.state.speed
        
        // 如果等待时间到了，生成新的漫游目标
        if (animal.userData.wanderTimer <= 0) {
          const start = animal.position.clone()
          // 随机生成一个角度（0-2π）
          const angle = Math.random() * Math.PI * 2
          // 随机生成一个距离（3-8单位）
          const distance = 3 + Math.random() * 5
          // 计算目标位置
          const end = start.clone().add(new THREE.Vector3(
            Math.cos(angle) * distance,
            0,
            Math.sin(angle) * distance
          ))
          
          // 限制目标位置在游戏边界内（±145单位）
          const limit = 145
          end.x = Math.max(-limit, Math.min(limit, end.x))
          end.z = Math.max(-limit, Math.min(limit, end.z))
          end.y = 0
          
          // 设置新的漫游目标，切换到漫游状态
          animal.userData.wanderTarget = end
          animal.userData.state = 'wandering'
        }
      }
    }
  }

  /**
   * 更新动物的行走动画
   * 通过旋转和移动腿部来模拟行走效果
   * @param {THREE.Group} animal - 动物对象
   * @param {number} dt - 时间差（秒）
   * @param {number} speedMultiplier - 速度倍率（1.0=正常，2.0=快速）
   */
  updateAnimalWalkAnimation(animal, dt, speedMultiplier = 1.0) {
    // 如果动物没有腿部或腿部数量不足4条，无法播放行走动画
    if (!animal.userData || !animal.userData.legs || animal.userData.legs.length < 4) return
    
    const legs = animal.userData.legs
    const walkSpeed = 8 * speedMultiplier  // 基础行走速度 × 倍率
    // 更新行走相位，用于控制腿部动画的节奏
    animal.userData.walkPhase = (animal.userData.walkPhase || 0) + dt * walkSpeed * this.game.state.speed
    const phase = animal.userData.walkPhase
    
    // 计算两条腿的相位（相差π，形成交替效果）
    const legPhase1 = Math.sin(phase)           // 第一条和第四条腿的相位
    const legPhase2 = Math.sin(phase + Math.PI) // 第二条和第三条腿的相位（与第一条相反）
    const amplitude = 0.3      // 腿部旋转幅度（弧度）
    const heightOffset = 0.1   // 腿部抬起的高度偏移
    
    // 处理第一条和第四条腿（左前腿和右后腿）
    // 这两条腿同步运动
    if (legs[0] && legs[3]) {
      const leg0 = legs[0]
      const leg3 = legs[3]
      // 根据相位旋转腿部（前后摆动）
      leg0.rotation.x = legPhase1 * amplitude
      leg3.rotation.x = legPhase1 * amplitude
      // 根据相位调整腿部高度（模拟抬腿）
      if (leg0.userData.initialPos !== undefined) {
        leg0.position.y = leg0.userData.initialPos + Math.max(0, legPhase1) * heightOffset
      }
      if (leg3.userData.initialPos !== undefined) {
        leg3.position.y = leg3.userData.initialPos + Math.max(0, legPhase1) * heightOffset
      }
    }
    
    // 处理第二条和第三条腿（右前腿和左后腿）
    // 这两条腿同步运动，但与第一组相反
    if (legs[1] && legs[2]) {
      const leg1 = legs[1]
      const leg2 = legs[2]
      leg1.rotation.x = legPhase2 * amplitude
      leg2.rotation.x = legPhase2 * amplitude
      if (leg1.userData.initialPos !== undefined) {
        leg1.position.y = leg1.userData.initialPos + Math.max(0, legPhase2) * heightOffset
      }
      if (leg2.userData.initialPos !== undefined) {
        leg2.position.y = leg2.userData.initialPos + Math.max(0, legPhase2) * heightOffset
      }
    }
  }

  /**
   * 重置动物的腿部到初始位置
   * 当动物停止移动时调用，使腿部回到静止状态
   * @param {THREE.Group} animal - 动物对象
   */
  resetAnimalLegs(animal) {
    if (!animal.userData || !animal.userData.legs) return
    
    const legs = animal.userData.legs
    // 遍历所有腿部，恢复到初始位置和旋转
    legs.forEach(leg => {
      if (leg && leg.userData.initialPos !== undefined) {
        leg.rotation.x = 0  // 重置旋转
        leg.position.y = leg.userData.initialPos  // 重置高度
      }
    })
  }

  /**
   * 让动物开始逃跑
   * 当动物受到惊吓或被驱赶时调用此方法
   * @param {THREE.Group} animal - 动物对象
   * @param {THREE.Vector3} targetPos - 逃跑目标位置
   * @returns {boolean} 如果成功设置逃跑状态返回true，否则返回false
   */
  makeAnimalRun(animal, targetPos) {
    // 验证动物对象是否有效
    if (!animal || !animal.userData || !animal.userData.animal) return false
    
    // 设置逃跑状态
    animal.userData.state = 'running'
    animal.userData.runTarget = targetPos.clone()  // 克隆目标位置，避免引用问题
    animal.userData.runSpeed = 15                  // 设置逃跑速度（比漫游快）
    animal.userData.runTimer = 2                   // 设置逃跑持续时间（2秒）
    // 清除漫游相关状态
    animal.userData.wanderTarget = null
    animal.userData.wanderTimer = 0
    
    return true
  }
}

