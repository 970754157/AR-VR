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
    // 禁用 OrbitControls 的平移，改用方向键实现“按视角平移”，更可控
    this.controls.enablePan = false
    
    // 相机平移速度
    this.panSpeed = 30
    // 跟随平滑系数（越大越“紧”）
    this.followLerp = 10
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
    // 跟随时的目标偏移：方向键会改变它（屏幕空间上下左右）
    this.followOffset = new THREE.Vector3(0, 0, 0)
    this.playerTargetOffset = new THREE.Vector3(0, 1.2, 0)
    this.maxFollowOffset = 200
    this._tmpRight = new THREE.Vector3()
    this._tmpUp = new THREE.Vector3()
    this._tmpDesiredTarget = new THREE.Vector3()
    this._tmpNewTarget = new THREE.Vector3()
    this._tmpDelta = new THREE.Vector3()
    
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

  _applyArrowPan(dt = 0.016) {
    const x = (this.keys.ArrowRight ? 1 : 0) - (this.keys.ArrowLeft ? 1 : 0)
    const y = (this.keys.ArrowUp ? 1 : 0) - (this.keys.ArrowDown ? 1 : 0)
    if (x === 0 && y === 0) return
    
    const dist = this.camera.position.distanceTo(this.controls.target)
    const speed = this.panSpeed * (0.6 + Math.min(2.2, dist / 60))
    
    this._tmpRight.set(1, 0, 0).applyQuaternion(this.camera.quaternion).normalize()
    this._tmpUp.set(0, 1, 0).applyQuaternion(this.camera.quaternion).normalize()
    
    this._tmpDelta
      .set(0, 0, 0)
      .addScaledVector(this._tmpRight, x * speed * dt)
      .addScaledVector(this._tmpUp, y * speed * dt)
    
    if (this.followPlayer) {
      this.followOffset.add(this._tmpDelta)
      if (this.followOffset.length() > this.maxFollowOffset) {
        this.followOffset.setLength(this.maxFollowOffset)
      }
      return
    }
    
    // 非跟随模式：直接移动相机与 target（保持相对关系不变）
    this.camera.position.add(this._tmpDelta)
    this.controls.target.add(this._tmpDelta)
  }
  
  _updateFollow(dt = 0.016) {
    if (!this.followPlayer) return
    if (!this.playerPosition) return
    
    this._tmpDesiredTarget.copy(this.playerPosition).add(this.playerTargetOffset).add(this.followOffset)
    
    // 平滑把 OrbitControls 的 target 拉向期望 target，并让相机位置跟随同样的 delta
    const t = Math.min(1, dt * this.followLerp)
    this._tmpNewTarget.copy(this.controls.target).lerp(this._tmpDesiredTarget, t)
    this._tmpDelta.copy(this._tmpNewTarget).sub(this.controls.target)
    
    this.controls.target.add(this._tmpDelta)
    this.camera.position.add(this._tmpDelta)
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
    this._applyArrowPan(dt)
    this._updateFollow(dt)
    this.controls.update()
  }
  
  resize(container) { 
    this.camera.aspect = container.clientWidth / container.clientHeight
    this.camera.updateProjectionMatrix() 
  }
  
  getCamera() { return this.camera }
  getControls() { return this.controls }
}
