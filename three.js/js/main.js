import { GameInitializer } from './GameInitializer.js'
import { Tutorial } from './Tutorial.js'
import { PlayerController } from './PlayerController.js'
import { InputHandler } from './InputHandler.js'

const container = document.getElementById('canvas-container')
const initializer = new GameInitializer(container)
const { game, ui } = await initializer.initializeGame()
initializer.setUI(ui)

const tutorial = new Tutorial(game, ui)

// 设置升级回调
game.onLevelUp = () => {
  ui.updateBuildingButtons(game.state.getUnlockedBuildings(), game.state.playerLevel, (type) => game.state.getBuildingRequiredLevel(type))
  ui.updateCropButtons(game.state.getUnlockedCrops(), game.state.playerLevel, (type) => game.state.getCropRequiredLevel(type))
  ui.updateAnimalButtons(game.state.getUnlockedAnimals(), game.state.playerLevel, (type) => game.state.getAnimalRequiredLevel(type))
}

// UI绑定
ui.bind({
  onBuildCastle: () => {
    if (!game.state.isBuildingUnlocked('castle')) {
      const requiredLevel = game.state.getBuildingRequiredLevel('castle')
      ui.toast(`城堡需要等级 ${requiredLevel} 才能解锁（当前等级：${game.state.playerLevel}）`)
      return
    }
    game.state.pendingBuild = true; game.state.pendingType = 'castle'; ui.toast('城堡地基：食物50 木材25，点击地面放置')
  },
  onBuildLibrary: () => {
    if (!game.state.isBuildingUnlocked('library')) {
      const requiredLevel = game.state.getBuildingRequiredLevel('library')
      ui.toast(`图书馆需要等级 ${requiredLevel} 才能解锁（当前等级：${game.state.playerLevel}）`)
      return
    }
    game.state.pendingBuild = true; game.state.pendingType = 'library'; ui.toast('图书馆地基：食物40 木材20，点击地面放置')
  },
  onBuildFarm: () => {
    if (!game.state.isBuildingUnlocked('farm')) {
      const requiredLevel = game.state.getBuildingRequiredLevel('farm')
      ui.toast(`农田需要等级 ${requiredLevel} 才能解锁（当前等级：${game.state.playerLevel}）`)
      return
    }
    game.state.pendingBuild = true; game.state.pendingType = 'farm'; ui.toast('农田地基：食物10 木材5，点击地面放置')
  },
  onBuildSchool: () => {
    if (!game.state.isBuildingUnlocked('school')) {
      const requiredLevel = game.state.getBuildingRequiredLevel('school')
      ui.toast(`学校需要等级 ${requiredLevel} 才能解锁（当前等级：${game.state.playerLevel}）`)
      return
    }
    game.state.pendingBuild = true; game.state.pendingType = 'school'; ui.toast('学校地基：食物35 木材25，点击地面放置')
  },
  onBuildWall: () => {
    if (!game.state.isBuildingUnlocked('wall')) {
      const requiredLevel = game.state.getBuildingRequiredLevel('wall')
      ui.toast(`城墙需要等级 ${requiredLevel} 才能解锁（当前等级：${game.state.playerLevel}）`)
      return
    }
    game.state.pendingBuild = true; game.state.pendingType = 'wall'; ui.toast('城墙地基：食物60 木材15，点击地面放置')
  },
  onBuildRoad: () => {
    if (!game.state.isBuildingUnlocked('road')) {
      const requiredLevel = game.state.getBuildingRequiredLevel('road')
      ui.toast(`道路需要等级 ${requiredLevel} 才能解锁（当前等级：${game.state.playerLevel}）`)
      return
    }
    game.state.pendingBuild = true; game.state.pendingType = 'road'; ui.toast('道路地基：食物20 木材5，点击地面放置')
  },
  onBuildRiver: () => {
    if (!game.state.isBuildingUnlocked('river')) {
      const requiredLevel = game.state.getBuildingRequiredLevel('river')
      ui.toast(`河流需要等级 ${requiredLevel} 才能解锁（当前等级：${game.state.playerLevel}）`)
      return
    }
    game.state.pendingBuild = true; game.state.pendingType = 'river'; ui.toast('河流地基：食物0 木材0，点击地面放置')
  },
  onPlantCarrot: () => {
    if (!game.state.isCropUnlocked('carrot')) {
      const requiredLevel = game.state.getCropRequiredLevel('carrot')
      ui.toast(`胡萝卜需要等级 ${requiredLevel} 才能解锁（当前等级：${game.state.playerLevel}）`)
      return
    }
    game.state.pendingPlant = true; game.state.pendingCropType = 'carrot'; ui.toast('选择农田种植胡萝卜')
  },
  onPlantWatermelon: () => {
    if (!game.state.isCropUnlocked('watermelon')) {
      const requiredLevel = game.state.getCropRequiredLevel('watermelon')
      ui.toast(`西瓜需要等级 ${requiredLevel} 才能解锁（当前等级：${game.state.playerLevel}）`)
      return
    }
    game.state.pendingPlant = true; game.state.pendingCropType = 'watermelon'; ui.toast('选择农田种植西瓜')
  },
  onPlantGrape: () => {
    if (!game.state.isCropUnlocked('grape')) {
      const requiredLevel = game.state.getCropRequiredLevel('grape')
      ui.toast(`葡萄需要等级 ${requiredLevel} 才能解锁（当前等级：${game.state.playerLevel}）`)
      return
    }
    game.state.pendingPlant = true; game.state.pendingCropType = 'grape'; ui.toast('选择农田种植葡萄')
  },
  onSpawnSheep: () => {
    if (!game.state.isAnimalUnlocked('sheep')) {
      const requiredLevel = game.state.getAnimalRequiredLevel('sheep')
      ui.toast(`小羊需要等级 ${requiredLevel} 才能解锁（当前等级：${game.state.playerLevel}）`)
      return
    }
    // 如果已经是放置小羊模式，则取消；否则进入连续放置模式
    if (game.state.pendingSpawnAnimal && game.state.pendingAnimalType === 'sheep') {
      game.state.pendingSpawnAnimal = false
      ui.toast('已取消放置小羊模式')
    } else {
      game.state.pendingSpawnAnimal = true
      game.state.pendingAnimalType = 'sheep'
      ui.toast('连续放置模式：点击地面放置小羊，再次点击按钮取消')
    }
  },
  onSpawnPig: () => {
    if (!game.state.isAnimalUnlocked('pig')) {
      const requiredLevel = game.state.getAnimalRequiredLevel('pig')
      ui.toast(`小猪需要等级 ${requiredLevel} 才能解锁（当前等级：${game.state.playerLevel}）`)
      return
    }
    // 如果已经是放置小猪模式，则取消；否则进入连续放置模式
    if (game.state.pendingSpawnAnimal && game.state.pendingAnimalType === 'pig') {
      game.state.pendingSpawnAnimal = false
      ui.toast('已取消放置小猪模式')
    } else {
      game.state.pendingSpawnAnimal = true
      game.state.pendingAnimalType = 'pig'
      ui.toast('连续放置模式：点击地面放置小猪，再次点击按钮取消')
    }
  },
  onSpawnCow: () => {
    if (!game.state.isAnimalUnlocked('cow')) {
      const requiredLevel = game.state.getAnimalRequiredLevel('cow')
      ui.toast(`小牛需要等级 ${requiredLevel} 才能解锁（当前等级：${game.state.playerLevel}）`)
      return
    }
    // 如果已经是放置小牛模式，则取消；否则进入连续放置模式
    if (game.state.pendingSpawnAnimal && game.state.pendingAnimalType === 'cow') {
      game.state.pendingSpawnAnimal = false
      ui.toast('已取消放置小牛模式')
    } else {
      game.state.pendingSpawnAnimal = true
      game.state.pendingAnimalType = 'cow'
      ui.toast('连续放置模式：点击地面放置小牛，再次点击按钮取消')
    }
  },
  onSpawn: () => game.spawnWorker(),
  onClaimResources: () => {
    game.state.resources.add({ stone: 1000, wood: 1000, food: 1000, gold: 1000 })
    ui.toast('领取成功：获得石材、木材、食物、金钱各1000')
  },
  onDemolish: () => {
    if (game.state.pendingDemolish) {
      game.state.pendingDemolish = false
      ui.toast('已取消删除模式')
    } else {
      game.state.pendingDemolish = true
      game.state.pendingBuild = false
      ui.toast('删除模式：点击要删除的建筑')
    }
  },
  onSpeed: (s) => game.state.setSpeed(s),
  onBehaviorProbChange: (weights) => { 
    game.state.setIdleWeights(weights)
    game.updateWorkersIdleWeights()
  }
})

const playerController = new PlayerController(game, initializer.getCameraSys(), initializer.getScene())
const inputHandler = new InputHandler(game, ui, playerController, container, initializer.getCameraSys())

let last = performance.now()
function loop() {
  const now = performance.now()
  const dt = Math.min(0.05, (now - last) / 1000)
  last = now
  
  initializer.syncLightingWithBodyTheme()
  
  if (tutorial.isCompleted()) {
    playerController.update(dt, true)
  }
  
  game.update(dt)
  ui.update(game.state)
  
  if (!ui._buttonsInitialized) {
    ui.updateBuildingButtons(game.state.getUnlockedBuildings(), game.state.playerLevel, (type) => game.state.getBuildingRequiredLevel(type))
    ui._buttonsInitialized = true
  }
  
  initializer.getCameraSys().update(dt)
  initializer.getCameraSys().resize(container)
  initializer.getRenderer().getRenderer().render(initializer.getScene(), initializer.getCameraSys().getCamera())
  if (Math.random() < 0.02) game.assignWork()
  requestAnimationFrame(loop)
}
loop()

