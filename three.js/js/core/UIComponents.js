import * as THREE from 'https://unpkg.com/three@0.164.0/build/three.module.js'

// UI组件相关功能（进度条等）
export class UIComponents {
  constructor(game) {
    this.game = game
  }

  createProgressBar() {
    const group = new THREE.Group()
    const bg = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.12), new THREE.MeshBasicMaterial({ color: 0x33373f, transparent: true }))
    const fill = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.12), new THREE.MeshBasicMaterial({ color: 0x35c46d }))
    fill.position.z = 0.001
    fill.scale.x = 0
    bg.position.z = 0
    group.add(bg)
    group.add(fill)
    group.userData.fill = fill
    const hbg = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.1), new THREE.MeshBasicMaterial({ color: 0x33373f, transparent: true }))
    const hfill = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.1), new THREE.MeshBasicMaterial({ color: 0xd14b4b }))
    hbg.position.set(0, -0.18, 0)
    hfill.position.set(0, -0.18, 0.001)
    hfill.scale.x = 1
    group.add(hbg)
    group.add(hfill)
    group.userData.hpFill = hfill
    group.visible = false
    return group
  }

  createCropProgressBar() {
    const group = new THREE.Group()
    const bg = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.1), new THREE.MeshBasicMaterial({ color: 0x33373f, transparent: true, opacity: 0.8 }))
    const fill = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.1), new THREE.MeshBasicMaterial({ color: 0xffa500 }))
    fill.position.z = 0.001
    fill.scale.x = 0
    bg.position.z = 0
    group.add(bg)
    group.add(fill)
    group.userData.fill = fill
    group.visible = true
    return group
  }
}

