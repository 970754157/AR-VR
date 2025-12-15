import * as THREE from 'https://unpkg.com/three@0.164.0/build/three.module.js'
import { OrbitControls } from 'https://unpkg.com/three@0.164.0/examples/jsm/controls/OrbitControls.js'
export class CameraSystem {
  constructor(container) {
    this.camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000)
    this.camera.position.set(75, 60, 75)
    this.controls = new OrbitControls(this.camera, container.querySelector('canvas'))
    this.controls.enableDamping = true
  }
  update() { this.controls.update() }
  resize(container) { this.camera.aspect = container.clientWidth / container.clientHeight; this.camera.updateProjectionMatrix() }
  getCamera() { return this.camera }
  getControls() { return this.controls }
}
