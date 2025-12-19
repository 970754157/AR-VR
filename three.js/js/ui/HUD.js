export class HUD {
  constructor(root) {
    this.root = root
    this.ids = {
      playerName: root.querySelector('#player-name'),
      stone: root.querySelector('#res-stone'),
      wood: root.querySelector('#res-wood'),
      food: root.querySelector('#res-food'),
      gold: root.querySelector('#res-gold'),
      workers: root.querySelector('#res-workers'),
      speed: root.querySelector('#game-speed'),
      playerLevel: root.querySelector('#player-level'),
      playerExp: root.querySelector('#player-exp'),
      expBarFill: root.querySelector('#exp-bar-fill')
    }
  }
  update(resources, speed, playerLevel = 1, playerExp = 0, expPerLevel = 10, playerName = '') {
    if (this.ids.playerName) {
      this.ids.playerName.textContent = playerName
    }
    this.ids.stone.textContent = resources.stone.toString()
    this.ids.wood.textContent = resources.wood.toString()
    this.ids.food.textContent = resources.food.toString()
    this.ids.gold.textContent = resources.gold.toString()
    this.ids.workers.textContent = resources.workers.toString()
    this.ids.speed.textContent = speed + 'x'
    if (this.ids.playerLevel) {
      this.ids.playerLevel.textContent = playerLevel.toString()
    }
    if (this.ids.playerExp) {
      this.ids.playerExp.textContent = `${playerExp}/${expPerLevel}`
    }
    // 更新经验进度条
    if (this.ids.expBarFill) {
      const progress = expPerLevel > 0 ? Math.min(100, (playerExp / expPerLevel) * 100) : 0
      this.ids.expBarFill.style.width = `${progress}%`
      this.ids.expBarFill.style.display = 'block' // 确保显示
      
      // 根据进度设置不同颜色
      let colorGradient = ''
      if (progress < 30) {
        // 0-30%: 红色到橙色
        colorGradient = 'linear-gradient(90deg, #f44336 0%, #ff9800 100%)'
      } else if (progress < 60) {
        // 30-60%: 橙色到黄色
        colorGradient = 'linear-gradient(90deg, #ff9800 0%, #ffeb3b 100%)'
      } else if (progress < 90) {
        // 60-90%: 黄色到浅绿色
        colorGradient = 'linear-gradient(90deg, #ffeb3b 0%, #8bc34a 100%)'
      } else {
        // 90-100%: 浅绿色到深绿色
        colorGradient = 'linear-gradient(90deg, #8bc34a 0%, #4caf50 100%)'
      }
      this.ids.expBarFill.style.background = colorGradient
    }
  }
}
