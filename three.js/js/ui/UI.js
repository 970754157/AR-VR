import { HUD } from './HUD.js'
import { Menu } from './Menu.js'
export class UI {
  constructor(doc) {
    this.hud = new HUD(doc.querySelector('#hud'))
    this.menu = new Menu(doc.querySelector('#menu'))
    this.toastEl = doc.querySelector('#toast')
  }
  bind({ onBuildPalace, onBuildCastle, onBuildLibrary, onBuildFarm, onBuildSchool, onBuildWall, onBuildRoad, onBuildBridge, onBuildRiver, onSpawn, onSpeed, onBehaviorProbChange }) {
    this.menu.onBuildPalace(onBuildPalace)
    this.menu.onBuildCastle(onBuildCastle)
    this.menu.onBuildLibrary(onBuildLibrary)
    this.menu.onBuildFarm(onBuildFarm)
    this.menu.onBuildSchool(onBuildSchool)
    this.menu.onBuildWall(onBuildWall)
    this.menu.onBuildRoad(onBuildRoad)
    this.menu.onBuildBridge(onBuildBridge)
    this.menu.onBuildRiver(onBuildRiver)
    this.menu.onSpawn(onSpawn)
    this.menu.onSpeed(onSpeed)
    if (onBehaviorProbChange) this.menu.onBehaviorProbChange(onBehaviorProbChange)
  }
  update(state) {
    this.hud.update(state.resources, state.speed)
  }
  toast(msg) {
    if (!this.toastEl) return
    this.toastEl.textContent = msg
    this.toastEl.style.display = 'block'
    clearTimeout(this._toastTimer)
    this._toastTimer = setTimeout(() => {
      this.toastEl.style.display = 'none'
    }, 1800)
  }
}
