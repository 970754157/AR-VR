export class AIManager {
  constructor() {
    this.worker = new Worker('./workers/worker.js', { type: 'module' })
  }
  findPath(start, end) {
    return new Promise((resolve) => {
      const id = Math.random().toString(36).slice(2)
      const handler = (e) => {
        const msg = e.data
        if (msg.type === 'path' && msg.id === id) {
          this.worker.removeEventListener('message', handler)
          resolve(msg.path)
        }
      }
      this.worker.addEventListener('message', handler)
      this.worker.postMessage({ type: 'findPath', id, start, end })
    })
  }
}
