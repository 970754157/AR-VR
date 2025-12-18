import * as THREE from 'https://unpkg.com/three@0.164.0/build/three.module.js'
import { OrbitControls } from 'https://unpkg.com/three@0.164.0/examples/jsm/controls/OrbitControls.js'
export class CameraSystem {
  constructor(container) {
    this.camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000)
    this.camera.position.set(75, 60, 75)
    this.controls = new OrbitControls(this.camera, container.querySelector('canvas'))
    this.controls.enableDamping = true
    // 禁用 OrbitControls 的键盘控制，避免与玩家 WASD 控制冲突
    this.controls.enableKeys = false
    
    // 相机平移速度
    this.panSpeed = 30
    // 键盘状态
    this.keys = {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false
    }
    // 是否跟随玩家（当玩家移动时自动跟随）
    this.followPlayer = true
    // 玩家位置（用于跟随）
    this.playerPosition = null
    
    // 监听键盘事件
    this.setupKeyboardControls()
  }
  
  /**
   * 设置是否跟随玩家
   * @param {boolean} follow - 是否跟随
   */
  setFollowPlayer(follow) {
    this.followPlayer = follow
  }
  
  /**
   * 设置玩家位置（用于跟随）
   * @param {THREE.Vector3} position - 玩家位置
   */
  setPlayerPosition(position) {
    this.playerPosition = position
  }
  
  setupKeyboardControls() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'ArrowUp') {
        this.keys.ArrowUp = true
        e.preventDefault()
      } else if (e.code === 'ArrowDown') {
        this.keys.ArrowDown = true
        e.preventDefault()
      } else if (e.code === 'ArrowLeft') {
        this.keys.ArrowLeft = true
        e.preventDefault()
      } else if (e.code === 'ArrowRight') {
        this.keys.ArrowRight = true
        e.preventDefault()
      }
    })
    
    window.addEventListener('keyup', (e) => {
      if (e.code === 'ArrowUp') {
        this.keys.ArrowUp = false
        e.preventDefault()
      } else if (e.code === 'ArrowDown') {
        this.keys.ArrowDown = false
        e.preventDefault()
      } else if (e.code === 'ArrowLeft') {
        this.keys.ArrowLeft = false
        e.preventDefault()
      } else if (e.code === 'ArrowRight') {
        this.keys.ArrowRight = false
        e.preventDefault()
      }
    })
  }
  
  update(dt = 0.016) {
    // 如果跟随玩家，不处理方向键平移（由PlayerController处理相机跟随）
    if (!this.followPlayer) {
      // 处理相机平移（仅在玩家不移动时）
      if (this.keys.ArrowUp || this.keys.ArrowDown || this.keys.ArrowLeft || this.keys.ArrowRight) {
        // 获取相机的朝向（前方向量），投影到水平面
        const forward = new THREE.Vector3()
        this.camera.getWorldDirection(forward)
        forward.y = 0  // 只在水平面移动
        forward.normalize()
        
        // 获取相机的右方向量（水平面）
        const right = new THREE.Vector3()
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()
        
        // 计算平移向量（只在水平面XZ平面上）
        const panVector = new THREE.Vector3(0, 0, 0)
        
        if (this.keys.ArrowUp) {
          // 上键：在水平面上向前移动（沿相机朝向在水平面的投影）
          panVector.add(forward.clone().multiplyScalar(this.panSpeed * dt))
        }
        if (this.keys.ArrowDown) {
          // 下键：在水平面上向后移动
          panVector.add(forward.clone().multiplyScalar(-this.panSpeed * dt))
        }
        if (this.keys.ArrowLeft) {
          // 左键：在水平面上向左移动
          panVector.add(right.clone().multiplyScalar(-this.panSpeed * dt))
        }
        if (this.keys.ArrowRight) {
          // 右键：在水平面上向右移动
          panVector.add(right.clone().multiplyScalar(this.panSpeed * dt))
        }
        
        // 确保只在水平面平移（Y轴不变）
        panVector.y = 0
        
        // 应用平移
        if (panVector.lengthSq() > 0) {
          this.camera.position.add(panVector)
          this.controls.target.add(panVector)
        }
      }
    }
    
    this.controls.update()
  }
  
  resize(container) { 
    this.camera.aspect = container.clientWidth / container.clientHeight
    this.camera.updateProjectionMatrix() 
  }
  
  getCamera() { return this.camera }
  getControls() { return this.controls }
}
