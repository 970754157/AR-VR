import * as THREE from 'https://unpkg.com/three@0.164.0/build/three.module.js'
export const findPath = (start, end) => {
  const steps = 20
  const path = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const x = start.x + (end.x - start.x) * t
    const y = start.y + (end.y - start.y) * t
    const z = start.z + (end.z - start.z) * t
    path.push(new THREE.Vector3(x, y, z))
  }
  return path
}
