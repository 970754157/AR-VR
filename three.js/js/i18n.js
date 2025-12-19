const STORAGE_KEY = 'lang'

const dictionaries = {
  zh: {
    'main.title': '缓慢的城镇',
    'main.start': '开始游戏',
    'main.settings': '设置',
    'main.close': '关闭',
    'main.language': '语言',
    'main.langToEn': '切换到英文',
    'main.langToZh': '切换到中文',
    'main.logout': '登出',
    'main.logoutConfirm': '确定要登出并返回主页面吗？',
    
    'hud.player': '玩家',
    'hud.unnamed': '未命名',
    'hud.stone': '石材',
    'hud.wood': '木材',
    'hud.food': '食物',
    'hud.gold': '金钱',
    'hud.workers': '工匠',
    'hud.speed': '速度',
    'hud.level': '等级',
    'hud.exp': '经验',

    'resource.stone': '石材',
    'resource.wood': '木材',
    'resource.food': '食物',
    'resource.gold': '金钱',
    'resource.exp': '经验',
    
    'menu.tab.buildings': '建筑',
    'menu.tab.crops': '农作物',
    'menu.tab.animals': '动物',
    
    'menu.build.farm': '建造农田地基',
    'menu.build.school': '建造学校地基',
    'menu.build.library': '建造图书馆地基',
    'menu.build.wall': '建造城墙地基',
    'menu.build.road': '建造道路地基',
    'menu.build.river': '建造河流地基',
    'menu.build.castle': '建造城堡地基',
    
    'menu.plant.carrot': '种植胡萝卜',
    'menu.plant.watermelon': '种植西瓜',
    'menu.plant.grape': '种植葡萄',
    
    'menu.spawn.sheep': '放置小羊',
    'menu.spawn.pig': '放置小猪',
    'menu.spawn.cow': '放置小牛',
    
    'menu.idle.title': '空闲行为概率',
    'menu.idle.rest': '休息',
    'menu.idle.cheer': '欢呼',
    'menu.idle.wander': '闲逛',
    
    'menu.spawnWorker': '招募工匠',
    'menu.claim': '领取材料',
    'menu.demolish': '删除建筑',
    'menu.speed.1': '速度 1x',
    'menu.speed.2': '速度 2x',
    'menu.speed.4': '速度 4x',
    'menu.theme.toDark': '切换为夜间模式',
    'menu.theme.toLight': '切换为白天模式',
    
    'building.farm': '农田',
    'building.school': '学校',
    'building.library': '图书馆',
    'building.castle': '城堡',
    'building.wall': '城墙',
    'building.road': '道路',
    'building.river': '河流',
    
    'crop.carrot': '胡萝卜',
    'crop.watermelon': '西瓜',
    'crop.grape': '葡萄',
    
    'animal.sheep': '小羊',
    'animal.pig': '小猪',
    'animal.cow': '小牛',
    
    'poi.goldMine': '金矿',
    'poi.rock': '石山',
    'poi.tree': '树木',
    
    'msg.needLevel': '{name}需要等级 {required} 才能解锁（当前等级：{current}）',
    'msg.needHigherLevel': '{name}需要更高的等级才能解锁',
    'msg.placeFoundation': '放置模式：点击地面放置{name}地基',
    'msg.placeAnimal': '连续放置模式：点击地面放置{name}（再次点击按钮取消）',
    'msg.placeCrop': '选择农田种植{name}',
    'msg.cancel': '已取消',
    'msg.noIdleWorkers': '没有空闲工匠',
    'msg.demolishAssigned': '已分配工匠拆除建筑',
    'msg.demolishHint': '请点击要删除的建筑',
    'msg.demolishMode': '拆除模式：点击要删除的建筑',
    'msg.foundationPlaced': '已安置地基',
    'msg.resourceNotEnough': '资源不足',
    'msg.claimed': '领取成功：获得石材、木材、食物、金钱各 1000',
    'msg.goingTo': '正在前往{name}...',
    'msg.catFollow': '小猫开始跟随你了！',
    'msg.catStoleResource': '小猫偷走了你的 {amount}！',
    'msg.catEscaped': '小猫逃跑了！',
    'msg.catReward': '获得 {amount} {resource}！',
    'msg.animalRan': '{name}被吓跑了！',
    'msg.harvested': '收获{name}，获得 {amount} 食物',
    'msg.notMature': '{name}还未成熟',
    'msg.planted': '已种植{name}',
    'msg.plantFailed': '该农田已有农作物或未解锁',
    'msg.animalCostNotEnough': '资源不足：需要 10 金币和 10 食物',
    'msg.animalPlaced': '已放置{name}',
    'msg.levelUp': '玩家升级到 {level} 级！解锁新内容！',
    'msg.demolishedRefund': '建筑已拆除，返还材料：食物{food} 木材{wood}',
    'msg.demolished': '建筑已拆除',
    'msg.workerDied': '工匠因过度劳累而死亡',
    'msg.foundationComplete': '地基建造完成',
    'msg.buildingShown': '{name}已建成',
    
    'tutorial.hint': '点击任意位置继续...',
    'tutorial.namePlaceholder': '请输入你的名字',
    'tutorial.confirm': '确认',
    'tutorial.nameEmpty': '名字不能为空',
    'tutorial.0': '欢迎来到《缓慢的城镇》<br>首先先起个名字吧',
    'tutorial.1': '按住 WASD 进行移动',
    'tutorial.2': '使用上下左右键平移相机（滚轮缩放）',
    'tutorial.3': '首先招募工匠，帮助你建造一片农田吧',
    'tutorial.4': '种植、建造、采集物品都可以获得经验',
    'tutorial.5': '获得更多经验升级，解锁更多内容来探索这个世界吧'
  },
  en: {
    'main.title': 'Slow Town',
    'main.start': 'Start Game',
    'main.settings': 'Settings',
    'main.close': 'Close',
    'main.language': 'Language',
    'main.langToEn': 'Switch to English',
    'main.langToZh': 'Switch to Chinese',
    'main.logout': 'Logout',
    'main.logoutConfirm': 'Log out and return to the main menu?',
    
    'hud.player': 'Player',
    'hud.unnamed': 'Unnamed',
    'hud.stone': 'Stone',
    'hud.wood': 'Wood',
    'hud.food': 'Food',
    'hud.gold': 'Gold',
    'hud.workers': 'Workers',
    'hud.speed': 'Speed',
    'hud.level': 'Level',
    'hud.exp': 'XP',

    'resource.stone': 'Stone',
    'resource.wood': 'Wood',
    'resource.food': 'Food',
    'resource.gold': 'Gold',
    'resource.exp': 'XP',
    
    'menu.tab.buildings': 'Buildings',
    'menu.tab.crops': 'Crops',
    'menu.tab.animals': 'Animals',
    
    'menu.build.farm': 'Place Farm Foundation',
    'menu.build.school': 'Place School Foundation',
    'menu.build.library': 'Place Library Foundation',
    'menu.build.wall': 'Place Wall Foundation',
    'menu.build.road': 'Place Road Foundation',
    'menu.build.river': 'Place River Foundation',
    'menu.build.castle': 'Place Castle Foundation',
    
    'menu.plant.carrot': 'Plant Carrot',
    'menu.plant.watermelon': 'Plant Watermelon',
    'menu.plant.grape': 'Plant Grape',
    
    'menu.spawn.sheep': 'Place Sheep',
    'menu.spawn.pig': 'Place Pig',
    'menu.spawn.cow': 'Place Cow',
    
    'menu.idle.title': 'Idle Behaviour Weights',
    'menu.idle.rest': 'Rest',
    'menu.idle.cheer': 'Cheer',
    'menu.idle.wander': 'Wander',
    
    'menu.spawnWorker': 'Recruit Worker',
    'menu.claim': 'Claim Resources',
    'menu.demolish': 'Demolish',
    'menu.speed.1': 'Speed 1x',
    'menu.speed.2': 'Speed 2x',
    'menu.speed.4': 'Speed 4x',
    'menu.theme.toDark': 'Switch to Night Mode',
    'menu.theme.toLight': 'Switch to Day Mode',
    
    'building.farm': 'Farm',
    'building.school': 'School',
    'building.library': 'Library',
    'building.castle': 'Castle',
    'building.wall': 'Wall',
    'building.road': 'Road',
    'building.river': 'River',
    
    'crop.carrot': 'Carrot',
    'crop.watermelon': 'Watermelon',
    'crop.grape': 'Grape',
    
    'animal.sheep': 'Sheep',
    'animal.pig': 'Pig',
    'animal.cow': 'Cow',
    
    'poi.goldMine': 'Gold Mine',
    'poi.rock': 'Rock',
    'poi.tree': 'Tree',
    
    'msg.needLevel': '{name} requires level {required} (current: {current})',
    'msg.needHigherLevel': '{name} requires a higher level',
    'msg.placeFoundation': 'Placement mode: click the ground to place a {name} foundation',
    'msg.placeAnimal': 'Continuous placement: click ground to place {name} (click button again to cancel)',
    'msg.placeCrop': 'Select a farm to plant {name}',
    'msg.cancel': 'Cancelled',
    'msg.noIdleWorkers': 'No idle workers',
    'msg.demolishAssigned': 'Workers assigned to demolish',
    'msg.demolishHint': 'Click a building to demolish',
    'msg.demolishMode': 'Demolish mode: click a building',
    'msg.foundationPlaced': 'Foundation placed',
    'msg.resourceNotEnough': 'Not enough resources',
    'msg.claimed': 'Claimed: +1000 Stone/Wood/Food/Gold',
    'msg.goingTo': 'Heading to {name}...',
    'msg.catFollow': 'The cat is following you now!',
    'msg.catStoleResource': 'The cat stole {amount} from you!',
    'msg.catEscaped': 'The cat escaped!',
    'msg.catReward': 'Gained {amount} {resource}!',
    'msg.animalRan': '{name} ran away!',
    'msg.harvested': 'Harvested {name}: +{amount} Food',
    'msg.notMature': '{name} is not mature yet',
    'msg.planted': 'Planted {name}',
    'msg.plantFailed': 'This farm is occupied or locked',
    'msg.animalCostNotEnough': 'Not enough resources: 10 Gold and 10 Food required',
    'msg.animalPlaced': '{name} placed',
    'msg.levelUp': 'Level up: level {level}! New content unlocked!',
    'msg.demolishedRefund': 'Building demolished. Refunded: Food {food}, Wood {wood}',
    'msg.demolished': 'Building demolished',
    'msg.workerDied': 'A worker died from exhaustion',
    'msg.foundationComplete': 'Foundation completed',
    'msg.buildingShown': '{name} built',
    
    'tutorial.hint': 'Click anywhere to continue...',
    'tutorial.namePlaceholder': 'Enter your name',
    'tutorial.confirm': 'Confirm',
    'tutorial.nameEmpty': 'Name cannot be empty',
    'tutorial.0': 'Welcome to Slow Town<br>Please choose a name first',
    'tutorial.1': 'Use WASD to move',
    'tutorial.2': 'Use Arrow keys to pan the camera (mouse wheel to zoom)',
    'tutorial.3': 'Recruit workers and build a farm first',
    'tutorial.4': 'Planting, building and gathering grant XP',
    'tutorial.5': 'Gain XP to level up and unlock more content'
  }
}

let currentLanguage = 'zh'

export function getLanguage() {
  return currentLanguage
}

export function t(key, params = undefined) {
  const str =
    dictionaries[currentLanguage]?.[key] ??
    dictionaries.en?.[key] ??
    dictionaries.zh?.[key] ??
    key
  if (!params) return str
  return str.replace(/\{(\w+)\}/g, (_, name) => (params[name] ?? `{${name}}`))
}

export function applyI18n(doc = document) {
  if (doc?.documentElement) {
    doc.documentElement.setAttribute('lang', currentLanguage === 'en' ? 'en' : 'zh-CN')
  }
  if (doc?.body?.classList) {
    doc.body.classList.toggle('lang-en', currentLanguage === 'en')
    doc.body.classList.toggle('lang-zh', currentLanguage !== 'en')
  }
  doc.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n)
  })
  doc.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder))
  })
  doc.querySelectorAll('[data-i18n-title]').forEach((el) => {
    el.setAttribute('title', t(el.dataset.i18nTitle))
  })
}

export function setLanguage(lang, doc = document) {
  currentLanguage = lang === 'en' ? 'en' : 'zh'
  try {
    localStorage.setItem(STORAGE_KEY, currentLanguage)
  } catch {}
  applyI18n(doc)
  window.dispatchEvent(new CustomEvent('i18n:change', { detail: { lang: currentLanguage } }))
}

export function initI18n(doc = document) {
  let stored = null
  try {
    stored = localStorage.getItem(STORAGE_KEY)
  } catch {}
  if (stored === 'en' || stored === 'zh') {
    currentLanguage = stored
  }
  applyI18n(doc)
}
