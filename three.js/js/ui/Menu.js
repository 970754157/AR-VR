export class Menu {
  constructor(root) {
    this.root = root
    this.btnPalace = root.querySelector('#build-palace')
    this.btnCastle = root.querySelector('#build-castle')
    this.btnLibrary = root.querySelector('#build-library')
    this.btnWall = root.querySelector('#build-wall')
    this.btnFarm = root.querySelector('#build-farm')
    this.btnSchool = root.querySelector('#build-school')
    this.btnRoad = root.querySelector('#build-road')
    this.btnBridge = root.querySelector('#build-bridge')
    this.btnRiver = root.querySelector('#build-river')
    this.btnSpawn = root.querySelector('#spawn-worker')
    this.speed1 = root.querySelector('#speed-1')
    this.speed2 = root.querySelector('#speed-2')
    this.speed4 = root.querySelector('#speed-4')
  }
  onBuildPalace(handler) { this.btnPalace.addEventListener('click', handler) }
  onBuildCastle(handler) { this.btnCastle.addEventListener('click', handler) }
  onBuildLibrary(handler) { this.btnLibrary.addEventListener('click', handler) }
  onBuildWall(handler) { this.btnWall.addEventListener('click', handler) }
  onBuildFarm(handler) { this.btnFarm.addEventListener('click', handler) }
  onBuildSchool(handler) { this.btnSchool.addEventListener('click', handler) }
  onBuildRoad(handler) { this.btnRoad.addEventListener('click', handler) }
  onBuildBridge(handler) { this.btnBridge.addEventListener('click', handler) }
  onBuildRiver(handler) { this.btnRiver.addEventListener('click', handler) }
  onSpawn(handler) { this.btnSpawn.addEventListener('click', handler) }
  onSpeed(handler) {
    this.speed1.addEventListener('click', () => handler(1))
    this.speed2.addEventListener('click', () => handler(2))
    this.speed4.addEventListener('click', () => handler(4))
  }
  onBehaviorProbChange(handler) {
    const rest = this.root.querySelector('#prob-rest')
    const cheer = this.root.querySelector('#prob-cheer')
    const wander = this.root.querySelector('#prob-wander')
    const rv = this.root.querySelector('#prob-rest-val')
    const cv = this.root.querySelector('#prob-cheer-val')
    const wv = this.root.querySelector('#prob-wander-val')
    const apply = () => {
      rv.textContent = Math.round(rest.value) + '%'
      cv.textContent = Math.round(cheer.value) + '%'
      wv.textContent = Math.round(wander.value) + '%'
      handler({ rest: Number(rest.value) / 100, cheer: Number(cheer.value) / 100, wander: Number(wander.value) / 100 })
    }
    rest.addEventListener('input', apply)
    cheer.addEventListener('input', apply)
    wander.addEventListener('input', apply)
    apply()
  }
}
