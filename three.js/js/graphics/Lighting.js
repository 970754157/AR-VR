import * as THREE from 'https://unpkg.com/three@0.164.0/build/three.module.js'

// 初始化基础光照，并返回可被主题切换复用的灯光引用
export const setupLighting = (scene) => {
  const hemi = new THREE.HemisphereLight(0xcfe9ff, 0x9aa0a3, 0.7)
  scene.add(hemi)

  const ambient = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambient)

  const sun = new THREE.DirectionalLight(0xfff1c4, 1.4)
  sun.position.set(40, 60, 30)
  scene.add(sun)

  // 天空中的“太阳”视觉元素
  // 半径从 3 调大到 6，让太阳在天空中更醒目
  const sunGeom = new THREE.SphereGeometry(6, 32, 32)
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xfff3c0 })
  const sunMesh = new THREE.Mesh(sunGeom, sunMat)
  sunMesh.position.set(80, 80, -40)
  sunMesh.matrixAutoUpdate = true
  sunMesh.castShadow = false
  sunMesh.receiveShadow = false
  scene.add(sunMesh)

  // 夜空中的“月亮”
  const moonGeom = new THREE.SphereGeometry(6, 32, 32)
  const moonMat = new THREE.MeshBasicMaterial({ color: 0xdfe8ff })
  const moonMesh = new THREE.Mesh(moonGeom, moonMat)
  moonMesh.position.set(-70, 70, 30)
  moonMesh.matrixAutoUpdate = true
  moonMesh.castShadow = false
  moonMesh.receiveShadow = false
  moonMesh.visible = false
  scene.add(moonMesh)

  // 夜空中的“星星”点云
  const starGeometry = new THREE.BufferGeometry()
  const starCount = 400
  const positions = new Float32Array(starCount * 3)
  for (let i = 0; i < starCount; i++) {
    const radius = 140 + Math.random() * 40
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI * 0.5 // 上半球
    const x = radius * Math.cos(theta) * Math.sin(phi)
    const y = radius * Math.cos(phi) + 40
    const z = radius * Math.sin(theta) * Math.sin(phi)
    positions[i * 3] = x
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = z
  }
  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.2,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9
  })
  const starField = new THREE.Points(starGeometry, starMaterial)
  starField.visible = false
  scene.add(starField)

  const lights = { hemi, ambient, sun, sunMesh, moonMesh, starField }
  scene.userData.lights = lights
  return lights
}

// 根据主题（白天 / 夜间）调整光照与背景
export const applyLightingTheme = (scene, glRenderer, lights, theme) => {
  if (!lights) return
  const { hemi, ambient, sun, sunMesh, moonMesh, starField } = lights
  const isDark = theme === 'dark'

  if (isDark) {
    // 夜间：偏冷，但能清楚看到地图（微暗）
    hemi.color.set(0x6f8bff)
    hemi.groundColor.set(0x050616)
    hemi.intensity = 0.35

    ambient.color.set(0x9aa8ff)
    ambient.intensity = 0.25

    sun.color.set(0xcfe0ff)
    sun.intensity = 0.55

    scene.background = new THREE.Color(0x020617)
    if (glRenderer) {
      glRenderer.toneMappingExposure = 0.9
    }
    if (sunMesh) sunMesh.visible = false
    if (moonMesh) moonMesh.visible = true
    if (starField) starField.visible = true
  } else {
    // 白天：恢复为原来的明亮暖色光照，并稍微提高亮度，和夜间对比更强
    hemi.color.set(0xcfe9ff)
    hemi.groundColor.set(0x9aa0a3)
    hemi.intensity = 0.7

    ambient.color.set(0xffffff)
    ambient.intensity = 0.6

    sun.color.set(0xfff1c4)
    sun.intensity = 1.6

    scene.background = new THREE.Color(0x91c5ff)
    if (glRenderer) {
      glRenderer.toneMappingExposure = 1.6
    }
    if (sunMesh) {
      sunMesh.visible = true
      sunMesh.material.color.set(0xfff3c0)
    }
    if (moonMesh) moonMesh.visible = false
    if (starField) starField.visible = false
  }
}
