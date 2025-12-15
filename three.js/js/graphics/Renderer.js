import * as THREE from 'https://unpkg.com/three@0.164.0/build/three.module.js'
export class Renderer {
  constructor(container) {
    this.container = container
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.25
    this.renderer.physicallyCorrectLights = true
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.shadowMap.enabled = true
    container.appendChild(this.renderer.domElement)
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x91c5ff)
    window.addEventListener('resize', () => this.onResize())
  }
  onResize() {
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
  }
  getScene() { return this.scene }
  getRenderer() { return this.renderer }
}
