export class Menu {
  constructor(root) {
    this.root = root
    this.btnTheme = root.querySelector('#theme-toggle')
    this.btnCastle = root.querySelector('#build-castle')
    this.btnLibrary = root.querySelector('#build-library')
    this.btnWall = root.querySelector('#build-wall')
    this.btnFarm = root.querySelector('#build-farm')
    this.btnSchool = root.querySelector('#build-school')
    this.btnRoad = root.querySelector('#build-road')
    this.btnRiver = root.querySelector('#build-river')
    this.btnSpawn = root.querySelector('#spawn-worker')
    this.btnClaimResources = root.querySelector('#claim-resources')
    this.btnDemolish = root.querySelector('#demolish-building')
    this.speed1 = root.querySelector('#speed-1')
    this.speed2 = root.querySelector('#speed-2')
    this.speed4 = root.querySelector('#speed-4')
    
    // 农作物按钮
    this.btnPlantCarrot = root.querySelector('#plant-carrot')
    this.btnPlantWatermelon = root.querySelector('#plant-watermelon')
    this.btnPlantGrape = root.querySelector('#plant-grape')
    
    // 动物按钮
    this.btnSpawnSheep = root.querySelector('#spawn-sheep')
    this.btnSpawnPig = root.querySelector('#spawn-pig')
    this.btnSpawnCow = root.querySelector('#spawn-cow')
    
    // 翻页功能
    this.pageTabs = root.querySelectorAll('.page-tab')
    this.pageContents = root.querySelectorAll('.page-content')
    this.currentPage = 'buildings'
    
    this.pageTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const page = tab.dataset.page
        this.switchPage(page)
      })
    })

    // 主题切换（白天 / 夜间）
    if (this.btnTheme) {
      const doc = this.root.ownerDocument
      const win = doc.defaultView
      const stored = win && win.localStorage ? win.localStorage.getItem('theme') : null
      let isDark = stored === 'dark'
      const applyTheme = () => {
        doc.body.classList.toggle('theme-dark', isDark)
        if (this.btnTheme) {
          this.btnTheme.textContent = isDark ? '切换为白天模式' : '切换为夜间模式'
        }
        if (win && win.localStorage) {
          win.localStorage.setItem('theme', isDark ? 'dark' : 'light')
        }
      }
      this.btnTheme.addEventListener('click', () => {
        isDark = !isDark
        applyTheme()
      })
      applyTheme()
    }
  }
  
  switchPage(page) {
    this.currentPage = page
    this.pageTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.page === page)
    })
    this.pageContents.forEach(content => {
      content.classList.toggle('active', content.dataset.page === page)
    })
  }
  onBuildCastle(handler) { if (this.btnCastle) this.btnCastle.addEventListener('click', handler) }
  onBuildLibrary(handler) { if (this.btnLibrary) this.btnLibrary.addEventListener('click', handler) }
  onBuildWall(handler) { if (this.btnWall) this.btnWall.addEventListener('click', handler) }
  onBuildFarm(handler) { if (this.btnFarm) this.btnFarm.addEventListener('click', handler) }
  onBuildSchool(handler) { if (this.btnSchool) this.btnSchool.addEventListener('click', handler) }
  onBuildRoad(handler) { if (this.btnRoad) this.btnRoad.addEventListener('click', handler) }
  onBuildRiver(handler) { if (this.btnRiver) this.btnRiver.addEventListener('click', handler) }
  onPlantCarrot(handler) { if (this.btnPlantCarrot) this.btnPlantCarrot.addEventListener('click', handler) }
  onPlantWatermelon(handler) { if (this.btnPlantWatermelon) this.btnPlantWatermelon.addEventListener('click', handler) }
  onPlantGrape(handler) { if (this.btnPlantGrape) this.btnPlantGrape.addEventListener('click', handler) }
  onSpawnSheep(handler) { if (this.btnSpawnSheep) this.btnSpawnSheep.addEventListener('click', handler) }
  onSpawnPig(handler) { if (this.btnSpawnPig) this.btnSpawnPig.addEventListener('click', handler) }
  onSpawnCow(handler) { if (this.btnSpawnCow) this.btnSpawnCow.addEventListener('click', handler) }
  onSpawn(handler) { if (this.btnSpawn) this.btnSpawn.addEventListener('click', handler) }
  onClaimResources(handler) { if (this.btnClaimResources) this.btnClaimResources.addEventListener('click', handler) }
  onDemolish(handler) { if (this.btnDemolish) this.btnDemolish.addEventListener('click', handler) }
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
