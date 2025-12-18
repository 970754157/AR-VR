import * as THREE from 'https://unpkg.com/three@0.164.0/build/three.module.js'

// 加载 pathfinding 库
let PF = null
let pathfinder = null

// 初始化 pathfinding
async function initPathfinding() {
  if (PF) return
  
  try {
    // 尝试从 CDN 加载 pathfinding 库
    importScripts('https://cdn.jsdelivr.net/npm/pathfinding@0.4.18/pathfinding-browser.min.js')
    PF = self.PF
    
    if (!PF) {
      console.warn('Pathfinding library not loaded, falling back to linear interpolation')
      return
    }
    
    // 初始化寻路器
    const worldSize = 200
    const cellSize = 2
    const gridSize = Math.floor(worldSize / cellSize)
    
    pathfinder = {
      cellSize,
      gridSize,
      grid: new PF.Grid(gridSize, gridSize),
      finder: new PF.AStarFinder({
        allowDiagonal: true,
        dontCrossCorners: true
      }),
      
      worldToGrid(v) {
        return {
          x: Math.floor((v.x + this.gridSize * this.cellSize / 2) / this.cellSize),
          y: Math.floor((v.z + this.gridSize * this.cellSize / 2) / this.cellSize)
        }
      },
      
      gridToWorld(x, y) {
        return {
          x: x * this.cellSize - this.gridSize * this.cellSize / 2 + this.cellSize / 2,
          y: 0.7,
          z: y * this.cellSize - this.gridSize * this.cellSize / 2 + this.cellSize / 2
        }
      },
      
      rebuildGrid(obstacles = []) {
        this.grid = new PF.Grid(this.gridSize, this.gridSize)
        
        for (const o of obstacles) {
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
    }
  } catch (error) {
    console.warn('Failed to load pathfinding library:', error)
  }
}

// 初始化
initPathfinding()

self.onmessage = async (e) => {
  const msg = e.data
  
  if (msg.type === 'findPath') {
    // 确保 pathfinding 已初始化
    await initPathfinding()
    
    if (pathfinder && PF) {
      try {
        // 重建网格（使用传入的障碍物信息，如果有的话）
        const obstacles = msg.obstacles || []
        pathfinder.rebuildGrid(obstacles)
        
        // 转换坐标
        const s = pathfinder.worldToGrid(msg.start)
        const e = pathfinder.worldToGrid(msg.end)
        
        // 检查边界
        if (!pathfinder.grid.isInside(s.x, s.y) || !pathfinder.grid.isInside(e.x, e.y)) {
          // 如果超出边界，使用线性插值作为后备
          const steps = 30
          const path = []
          for (let i = 0; i <= steps; i++) {
            const t = i / steps
            path.push({
              x: msg.start.x + (msg.end.x - msg.start.x) * t,
              y: msg.start.y + (msg.end.y - msg.start.y) * t,
              z: msg.start.z + (msg.end.z - msg.start.z) * t
            })
          }
          self.postMessage({ type: 'path', id: msg.id, path })
          return
        }
        
        // 使用 A* 算法查找路径
        const gridClone = pathfinder.grid.clone()
        const path = pathfinder.finder.findPath(s.x, s.y, e.x, e.y, gridClone)
        
        if (!path || path.length === 0) {
          // 如果找不到路径，使用线性插值作为后备
          const steps = 30
          const fallbackPath = []
          for (let i = 0; i <= steps; i++) {
            const t = i / steps
            fallbackPath.push({
              x: msg.start.x + (msg.end.x - msg.start.x) * t,
              y: msg.start.y + (msg.end.y - msg.start.y) * t,
              z: msg.start.z + (msg.end.z - msg.start.z) * t
            })
          }
          self.postMessage({ type: 'path', id: msg.id, path: fallbackPath })
          return
        }
        
        // 转换为世界坐标
        const worldPath = path.map(p => pathfinder.gridToWorld(p[0], p[1]))
        self.postMessage({ type: 'path', id: msg.id, path: worldPath })
      } catch (error) {
        console.error('Pathfinding error:', error)
        // 出错时使用线性插值作为后备
        const steps = 30
        const path = []
        for (let i = 0; i <= steps; i++) {
          const t = i / steps
          path.push({
            x: msg.start.x + (msg.end.x - msg.start.x) * t,
            y: msg.start.y + (msg.end.y - msg.start.y) * t,
            z: msg.start.z + (msg.end.z - msg.start.z) * t
          })
        }
        self.postMessage({ type: 'path', id: msg.id, path })
      }
    } else {
      // 如果 pathfinding 库未加载，使用线性插值
      const steps = 30
      const path = []
      for (let i = 0; i <= steps; i++) {
        const t = i / steps
        path.push({
          x: msg.start.x + (msg.end.x - msg.start.x) * t,
          y: msg.start.y + (msg.end.y - msg.start.y) * t,
          z: msg.start.z + (msg.end.z - msg.start.z) * t
        })
      }
      self.postMessage({ type: 'path', id: msg.id, path })
    }
  }
}
