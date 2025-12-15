import * as THREE from 'https://unpkg.com/three@0.164.0/build/three.module.js'
export const setupLighting = (scene) => {
  const hemi = new THREE.HemisphereLight(0xcfe9ff, 0x9aa0a3, 0.7)
  scene.add(hemi)
  const ambient = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambient)
  const sun = new THREE.DirectionalLight(0xfff1c4, 1.4)
  sun.position.set(40, 60, 30)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  sun.shadow.camera.near = 1
  sun.shadow.camera.far = 200
  sun.shadow.camera.left = -50
  sun.shadow.camera.right = 50
  sun.shadow.camera.top = 50
  sun.shadow.camera.bottom = -50
  scene.add(sun)
}
