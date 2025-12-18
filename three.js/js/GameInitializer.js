import { Renderer } from './graphics/Renderer.js'
import { CameraSystem } from './graphics/Camera.js'
import { setupLighting, applyLightingTheme } from './graphics/Lighting.js'
import { UI } from './ui/UI.js'
import { Game } from './core/Game.js'

// 游戏初始化相关功能
export class GameInitializer {
  constructor(container) {
    this.container = container
    this.renderer = new Renderer(container)
    this.cameraSys = new CameraSystem(container)
    this.scene = this.renderer.getScene()
    this.lights = setupLighting(this.scene)
    this.currentTheme = null
    
    this.syncLightingWithBodyTheme()
  }

  syncLightingWithBodyTheme() {
    const isDark = document.body.classList.contains('theme-dark')
    const theme = isDark ? 'dark' : 'light'
    if (theme !== this.currentTheme) {
      applyLightingTheme(this.scene, this.renderer.getRenderer(), this.lights, theme)
      this.currentTheme = theme
    }
  }

  async initializeGame() {
    let config = { initialResources: { stone: 1000, wood: 1000, food: 1000, gold: 1000, workers: 0 } }
    try {
      const resp = await fetch('./game.json')
      if (resp.ok) config = await resp.json()
    } catch {}
    
    const game = new Game(this.scene, config, this.cameraSys.getCamera(), (msg) => this.ui.toast(msg))
    const ui = new UI(document)
    
    return { game, ui }
  }

  getRenderer() {
    return this.renderer
  }

  getCameraSys() {
    return this.cameraSys
  }

  getScene() {
    return this.scene
  }

  setUI(ui) {
    this.ui = ui
  }
}

