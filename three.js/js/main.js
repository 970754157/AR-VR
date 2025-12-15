import { Renderer } from './graphics/Renderer.js'
import { CameraSystem } from './graphics/Camera.js'
import { setupLighting } from './graphics/Lighting.js'
import { UI } from './ui/UI.js'
import { Game } from './core/Game.js'
import * as THREE from 'three'
const container = document.getElementById('canvas-container')
const renderer = new Renderer(container)
const cameraSys = new CameraSystem(container)
setupLighting(renderer.getScene())
let config = { initialResources: { stone: 50, wood: 40, food: 30, gold: 20, workers: 0 } }
try {
  const resp = await fetch('./game.json')
  if (resp.ok) config = await resp.json()
} catch {}
const game = new Game(renderer.getScene(), config, cameraSys.getCamera(), (msg) => ui.toast(msg))
const ui = new UI(document)
ui.bind({
  onBuildPalace: () => { game.state.pendingBuild = true; game.state.pendingType = 'palace'; ui.toast('宫殿地基：石材30 木材10 金币20，点击地面放置') },
  onBuildCastle: () => { game.state.pendingBuild = true; game.state.pendingType = 'castle'; ui.toast('城堡地基：石材50 木材25 金币60，点击地面放置') },
  onBuildLibrary: () => { game.state.pendingBuild = true; game.state.pendingType = 'library'; ui.toast('图书馆地基：石材40 木材20 金币50，点击地面放置') },
  onBuildFarm: () => { game.state.pendingBuild = true; game.state.pendingType = 'farm'; ui.toast('农田地基：石材10 木材5 金币10，点击地面放置') },
  onBuildSchool: () => { game.state.pendingBuild = true; game.state.pendingType = 'school'; ui.toast('学校地基：石材35 木材25 金币45，点击地面放置') },
  onBuildWall: () => { game.state.pendingBuild = true; game.state.pendingType = 'wall'; ui.toast('城墙地基：石材60 木材15 金币30，点击地面放置') },
  onBuildRoad: () => { game.state.pendingBuild = true; game.state.pendingType = 'road'; ui.toast('道路地基：石材20 木材5 金币15，点击地面放置') },
  onBuildBridge: () => { game.state.pendingBuild = true; game.state.pendingType = 'bridge'; ui.toast('桥梁地基：石材55 木材35 金币80，点击地面放置') },
  onBuildRiver: () => { game.state.pendingBuild = true; game.state.pendingType = 'river'; ui.toast('河流地基：石材0 木材0 金币0，点击地面放置') },
  onSpawn: () => game.spawnWorker(),
  onSpeed: (s) => game.state.setSpeed(s),
  onBehaviorProbChange: (weights) => { 
    game.state.setIdleWeights(weights)
    game.updateWorkersIdleWeights()
  }
})
const raycaster = new THREE.Raycaster()
function onPointerDown(e) {
  if (!game.state.pendingBuild) return
  const rect = container.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  const y = -((e.clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera({ x, y }, cameraSys.getCamera())
  const inter = raycaster.intersectObject(game.ground, false)[0]
  if (inter && inter.point) {
    const ok = game.addFoundationAt(inter.point, game.state.pendingType)
    if (ok) { ui.toast('已安置地基'); game.state.pendingBuild = false }
    else { ui.toast('资源不足') }
  }
}
container.addEventListener('pointerdown', onPointerDown)
let last = performance.now()
function loop() {
  const now = performance.now()
  const dt = Math.min(0.05, (now - last) / 1000)
  last = now
  game.update(dt)
  ui.update(game.state)
  cameraSys.update()
  cameraSys.resize(container)
  renderer.getRenderer().render(renderer.getScene(), cameraSys.getCamera())
  if (Math.random() < 0.02) game.assignWork()
  requestAnimationFrame(loop)
}
loop()
