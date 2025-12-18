import { HUD } from './HUD.js'
import { Menu } from './Menu.js'
export class UI {
  constructor(doc) {
    this.hud = new HUD(doc.querySelector('#hud'))
    this.menu = new Menu(doc.querySelector('#menu'))
    this.toastEl = doc.querySelector('#toast')
  }
  bind({ onBuildCastle, onBuildLibrary, onBuildFarm, onBuildSchool, onBuildWall, onBuildRoad, onBuildRiver, onPlantCarrot, onPlantWatermelon, onPlantGrape, onSpawnSheep, onSpawnPig, onSpawnCow, onSpawn, onClaimResources, onDemolish, onSpeed, onBehaviorProbChange }) {
    this.menu.onBuildCastle(onBuildCastle)
    this.menu.onBuildLibrary(onBuildLibrary)
    this.menu.onBuildFarm(onBuildFarm)
    this.menu.onBuildSchool(onBuildSchool)
    this.menu.onBuildWall(onBuildWall)
    this.menu.onBuildRoad(onBuildRoad)
    this.menu.onBuildRiver(onBuildRiver)
    if (onPlantCarrot) this.menu.onPlantCarrot(onPlantCarrot)
    if (onPlantWatermelon) this.menu.onPlantWatermelon(onPlantWatermelon)
    if (onPlantGrape) this.menu.onPlantGrape(onPlantGrape)
    if (onSpawnSheep) this.menu.onSpawnSheep(onSpawnSheep)
    if (onSpawnPig) this.menu.onSpawnPig(onSpawnPig)
    if (onSpawnCow) this.menu.onSpawnCow(onSpawnCow)
    this.menu.onSpawn(onSpawn)
    if (onClaimResources) this.menu.onClaimResources(onClaimResources)
    if (onDemolish) this.menu.onDemolish(onDemolish)
    this.menu.onSpeed(onSpeed)
    if (onBehaviorProbChange) this.menu.onBehaviorProbChange(onBehaviorProbChange)
  }
  update(state) {
    const expRequired = state.getExpRequired ? state.getExpRequired() : 10
    this.hud.update(state.resources, state.speed, state.playerLevel || 1, state.playerExp || 0, expRequired, state.playerName || '未命名')
  }
  // 更新建筑按钮的解锁状态
  updateBuildingButtons(unlockedBuildings, playerLevel = 1, getRequiredLevel = null) {
    const buttonMap = {
      'farm': this.menu.btnFarm,
      'school': this.menu.btnSchool,
      'library': this.menu.btnLibrary,
      'castle': this.menu.btnCastle,
      'wall': this.menu.btnWall,
      'road': this.menu.btnRoad,
      'river': this.menu.btnRiver
    }
    
    const buildingNames = {
      'farm': '农田',
      'school': '学校',
      'library': '图书馆',
      'castle': '城堡',
      'wall': '城墙',
      'road': '道路',
      'river': '河流'
    }
    
    for (const [buildingType, button] of Object.entries(buttonMap)) {
      if (button) {
        const isUnlocked = unlockedBuildings.includes(buildingType)
        // 不再设置disabled，让按钮看起来正常
        button.disabled = false
        button.style.opacity = '1'
        button.style.cursor = 'pointer'
        // 添加提示语（无论是否解锁都显示）
        if (getRequiredLevel) {
          const requiredLevel = getRequiredLevel(buildingType)
          const buildingName = buildingNames[buildingType] || buildingType
          if (!isUnlocked) {
            button.title = `${buildingName}需要等级 ${requiredLevel} 才能解锁（当前等级：${playerLevel}）`
          } else {
            button.title = '' // 解锁后清除提示
          }
        } else {
          if (!isUnlocked) {
            const buildingName = buildingNames[buildingType] || buildingType
            button.title = `${buildingName}需要更高的等级才能解锁`
          } else {
            button.title = ''
          }
        }
      }
    }
  }
  
  // 更新农作物按钮的解锁状态
  updateCropButtons(unlockedCrops, playerLevel = 1, getCropRequiredLevel = null) {
    const buttonMap = {
      'carrot': this.menu.btnPlantCarrot,
      'watermelon': this.menu.btnPlantWatermelon,
      'grape': this.menu.btnPlantGrape
    }
    
    const cropNames = {
      'carrot': '胡萝卜',
      'watermelon': '西瓜',
      'grape': '葡萄'
    }
    
    for (const [cropType, button] of Object.entries(buttonMap)) {
      if (button) {
        const isUnlocked = unlockedCrops.includes(cropType)
        // 不再设置disabled，让按钮看起来正常
        button.disabled = false
        button.style.opacity = '1'
        button.style.cursor = 'pointer'
        if (getCropRequiredLevel) {
          const requiredLevel = getCropRequiredLevel(cropType)
          const cropName = cropNames[cropType] || cropType
          if (!isUnlocked) {
            button.title = `${cropName}需要等级 ${requiredLevel} 才能解锁（当前等级：${playerLevel}）`
          } else {
            button.title = ''
          }
        } else {
          if (!isUnlocked) {
            const cropName = cropNames[cropType] || cropType
            button.title = `${cropName}需要更高的等级才能解锁`
          } else {
            button.title = ''
          }
        }
      }
    }
  }
  
  // 更新动物按钮的解锁状态
  updateAnimalButtons(unlockedAnimals, playerLevel = 1, getAnimalRequiredLevel = null) {
    const buttonMap = {
      'sheep': this.menu.btnSpawnSheep,
      'pig': this.menu.btnSpawnPig,
      'cow': this.menu.btnSpawnCow
    }
    
    const animalNames = {
      'sheep': '小羊',
      'pig': '小猪',
      'cow': '小牛'
    }
    
    for (const [animalType, button] of Object.entries(buttonMap)) {
      if (button) {
        const isUnlocked = unlockedAnimals.includes(animalType)
        // 不再设置disabled，让按钮看起来正常
        button.disabled = false
        button.style.opacity = '1'
        button.style.cursor = 'pointer'
        if (getAnimalRequiredLevel) {
          const requiredLevel = getAnimalRequiredLevel(animalType)
          const animalName = animalNames[animalType] || animalType
          if (!isUnlocked) {
            button.title = `${animalName}需要等级 ${requiredLevel} 才能解锁（当前等级：${playerLevel}）`
          } else {
            button.title = ''
          }
        } else {
          if (!isUnlocked) {
            const animalName = animalNames[animalType] || animalType
            button.title = `${animalName}需要更高的等级才能解锁`
          } else {
            button.title = ''
          }
        }
      }
    }
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
