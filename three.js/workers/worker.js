import * as THREE from 'https://unpkg.com/three@0.164.0/build/three.module.js'
self.onmessage = (e) => {
  const msg = e.data
  if (msg.type === 'findPath') {
    const steps = 30
    const path = []
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const x = msg.start.x + (msg.end.x - msg.start.x) * t
      const y = msg.start.y + (msg.end.y - msg.start.y) * t
      const z = msg.start.z + (msg.end.z - msg.start.z) * t
      path.push({ x, y, z })
    }
    self.postMessage({ type: 'path', id: msg.id, path })
  }
}
