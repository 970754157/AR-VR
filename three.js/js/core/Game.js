import * as THREE from 'https://unpkg.com/three@0.164.0/build/three.module.js'
import { GameState } from './GameState.js'
import { AIManager } from './AI.js'
export class Game {
  constructor(scene, config, camera, notify) {
    this.scene = scene
    this.state = new GameState(config)
    this.ai = new AIManager()
    this.camera = camera
    this.notify = notify || (() => {})
    this.ground = this.createGround()
    this.scene.add(this.ground)
    this.workerMeshes = []
    this.moveSpeed = 14
    this.updateWorkersIdleWeights()
  }
  createFadeMaterial(color) {
    const mat = new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.0 })
    return mat
  }
  createPalace(at) {
    const group = new THREE.Group()
    group.position.copy(at)
    group.position.y = 0
    const stone = this.createFadeMaterial(0x9fa4a6)
    const roof = this.createFadeMaterial(0x704c2e)
    const accent = this.createFadeMaterial(0xb89f5b)
    const hall = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 4), stone)
    hall.position.set(0, 1.6, 0)
    hall.castShadow = true
    hall.receiveShadow = true
    group.add(hall)
    const roofMesh = new THREE.Mesh(new THREE.ConeGeometry(3.4, 1.6, 4), roof)
    roofMesh.rotation.y = Math.PI / 4
    roofMesh.position.set(0, 3.8, 0)
    roofMesh.castShadow = true
    group.add(roofMesh)
    const towerGeo = new THREE.CylinderGeometry(0.6, 0.6, 4, 10)
    const towerTopGeo = new THREE.ConeGeometry(0.7, 1.2, 6)
    const towerPositions = [
      new THREE.Vector3(2.8, 2.0, 1.8),
      new THREE.Vector3(-2.8, 2.0, 1.8),
      new THREE.Vector3(2.8, 2.0, -1.8),
      new THREE.Vector3(-2.8, 2.0, -1.8),
    ]
    for (const p of towerPositions) {
      const t = new THREE.Mesh(towerGeo, stone); t.position.copy(p); t.castShadow = true; t.receiveShadow = true; group.add(t)
      const tt = new THREE.Mesh(towerTopGeo, accent); tt.position.copy(p.clone().add(new THREE.Vector3(0, 2.6, 0))); tt.castShadow = true; group.add(tt)
    }
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.5), this.createFadeMaterial(0xd14b4b))
    banner.position.set(0, 2.4, 2.3)
    group.add(banner)
    group.userData.fade = 0
    group.userData.mats = [stone, roof, accent, banner.material]
    group.visible = false
    return group
  }
  createPalaceVariant(at) {
    const v = Math.floor(Math.random() * 3)
    if (v === 0) return this.createPalace(at)
    if (v === 1) {
      const group = new THREE.Group()
      group.position.copy(at); group.position.y = 0
      const stone = this.createFadeMaterial(0x9fa4a6)
      const roof = this.createFadeMaterial(0x704c2e)
      const hall = new THREE.Mesh(new THREE.BoxGeometry(7, 2.8, 5), stone)
      hall.position.set(0, 1.4, 0); hall.castShadow = true; group.add(hall)
      const roof1 = new THREE.Mesh(new THREE.ConeGeometry(3.6, 1.8, 6), roof)
      roof1.position.set(0, 3.2, 0); group.add(roof1)
      const towerL = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 3.4, 10), stone)
      const towerR = towerL.clone()
      towerL.position.set(-3.2, 1.7, 2.0); towerR.position.set(3.2, 1.7, 2.0); group.add(towerL); group.add(towerR)
      group.userData.fade = 0; group.userData.mats = [stone, roof, hall.material, roof1.material, towerL.material]
      group.visible = false
      return group
    } else {
      const group = new THREE.Group()
      group.position.copy(at); group.position.y = 0
      const stone = this.createFadeMaterial(0x9fa4a6)
      const roof = this.createFadeMaterial(0x6a3b28)
      const base = new THREE.Mesh(new THREE.BoxGeometry(6.4, 2.4, 6.4), stone)
      base.position.set(0, 1.2, 0); base.castShadow = true; group.add(base)
      const roofA = new THREE.Mesh(new THREE.ConeGeometry(3.0, 1.4, 4), roof)
      roofA.rotation.y = Math.PI / 4; roofA.position.set(0, 2.9, 0); group.add(roofA)
      group.userData.fade = 0; group.userData.mats = [stone, roof, base.material, roofA.material]; group.visible = false
      return group
    }
  }
  createGround() {
    const geo = new THREE.PlaneGeometry(300, 300)
    const mat = new THREE.MeshStandardMaterial({ color: 0x7ea36c })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.rotation.x = -Math.PI / 2
    mesh.receiveShadow = true
    return mesh
  }
  addFoundationAt(point, buildType = 'palace') {
    const configs = {
      palace: { size: new THREE.Vector3(6, 1, 6), cost: { stone: 30, wood: 10, gold: 20 } },
      castle: { size: new THREE.Vector3(8, 1, 6), cost: { stone: 50, wood: 25, gold: 60 } },
      library: { size: new THREE.Vector3(8, 1, 8), cost: { stone: 40, wood: 20, gold: 50 } },
      farm: { size: new THREE.Vector3(10, 1, 10), cost: { stone: 10, wood: 5, gold: 10 } },
      school: { size: new THREE.Vector3(7, 1, 7), cost: { stone: 35, wood: 25, gold: 45 } },
      wall: { size: new THREE.Vector3(12, 1, 3), cost: { stone: 60, wood: 15, gold: 30 } },
      road: { size: new THREE.Vector3(16, 0.5, 3), cost: { stone: 20, wood: 5, gold: 15 } },
      bridge: { size: new THREE.Vector3(14, 1, 4), cost: { stone: 55, wood: 35, gold: 80 } },
      river: { size: new THREE.Vector3(12, 0.2, 3), cost: { stone: 0, wood: 0, gold: 0 } }
    }
    const cfg = configs[buildType] || configs.palace
    if (!this.state.resources.consume(cfg.cost)) return false
    const geo = new THREE.BoxGeometry(cfg.size.x, cfg.size.y, cfg.size.z)
    const mat = new THREE.MeshStandardMaterial({ color: 0x8b7d6b })
    const base = new THREE.Mesh(geo, mat)
    base.position.set(point.x, 0.5, point.z)
    base.castShadow = true
    base.receiveShadow = true
    this.scene.add(base)
    base.scale.y = 0.1
    this.state.addStructure({ type: 'foundation', mesh: base, progress: 0, completed: false, forType: buildType })
    return true
  }
  addFoundation() {
    const cost = { stone: 30, wood: 10 }
    if (!this.state.resources.consume(cost)) return false
    const geo = new THREE.BoxGeometry(6, 1, 6)
    const mat = new THREE.MeshStandardMaterial({ color: 0x8b7d6b })
    const base = new THREE.Mesh(geo, mat)
    base.position.set(0, 0.5, 0)
    base.castShadow = true
    base.receiveShadow = true
    this.scene.add(base)
    base.scale.y = 0.1
    this.state.addStructure({ type: 'foundation', mesh: base, progress: 0, completed: false })
    return true
  }
  spawnWorker() {
    if (!this.state.resources.consume({ food: 5, gold: 5 })) return false
    const mesh = this.createStickWorker()
    mesh.position.set((Math.random() - 0.5) * 100, 0.7, (Math.random() - 0.5) * 100)
    mesh.castShadow = true
    this.scene.add(mesh)
    const worker = { mesh, state: 'idle', hp: 100, baseY: mesh.position.y, idleTimer: 0, idleBehavior: null }
    this.state.addWorker(worker)
    this.workerMeshes.push(mesh)
    this.applyPersonality(worker)
    return true
  }
  createStickWorker() {
    const group = new THREE.Group()
    const limb = new THREE.MeshStandardMaterial({ color: 0x0f1a2b })
    const headMat = new THREE.MeshStandardMaterial({ color: 0x2b7cff })
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.9, 12), limb)
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), headMat)
    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.7, 12), limb)
    const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.7, 12), limb)
    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.6, 12), limb)
    const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.6, 12), limb)
    body.position.set(0, 0, 0)
    head.position.set(0, 0.65, 0)
    armL.position.set(-0.4, 0.2, 0)
    armR.position.set(0.4, 0.2, 0)
    legL.position.set(-0.15, -0.6, 0)
    legR.position.set(0.15, -0.6, 0)
    armL.rotation.z = Math.PI / 2
    armR.rotation.z = Math.PI / 2
    legL.rotation.x = 0.1
    legR.rotation.x = -0.1
    for (const m of [body, head, armL, armR, legL, legR]) { m.castShadow = true; group.add(m) }
    return group
  }
  applyPersonality(w) {
    const base = this.state.idleWeights
    const v = this.state.personalityVariance
    const jitter = (x) => x * (1 + (Math.random() * 2 - 1) * v)
    const r = jitter(base.rest), c = jitter(base.cheer), wa = jitter(base.wander)
    const sum = r + c + wa
    w.idleWeights = { rest: r / sum, cheer: c / sum, wander: wa / sum }
  }
  updateWorkersIdleWeights() {
    for (const w of this.state.workers) this.applyPersonality(w)
  }
  killWorker(w) {
    this.scene.remove(w.mesh)
    if (w.progressBar) this.scene.remove(w.progressBar)
    const idx = this.state.workers.indexOf(w)
    if (idx >= 0) this.state.workers.splice(idx, 1)
    this.state.resources.add({ workers: -1 })
  }
  createCastleVariant(at) {
    const v = Math.floor(Math.random() * 3)
    if (v === 0) {
      const group = new THREE.Group()
      group.position.copy(at); group.position.y = 0
      const stone = this.createFadeMaterial(0xa7abb0)
      const roof = this.createFadeMaterial(0x3f3a3a)
      const base = new THREE.Mesh(new THREE.BoxGeometry(8, 3, 6), stone)
      base.position.set(0, 1.5, 0); base.castShadow = true; group.add(base)
      const roofA = new THREE.Mesh(new THREE.ConeGeometry(3.5, 1.5, 4), roof)
      roofA.rotation.y = Math.PI / 4; roofA.position.set(0, 3.5, 0); group.add(roofA)
      group.userData.fade = 0; group.userData.mats = [stone, roof, base.material, roofA.material]; group.visible = false
      return group
    } else if (v === 1) {
      const group = new THREE.Group()
      group.position.copy(at); group.position.y = 0
      const stone = this.createFadeMaterial(0x9ea3a8)
      const roof = this.createFadeMaterial(0x4a4545)
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 6, 16), stone)
      tower.position.set(0, 3, 0); tower.castShadow = true; group.add(tower)
      const cap = new THREE.Mesh(new THREE.ConeGeometry(1.4, 1.6, 8), roof)
      cap.position.set(0, 6.8, 0); group.add(cap)
      group.userData.fade = 0; group.userData.mats = [stone, roof, tower.material, cap.material]; group.visible = false
      return group
    } else {
      const group = new THREE.Group()
      group.position.copy(at); group.position.y = 0
      const stone = this.createFadeMaterial(0xa7abb0)
      const roof = this.createFadeMaterial(0x3f3a3a)
      const accent = this.createFadeMaterial(0xc7b17a)
      const base = new THREE.Mesh(new THREE.BoxGeometry(7, 2.6, 5), stone)
      base.position.set(0, 1.3, 0); base.castShadow = true; base.receiveShadow = true; group.add(base)
      const gable = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.4, 3), roof)
      gable.position.set(0, 3.5, 0); group.add(gable)
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 5, 12), stone)
      tower.position.set(-3.4, 2.5, -2.2); group.add(tower)
      const spire = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.6, 6), accent)
      spire.position.set(-3.4, 4.7, -2.2); group.add(spire)
      group.userData.fade = 0; group.userData.mats = [stone, roof, accent, gable.material, base.material, tower.material, spire.material]; group.visible = false
      return group
    }
  }
  createLibraryVariant(at) {
    const v = Math.floor(Math.random() * 3)
    const group = new THREE.Group()
    group.position.copy(at); group.position.y = 0
    const stone = this.createFadeMaterial(0xb3b7bb)
    const roof = this.createFadeMaterial(0x6b3f2c)
    const trim = this.createFadeMaterial(0xe3d7b4)
    if (v === 0) {
      const hall = new THREE.Mesh(new THREE.BoxGeometry(8, 3.2, 6), stone)
      hall.position.set(0, 1.6, 0); hall.castShadow = true; hall.receiveShadow = true; group.add(hall)
      const roofMain = new THREE.Mesh(new THREE.ConeGeometry(4.2, 1.6, 4), roof)
      roofMain.rotation.y = Math.PI / 4; roofMain.position.set(0, 3.6, 0); group.add(roofMain)
      const entrance = new THREE.Mesh(new THREE.BoxGeometry(2, 2.4, 0.4), trim)
      entrance.position.set(0, 1.2, 3.2); group.add(entrance)
      group.userData.mats = [stone, roof, trim, roofMain.material, entrance.material, hall.material]
    } else if (v === 1) {
      const hall = new THREE.Mesh(new THREE.BoxGeometry(9, 3.0, 5), stone)
      hall.position.set(0, 1.5, 0); group.add(hall)
      const roofMain = new THREE.Mesh(new THREE.ConeGeometry(4.0, 1.4, 6), roof)
      roofMain.position.set(0, 3.2, 0); group.add(roofMain)
      group.userData.mats = [stone, roof, hall.material, roofMain.material]
    } else {
      const hall = new THREE.Mesh(new THREE.BoxGeometry(7, 3.4, 7), stone)
      hall.position.set(0, 1.7, 0); group.add(hall)
      const roofMain = new THREE.Mesh(new THREE.ConeGeometry(3.6, 1.8, 3), roof)
      roofMain.position.set(0, 3.6, 0); group.add(roofMain)
      group.userData.mats = [stone, roof, hall.material, roofMain.material]
    }
    group.userData.fade = 0
    group.visible = false
    return group
  }
  createWallVariant(at) {
    const v = Math.floor(Math.random() * 3)
    const group = new THREE.Group()
    group.position.copy(at); group.position.y = 0
    const stone = this.createFadeMaterial(0x9aa0a3)
    const accent = this.createFadeMaterial(0x8b7d6b)
    if (v === 0) {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(12, 2.2, 2.6), stone)
      wall.position.set(0, 1.1, 0); group.add(wall)
      group.userData.mats = [stone, wall.material]
    } else if (v === 1) {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(12, 2.6, 2.6), stone)
      wall.position.set(0, 1.3, 0); group.add(wall)
      for (let i = -5; i <= 5; i += 2) {
        const crenel = new THREE.Mesh(new THREE.BoxGeometry(1, 0.6, 0.6), accent)
        crenel.position.set(i, 3.0, 0.9)
        group.add(crenel)
      }
      group.userData.mats = [stone, accent, wall.material]
    } else {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(14, 2.2, 3.0), stone)
      wall.position.set(0, 1.1, 0); group.add(wall)
      const towerL = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 3.6, 12), stone)
      const towerR = towerL.clone()
      towerL.position.set(-7.2, 1.8, -0.6); towerR.position.set(7.2, 1.8, -0.6)
      group.add(towerL); group.add(towerR)
      group.userData.mats = [stone, wall.material, towerL.material]
    }
    group.userData.fade = 0
    group.visible = false
    return group
  }
  createFarmVariant(at) {
    const v = Math.floor(Math.random() * 3)
    const group = new THREE.Group()
    group.position.copy(at); group.position.y = 0
    const soil = this.createFadeMaterial(0x8c6b4f)
    const crop = this.createFadeMaterial(0x4caf50)
    if (v === 0) {
      const patch = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), soil); patch.rotation.x = -Math.PI/2; group.add(patch)
      for (let i= -4; i<=4; i+=2) {
        const row = new THREE.Mesh(new THREE.BoxGeometry(10, 0.1, 0.2), crop)
        row.position.set(0, 0.06, i)
        group.add(row)
      }
      group.userData.mats = [soil, crop]
    } else if (v === 1) {
      const patch = new THREE.Mesh(new THREE.PlaneGeometry(12, 8), soil); patch.rotation.x = -Math.PI/2; group.add(patch)
      for (let i= -5; i<=5; i+=2) {
        const row = new THREE.Mesh(new THREE.BoxGeometry(12, 0.1, 0.25), crop)
        row.position.set(0, 0.06, i*0.7)
        group.add(row)
      }
      group.userData.mats = [soil, crop]
    } else {
      const patch = new THREE.Mesh(new THREE.PlaneGeometry(8, 12), soil); patch.rotation.x = -Math.PI/2; group.add(patch)
      for (let i= -5; i<=5; i+=2) {
        const row = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.4, 0.25), crop)
        row.position.set(i*0.7, 0.2, 0)
        group.add(row)
      }
      group.userData.mats = [soil, crop]
    }
    group.userData.fade = 0
    group.visible = false
    return group
  }
  createSchoolVariant(at) {
    const v = Math.floor(Math.random() * 3)
    const group = new THREE.Group()
    group.position.copy(at); group.position.y = 0
    const stone = this.createFadeMaterial(0xbdbfc2)
    const roof = this.createFadeMaterial(0x7a4b36)
    if (v === 0) {
      const body = new THREE.Mesh(new THREE.BoxGeometry(7, 2.6, 4), stone); body.position.set(0,1.3,0); group.add(body)
      const r = new THREE.Mesh(new THREE.ConeGeometry(3.2,1.4,4), roof); r.rotation.y=Math.PI/4; r.position.set(0,2.8,0); group.add(r)
      group.userData.mats = [stone, roof, body.material, r.material]
    } else if (v === 1) {
      const body = new THREE.Mesh(new THREE.BoxGeometry(8, 2.8, 5), stone); body.position.set(0,1.4,0); group.add(body)
      const r = new THREE.Mesh(new THREE.ConeGeometry(3.0,1.2,6), roof); r.position.set(0,2.7,0); group.add(r)
      group.userData.mats = [stone, roof, body.material, r.material]
    } else {
      const body = new THREE.Mesh(new THREE.BoxGeometry(6, 2.4, 6), stone); body.position.set(0,1.2,0); group.add(body)
      const r = new THREE.Mesh(new THREE.ConeGeometry(2.8,1.3,3), roof); r.position.set(0,2.6,0); group.add(r)
      group.userData.mats = [stone, roof, body.material, r.material]
    }
    group.userData.fade = 0
    group.visible = false
    return group
  }
  createRoadVariant(at) {
    const v = Math.floor(Math.random() * 3)
    const group = new THREE.Group()
    group.position.copy(at); group.position.y = 0
    const asphalt = this.createFadeMaterial(0x4a4d52)
    const edge = this.createFadeMaterial(0xbfbfbf)
    const len = v===0? 14 : v===1 ? 10 : 8
    const w = v===0? 3 : v===1 ? 2.5 : 2.2
    const road = new THREE.Mesh(new THREE.BoxGeometry(len, 0.1, w), asphalt)
    road.position.set(0,0.05,0); road.castShadow=false; road.receiveShadow=true; group.add(road)
    const e1 = new THREE.Mesh(new THREE.BoxGeometry(len, 0.05, 0.1), edge); e1.position.set(0,0.1, w/2 - 0.05); group.add(e1)
    const e2 = e1.clone(); e2.position.set(0,0.1, -w/2 + 0.05); group.add(e2)
    group.userData.fade = 0; group.userData.mats = [asphalt, edge, road.material, e1.material]
    group.visible = false
    return group
  }
  createBridgeVariant(at) {
    const v = Math.floor(Math.random() * 3)
    const group = new THREE.Group()
    group.position.copy(at); group.position.y = 0
    const stone = this.createFadeMaterial(0x9aa0a3)
    const deck = new THREE.Mesh(new THREE.BoxGeometry(10, 0.4, 3), stone)
    deck.position.set(0,0.2,0); group.add(deck)
    for (let i=-3;i<=3;i+=3){
      const arch = new THREE.Mesh(new THREE.TorusGeometry(1.2,0.2,12,24,Math.PI), stone)
      arch.rotation.x = Math.PI/2
      arch.position.set(i, -0.1, 0)
      group.add(arch)
    }
    group.userData.fade = 0; group.userData.mats = [stone, deck.material]
    group.visible = false
    return group
  }
  createRiverVariant(at) {
    const v = Math.floor(Math.random() * 3)
    const group = new THREE.Group()
    group.position.copy(at); group.position.y = 0
    const water = new THREE.MeshStandardMaterial({ color: 0x3da0ff, transparent: true, opacity: 0.0, roughness: 0.2, metalness: 0.0 })
    const len = v===0? 16 : v===1? 12 : 10
    const w = v===0? 4 : v===1? 3.5 : 3.0
    const plane = new THREE.Mesh(new THREE.BoxGeometry(len, 0.05, w), water)
    plane.position.set(0,0.025,0)
    group.add(plane)
    group.userData.fade = 0; group.userData.mats = [water, plane.material]
    group.visible = false
    return group
  }
  createProgressBar() {
    const group = new THREE.Group()
    const bg = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.12), new THREE.MeshBasicMaterial({ color: 0x33373f, transparent: true }))
    const fill = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.12), new THREE.MeshBasicMaterial({ color: 0x35c46d }))
    fill.position.z = 0.001
    fill.scale.x = 0
    bg.position.z = 0
    group.add(bg)
    group.add(fill)
    group.userData.fill = fill
    const hbg = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.1), new THREE.MeshBasicMaterial({ color: 0x33373f, transparent: true }))
    const hfill = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.1), new THREE.MeshBasicMaterial({ color: 0xd14b4b }))
    hbg.position.set(0, -0.18, 0)
    hfill.position.set(0, -0.18, 0.001)
    hfill.scale.x = 1
    group.add(hbg)
    group.add(hfill)
    group.userData.hpFill = hfill
    group.visible = false
    return group
  }
  assignWork() {
    const candidates = this.state.structures.filter(s => s.type === 'foundation' && !s.completed)
    if (!candidates.length) return
    const foundation = candidates.reduce((a, b) => (a.progress < b.progress ? a : b))
    const idle = this.state.workers.find(w => w.state === 'idle' || w.state === 'wandering')
    if (!idle) return
    idle.state = 'moving'
    const start = idle.mesh.position.clone()
    const end = foundation.mesh.position.clone().add(new THREE.Vector3((Math.random() - 0.5) * 3, 0.7, (Math.random() - 0.5) * 3))
    this.ai.findPath({ x: start.x, y: start.y, z: start.z }, { x: end.x, y: end.y, z: end.z }).then(path => {
      idle.path = path
      idle.pathIndex = 0
      idle.state = 'moving'
      idle.targetStructure = foundation
    })
  }
  update(dt) {
    this.state.tick(dt)
    for (const w of this.state.workers) {
      if (w.state === 'moving' && w.path) {
        if (w.targetStructure && w.targetStructure.completed) {
          w.state = 'idle'
          w.path = null
          continue
        }
        const target = w.path[Math.min(w.pathIndex, w.path.length - 1)]
        const t = new THREE.Vector3(target.x, target.y, target.z)
        w.mesh.position.lerp(t, Math.min(1, dt * this.moveSpeed))
        if (w.mesh.position.distanceTo(t) < 0.05) {
          w.pathIndex += 1
          if (w.pathIndex >= w.path.length) {
            w.state = 'working'
            w.workTime = 0
            if (!w.progressBar) {
              w.progressBar = this.createProgressBar()
              this.scene.add(w.progressBar)
            }
            w.progressBar.visible = true
          }
        }
      } else if (w.state === 'working') {
        w.workTime += dt * this.state.speed
        if (w.progressBar) {
          const pct = Math.min(1, w.workTime / 2)
          w.progressBar.userData.fill.scale.x = pct
          w.progressBar.position.copy(w.mesh.position).add(new THREE.Vector3(0, 1.3, 0))
          w.progressBar.lookAt(this.camera.position)
          if (w.hp != null && w.progressBar.userData.hpFill) {
            const ratio = Math.max(0, w.hp / 100)
            w.progressBar.userData.hpFill.scale.x = ratio
          }
        }
        if (w.workTime >= 2) {
          w.state = 'idle'
           if (w.progressBar) {
             w.progressBar.visible = false
             w.progressBar.userData.fill.scale.x = 0
            }
           const foundation = (w.targetStructure && !w.targetStructure.completed) ? w.targetStructure : null
           if (foundation) {
             foundation.progress = Math.min(1, foundation.progress + 0.25)
             foundation.mesh.scale.y = Math.max(0.1, foundation.progress)
             if (w.hp != null) w.hp = Math.max(0, w.hp - 25)
             if (foundation.progress >= 1 && !foundation.completed) {
               foundation.completed = true
               this.notify('地基建造完成')
               let building
               const t = foundation.forType || 'palace'
               if (t === 'palace') building = this.createPalaceVariant(foundation.mesh.position)
               else if (t === 'castle') building = this.createCastleVariant(foundation.mesh.position)
               else if (t === 'library') building = this.createLibraryVariant(foundation.mesh.position)
               else if (t === 'farm') building = this.createFarmVariant(foundation.mesh.position)
               else if (t === 'school') building = this.createSchoolVariant(foundation.mesh.position)
               else if (t === 'wall') building = this.createWallVariant(foundation.mesh.position)
               else if (t === 'road') building = this.createRoadVariant(foundation.mesh.position)
               else if (t === 'bridge') building = this.createBridgeVariant(foundation.mesh.position)
               else if (t === 'river') building = this.createRiverVariant(foundation.mesh.position)
               else building = this.createPalaceVariant(foundation.mesh.position)
               this.scene.add(building)
               building.visible = true
               this.state.addStructure({ type: t, mesh: building })
               const msgMap = { palace: '宫殿已展示', castle: '城堡已展示', library: '图书馆已展示', farm: '农田已展示', school: '学校已展示', wall: '城墙已展示', road: '道路已展示', bridge: '桥梁已展示', river: '河流已展示' }
               this.notify(msgMap[t] || '建筑已展示')
               this.scene.remove(foundation.mesh)
               const idx = this.state.structures.indexOf(foundation)
               if (idx >= 0) this.state.structures.splice(idx, 1)
               if (w) this.killWorker(w)
               w.targetStructure = null
             }
          }
        }
      } else if (w.state === 'wandering' && w.path) {
        const target = w.path[Math.min(w.pathIndex, w.path.length - 1)]
        const t = new THREE.Vector3(target.x, target.y, target.z)
        w.mesh.position.lerp(t, Math.min(1, dt * (this.moveSpeed * 0.6)))
        if (w.mesh.position.distanceTo(t) < 0.05) {
          w.pathIndex += 1
          if (w.pathIndex >= w.path.length) {
            w.state = 'idle'
            w.path = null
          }
        }
      } else if (w.state === 'idle') {
        if (w.idleTimer > 0) {
          w.idleTimer -= dt
          if (w.idleBehavior === 'cheer') {
            const phase = (w._cheerPhase || 0) + dt * 6
            w._cheerPhase = phase
            w.mesh.position.y = w.baseY + Math.sin(phase) * 0.2
            w.mesh.rotation.y += dt * 0.8
          }
          if (w.idleTimer <= 0) {
            if (w.idleBehavior === 'rest') {
              if (w._idleRot) {
                w.mesh.rotation.x = w._idleRot.x
                w.mesh.rotation.y = w._idleRot.y
                w.mesh.rotation.z = w._idleRot.z
              }
              w.mesh.position.y = w.baseY
            } else if (w.idleBehavior === 'cheer') {
              w.mesh.position.y = w.baseY
            }
            w.idleBehavior = null
          }
        } else {
          const weights = w.idleWeights || this.state.idleWeights
          const r = Math.random()
          if (r < weights.rest) {
            w.idleBehavior = 'rest'
            w.idleTimer = 2 + Math.random() * 3
            w._idleRot = { x: w.mesh.rotation.x, y: w.mesh.rotation.y, z: w.mesh.rotation.z }
            w.mesh.rotation.z = Math.PI / 2
            w.mesh.rotation.x = 0
            w.mesh.position.y = 0.3
          } else if (r < (weights.rest + weights.cheer)) {
            w.idleBehavior = 'cheer'
            w.idleTimer = 2 + Math.random() * 2
            w._cheerPhase = 0
          } else {
            w.idleBehavior = 'wander'
            const start = w.mesh.position.clone()
            const end = start.clone().add(new THREE.Vector3((Math.random() - 0.5) * 8, 0, (Math.random() - 0.5) * 8))
            this.ai.findPath({ x: start.x, y: start.y, z: start.z }, { x: end.x, y: end.y, z: end.z }).then(path => {
              w.path = path
              w.pathIndex = 0
              w.state = 'wandering'
              w.idleBehavior = null
            })
          }
        }
      }
    }
   if (Math.random() < 0.01) this.state.resources.add({ stone: 1, wood: 1, food: 1, gold: 1 })
   const builds = this.state.structures.filter(s => ['palace','castle','library','farm','school','wall','road','bridge','river'].includes(s.type))
   for (const p of builds) {
     p.mesh.userData.fade = Math.min(1, p.mesh.userData.fade + dt * 0.7)
     const f = p.mesh.userData.fade
     for (const m of p.mesh.userData.mats) m.opacity = f
     p.mesh.scale.setScalar(0.9 + 0.1 * f)
   }
 }
}
