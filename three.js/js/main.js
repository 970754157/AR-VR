import { GameInitializer } from './GameInitializer.js'
import { Tutorial } from './Tutorial.js'
import { PlayerController } from './PlayerController.js'
import { InputHandler } from './InputHandler.js'
import { getLanguage, initI18n, setLanguage, t } from './i18n.js'

const container = document.getElementById('canvas-container')
const mainMenu = document.getElementById('main-menu')
const startBtn = document.getElementById('start-game')
const settingsBtn = document.getElementById('open-settings')
const settingsModal = document.getElementById('settings-modal')
const closeSettingsBtn = document.getElementById('close-settings')
const langToggleBtn = document.getElementById('lang-toggle')
const logoutBtn = document.getElementById('logout')
const sidebarResizer = document.getElementById('sidebar-resizer')

let initializer = null
let game = null
let ui = null
let tutorial = null
let playerController = null
let inputHandler = null
let rafId = null
let running = false
let last = 0

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

function setSidebarWidth(px) {
  const width = clamp(px, 200, 520)
  const current = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width')) || 240
  if (Math.abs(current - width) < 0.5) return
  document.documentElement.style.setProperty('--sidebar-width', `${width}px`)
  try {
    localStorage.setItem('sidebarWidth', String(width))
  } catch {}
}

function initSidebarResize() {
  let stored = null
  try {
    stored = localStorage.getItem('sidebarWidth')
  } catch {}
  const parsed = stored ? Number(stored) : NaN
  if (Number.isFinite(parsed)) setSidebarWidth(parsed)
  
  if (!sidebarResizer) return
  
  sidebarResizer.addEventListener('pointerdown', (e) => {
    e.preventDefault()
    document.body.classList.add('resizing-sidebar')
    const startX = e.clientX
    const startWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width')) || 240
    let pendingWidth = startWidth
    let scheduled = false
    
    const onMove = (ev) => {
      const dx = ev.clientX - startX
      pendingWidth = startWidth + dx
      if (scheduled) return
      scheduled = true
      requestAnimationFrame(() => {
        scheduled = false
        setSidebarWidth(pendingWidth)
      })
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      document.body.classList.remove('resizing-sidebar')
    }
    
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  })
}

function buildingName(type) {
  return t(`building.${type}`)
}
function cropName(type) {
  return t(`crop.${type}`)
}
function animalName(type) {
  return t(`animal.${type}`)
}

function showSettings(show) {
  if (!settingsModal) return
  settingsModal.classList.toggle('hidden', !show)
  settingsModal.setAttribute('aria-hidden', show ? 'false' : 'true')
}

function updateLangToggleText() {
  if (!langToggleBtn) return
  const next = getLanguage() === 'zh' ? 'en' : 'zh'
  langToggleBtn.textContent = next === 'en' ? t('main.langToEn') : t('main.langToZh')
}

function onLanguageChange() {
  updateLangToggleText()
  if (tutorial && typeof tutorial.refresh === 'function') tutorial.refresh()
  if (ui && ui.update) ui.update(game?.state)
}

function stopLoop() {
  running = false
  if (rafId != null) cancelAnimationFrame(rafId)
  rafId = null
}

function loop() {
  if (!running || !initializer || !game || !ui) return
  const now = performance.now()
  const dt = Math.min(0.05, (now - last) / 1000)
  last = now
  
  initializer.syncLightingWithBodyTheme()
  
  if (tutorial?.isCompleted()) {
    playerController?.update(dt, true)
  }
  
  game.update(dt)
  ui.update(game.state)
  
  if (!ui._buttonsInitialized) {
    ui.updateBuildingButtons(game.state.getUnlockedBuildings(), game.state.playerLevel, (type) => game.state.getBuildingRequiredLevel(type))
    ui.updateCropButtons(game.state.getUnlockedCrops(), game.state.playerLevel, (type) => game.state.getCropRequiredLevel(type))
    ui.updateAnimalButtons(game.state.getUnlockedAnimals(), game.state.playerLevel, (type) => game.state.getAnimalRequiredLevel(type))
    ui._buttonsInitialized = true
  }
  
  initializer.getCameraSys().update(dt)
  initializer.getCameraSys().resize(container)
  initializer.getRenderer().getRenderer().render(initializer.getScene(), initializer.getCameraSys().getCamera())
  if (Math.random() < 0.02) game.assignWork()
  rafId = requestAnimationFrame(loop)
}

async function startGame() {
  if (running) return
  
  document.body.classList.add('game-started')
  if (mainMenu) mainMenu.classList.add('hidden')
  showSettings(false)
  
  initializer = new GameInitializer(container)
  const result = await initializer.initializeGame()
  game = result.game
  ui = result.ui
  initializer.setUI(ui)
  game.cats.setUI(ui)

  tutorial = new Tutorial(game, ui)
  
  game.onLevelUp = () => {
    ui.updateBuildingButtons(game.state.getUnlockedBuildings(), game.state.playerLevel, (type) => game.state.getBuildingRequiredLevel(type))
    ui.updateCropButtons(game.state.getUnlockedCrops(), game.state.playerLevel, (type) => game.state.getCropRequiredLevel(type))
    ui.updateAnimalButtons(game.state.getUnlockedAnimals(), game.state.playerLevel, (type) => game.state.getAnimalRequiredLevel(type))
    ui.toast(t('msg.levelUp', { level: game.state.playerLevel }))
  }
  
  ui.bind({
    onBuildCastle: () => {
      if (!game.state.isBuildingUnlocked('castle')) {
        ui.toast(t('msg.needLevel', { name: buildingName('castle'), required: game.state.getBuildingRequiredLevel('castle'), current: game.state.playerLevel }))
        return
      }
      game.state.pendingBuild = true
      game.state.pendingType = 'castle'
      ui.toast(t('msg.placeFoundation', { name: buildingName('castle') }))
    },
    onBuildLibrary: () => {
      if (!game.state.isBuildingUnlocked('library')) {
        ui.toast(t('msg.needLevel', { name: buildingName('library'), required: game.state.getBuildingRequiredLevel('library'), current: game.state.playerLevel }))
        return
      }
      game.state.pendingBuild = true
      game.state.pendingType = 'library'
      ui.toast(t('msg.placeFoundation', { name: buildingName('library') }))
    },
    onBuildFarm: () => {
      if (!game.state.isBuildingUnlocked('farm')) {
        ui.toast(t('msg.needLevel', { name: buildingName('farm'), required: game.state.getBuildingRequiredLevel('farm'), current: game.state.playerLevel }))
        return
      }
      game.state.pendingBuild = true
      game.state.pendingType = 'farm'
      ui.toast(t('msg.placeFoundation', { name: buildingName('farm') }))
    },
    onBuildSchool: () => {
      if (!game.state.isBuildingUnlocked('school')) {
        ui.toast(t('msg.needLevel', { name: buildingName('school'), required: game.state.getBuildingRequiredLevel('school'), current: game.state.playerLevel }))
        return
      }
      game.state.pendingBuild = true
      game.state.pendingType = 'school'
      ui.toast(t('msg.placeFoundation', { name: buildingName('school') }))
    },
    onBuildWall: () => {
      if (!game.state.isBuildingUnlocked('wall')) {
        ui.toast(t('msg.needLevel', { name: buildingName('wall'), required: game.state.getBuildingRequiredLevel('wall'), current: game.state.playerLevel }))
        return
      }
      game.state.pendingBuild = true
      game.state.pendingType = 'wall'
      ui.toast(t('msg.placeFoundation', { name: buildingName('wall') }))
    },
    onBuildRoad: () => {
      if (!game.state.isBuildingUnlocked('road')) {
        ui.toast(t('msg.needLevel', { name: buildingName('road'), required: game.state.getBuildingRequiredLevel('road'), current: game.state.playerLevel }))
        return
      }
      game.state.pendingBuild = true
      game.state.pendingType = 'road'
      ui.toast(t('msg.placeFoundation', { name: buildingName('road') }))
    },
    onBuildRiver: () => {
      if (!game.state.isBuildingUnlocked('river')) {
        ui.toast(t('msg.needLevel', { name: buildingName('river'), required: game.state.getBuildingRequiredLevel('river'), current: game.state.playerLevel }))
        return
      }
      game.state.pendingBuild = true
      game.state.pendingType = 'river'
      ui.toast(t('msg.placeFoundation', { name: buildingName('river') }))
    },
    onPlantCarrot: () => {
      if (!game.state.isCropUnlocked('carrot')) {
        ui.toast(t('msg.needLevel', { name: cropName('carrot'), required: game.state.getCropRequiredLevel('carrot'), current: game.state.playerLevel }))
        return
      }
      game.state.pendingPlant = true
      game.state.pendingCropType = 'carrot'
      ui.toast(t('msg.placeCrop', { name: cropName('carrot') }))
    },
    onPlantWatermelon: () => {
      if (!game.state.isCropUnlocked('watermelon')) {
        ui.toast(t('msg.needLevel', { name: cropName('watermelon'), required: game.state.getCropRequiredLevel('watermelon'), current: game.state.playerLevel }))
        return
      }
      game.state.pendingPlant = true
      game.state.pendingCropType = 'watermelon'
      ui.toast(t('msg.placeCrop', { name: cropName('watermelon') }))
    },
    onPlantGrape: () => {
      if (!game.state.isCropUnlocked('grape')) {
        ui.toast(t('msg.needLevel', { name: cropName('grape'), required: game.state.getCropRequiredLevel('grape'), current: game.state.playerLevel }))
        return
      }
      game.state.pendingPlant = true
      game.state.pendingCropType = 'grape'
      ui.toast(t('msg.placeCrop', { name: cropName('grape') }))
    },
    onSpawnSheep: () => {
      if (!game.state.isAnimalUnlocked('sheep')) {
        ui.toast(t('msg.needLevel', { name: animalName('sheep'), required: game.state.getAnimalRequiredLevel('sheep'), current: game.state.playerLevel }))
        return
      }
      if (game.state.pendingSpawnAnimal && game.state.pendingAnimalType === 'sheep') {
        game.state.pendingSpawnAnimal = false
        ui.toast(t('msg.cancel'))
      } else {
        game.state.pendingSpawnAnimal = true
        game.state.pendingAnimalType = 'sheep'
        ui.toast(t('msg.placeAnimal', { name: animalName('sheep') }))
      }
    },
    onSpawnPig: () => {
      if (!game.state.isAnimalUnlocked('pig')) {
        ui.toast(t('msg.needLevel', { name: animalName('pig'), required: game.state.getAnimalRequiredLevel('pig'), current: game.state.playerLevel }))
        return
      }
      if (game.state.pendingSpawnAnimal && game.state.pendingAnimalType === 'pig') {
        game.state.pendingSpawnAnimal = false
        ui.toast(t('msg.cancel'))
      } else {
        game.state.pendingSpawnAnimal = true
        game.state.pendingAnimalType = 'pig'
        ui.toast(t('msg.placeAnimal', { name: animalName('pig') }))
      }
    },
    onSpawnCow: () => {
      if (!game.state.isAnimalUnlocked('cow')) {
        ui.toast(t('msg.needLevel', { name: animalName('cow'), required: game.state.getAnimalRequiredLevel('cow'), current: game.state.playerLevel }))
        return
      }
      if (game.state.pendingSpawnAnimal && game.state.pendingAnimalType === 'cow') {
        game.state.pendingSpawnAnimal = false
        ui.toast(t('msg.cancel'))
      } else {
        game.state.pendingSpawnAnimal = true
        game.state.pendingAnimalType = 'cow'
        ui.toast(t('msg.placeAnimal', { name: animalName('cow') }))
      }
    },
    onSpawn: () => game.spawnWorker(),
    onClaimResources: () => {
      game.state.resources.add({ stone: 1000, wood: 1000, food: 1000, gold: 1000 })
      ui.toast(t('msg.claimed'))
    },
    onDemolish: () => {
      if (game.state.pendingDemolish) {
        game.state.pendingDemolish = false
        ui.toast(t('msg.cancel'))
      } else {
        game.state.pendingDemolish = true
        game.state.pendingBuild = false
        ui.toast(t('msg.demolishMode'))
      }
    },
    onSpeed: (s) => game.state.setSpeed(s),
    onBehaviorProbChange: (weights) => {
      game.state.setIdleWeights(weights)
      game.updateWorkersIdleWeights()
    }
  })
  
  playerController = new PlayerController(game, initializer.getCameraSys(), initializer.getScene())
  inputHandler = new InputHandler(game, ui, playerController, container, initializer.getCameraSys())
  
  last = performance.now()
  running = true
  loop()
}

function logout() {
  if (!running) return
  const ok = window.confirm(t('main.logoutConfirm'))
  if (!ok) return
  stopLoop()
  window.location.reload()
}

initI18n(document)
updateLangToggleText()
window.addEventListener('i18n:change', onLanguageChange)
initSidebarResize()

document.body.classList.remove('game-started')

startBtn?.addEventListener('click', () => startGame())
settingsBtn?.addEventListener('click', () => showSettings(true))
closeSettingsBtn?.addEventListener('click', () => showSettings(false))
settingsModal?.addEventListener('click', (e) => {
  if (e.target === settingsModal) showSettings(false)
})
langToggleBtn?.addEventListener('click', () => {
  setLanguage(getLanguage() === 'zh' ? 'en' : 'zh', document)
})
logoutBtn?.addEventListener('click', () => logout())
