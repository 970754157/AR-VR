import * as THREE from 'https://unpkg.com/three@0.164.0/build/three.module.js'

/**
 * A* 寻路算法类
 * 使用 pathfinding.js 库实现智能寻路
 */
export class Pathfinder {
  /**
   * 构造函数
   * @param {Object} options - 配置选项
   * @param {number} options.worldSize - 世界大小（默认200）
   * @param {number} options.cellSize - 网格单元大小（默认2）
   * @param {Function} options.obstacles - 返回障碍物AABB的函数（默认空数组）
   */
  constructor({
    worldSize = 200,
    cellSize = 2,
    obstacles = () => [] // 返回障碍物 AABB
  } = {}) {
    this.cellSize = cellSize
    this.gridSize = Math.floor(worldSize / cellSize)

    // 动态导入 pathfinding 库
    this.PF = null
    this.grid = null
    this.finder = null
    this._initPathfinding()

    this.obstaclesFn = obstacles
  }

  /**
   * 初始化 pathfinding 库
   */
  async _initPathfinding() {
    // 使用 CDN 加载 pathfinding 库
    if (typeof self !== 'undefined' && self.importScripts) {
      // 在 Web Worker 环境中
      importScripts('https://cdn.jsdelivr.net/npm/pathfinding@0.4.18/pathfinding-browser.min.js')
      this.PF = self.PF
    } else {
      // 在主线程中，尝试动态导入
      try {
        const PFModule = await import('https://cdn.jsdelivr.net/npm/pathfinding@0.4.18/pathfinding-browser.min.js')
        this.PF = PFModule.default || PFModule
      } catch (e) {
        // 如果动态导入失败，尝试使用全局变量
        if (typeof PF !== 'undefined') {
          this.PF = PF
        } else {
          console.error('Pathfinding library not found. Please include pathfinding-browser.min.js')
          return
        }
      }
    }

    if (this.PF) {
      this.grid = new this.PF.Grid(this.gridSize, this.gridSize)
      this.finder = new this.PF.AStarFinder({
        allowDiagonal: true,
        dontCrossCorners: true
      })
      this._rebuildGrid()
    }
  }

  /**
   * 重建网格，标记障碍物
   */
  _rebuildGrid() {
    if (!this.PF) return
    
    this.grid = new this.PF.Grid(this.gridSize, this.gridSize)

    const obs = this.obstaclesFn()
    for (const o of obs) {
      const minX = Math.floor((o.min.x + this.gridSize * this.cellSize / 2) / this.cellSize)
      const maxX = Math.floor((o.max.x + this.gridSize * this.cellSize / 2) / this.cellSize)
      const minZ = Math.floor((o.min.z + this.gridSize * this.cellSize / 2) / this.cellSize)
      const maxZ = Math.floor((o.max.z + this.gridSize * this.cellSize / 2) / this.cellSize)

      for (let x = minX; x <= maxX; x++) {
        for (let z = minZ; z <= maxZ; z++) {
          if (this.grid.isInside(x, z)) {
            this.grid.setWalkableAt(x, z, false)
          }
        }
      }
    }
  }

  /**
   * 将世界坐标转换为网格坐标
   * @param {THREE.Vector3|Object} v - 世界坐标
   * @returns {Object} 网格坐标 {x, y}
   */
  worldToGrid(v) {
    return {
      x: Math.floor((v.x + this.gridSize * this.cellSize / 2) / this.cellSize),
      y: Math.floor((v.z + this.gridSize * this.cellSize / 2) / this.cellSize)
    }
  }

  /**
   * 将网格坐标转换为世界坐标
   * @param {number} x - 网格X坐标
   * @param {number} y - 网格Y坐标
   * @returns {THREE.Vector3} 世界坐标
   */
  gridToWorld(x, y) {
    return new THREE.Vector3(
      x * this.cellSize - this.gridSize * this.cellSize / 2 + this.cellSize / 2,
      0.7,
      y * this.cellSize - this.gridSize * this.cellSize / 2 + this.cellSize / 2
    )
  }

  /**
   * 查找路径
   * @param {THREE.Vector3|Object} start - 起点坐标
   * @param {THREE.Vector3|Object} end - 终点坐标
   * @returns {Promise<Array<THREE.Vector3>>} 路径点数组
   */
  async findPath(start, end) {
    // 确保 pathfinding 库已加载
    if (!this.PF) {
      await this._initPathfinding()
    }
    
    if (!this.PF) {
      return Promise.reject('Pathfinding library not available')
    }

    return new Promise((resolve, reject) => {
      this._rebuildGrid()

      const s = this.worldToGrid(start)
      const e = this.worldToGrid(end)

      // 检查起点和终点是否在网格内
      if (!this.grid.isInside(s.x, s.y) || !this.grid.isInside(e.x, e.y)) {
        reject('Start or end point is outside the grid')
        return
      }

      const gridClone = this.grid.clone()
      const path = this.finder.findPath(s.x, s.y, e.x, e.y, gridClone)

      if (!path || path.length === 0) {
        reject('No path found')
        return
      }

      const worldPath = path.map(p => this.gridToWorld(p[0], p[1]))
      resolve(worldPath)
    })
  }
}

