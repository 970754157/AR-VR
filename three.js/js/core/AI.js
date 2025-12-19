import * as THREE from 'three'
import { Pathfinder } from '../utils/Pathfinder.js'

export class AIManager {
  constructor(game = null) {
    this.game = game

    this._pathfinder = new Pathfinder({
      worldSize: 300,
      cellSize: 2,
      obstacles: () => this._getObstacleAABBs()
    })
  }

  _getObstacleAABBs() {
    if (!this.game || !this.game.state) return []

    const obstacles = []
    const structs = this.game.state.structures || []
    for (const s of structs) {
      if (!s || !s.mesh) continue
      const box = new THREE.Box3().setFromObject(s.mesh)
      box.expandByScalar(0.6)
      obstacles.push({ min: box.min, max: box.max })
    }
    return obstacles
  }
  
  /**
   * 简单的直线路径生成（已移除寻路算法）
   * @param {Object} start - 起始位置 {x, y, z}
   * @param {Object} end - 目标位置 {x, y, z}
   * @returns {Promise<Array>} 返回路径点数组，每个元素包含 {x, y, z}
   */
  findPath(start, end) {
    return new Promise((resolve) => {
      // 生成简单的直线路径
      const steps = 20 // 路径点数量
      const path = []
      
      for (let i = 0; i <= steps; i++) {
        const t = i / steps
        path.push({
          x: start.x + (end.x - start.x) * t,
          y: start.y + (end.y - start.y) * t,
          z: start.z + (end.z - start.z) * t
        })
      }
      
      // 立即返回路径（保持 Promise 接口以兼容现有代码）
      resolve(path)
    })
  }

  /**
   * A* 网格寻路（优先用于需要避障的跟随/移动）
   * @param {Object} start - 起始位置 {x, y, z}
   * @param {Object} end - 目标位置 {x, y, z}
   * @returns {Promise<Array>} 路径点数组（元素具备 x/y/z）
   */
  findPathAStar(start, end) {
    if (!this._pathfinder) return this.findPath(start, end)
    return this._pathfinder.findPath(start, end).catch(() => this.findPath(start, end))
  }
}
