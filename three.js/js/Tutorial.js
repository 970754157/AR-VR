// 教程系统
export class Tutorial {
  constructor(game, ui) {
    this.game = game
    this.ui = ui
    this.tutorialOverlay = document.getElementById('tutorial-overlay')
    this.tutorialText = document.getElementById('tutorial-text')
    this.tutorialInputContainer = document.getElementById('tutorial-input-container')
    this.playerNameInput = document.getElementById('player-name-input')
    this.confirmNameBtn = document.getElementById('confirm-name')
    this.tutorialHint = document.getElementById('tutorial-hint')
    
    this.tutorials = [
      {
        text: '欢迎来到这个充满神奇生物的小镇<br>首先先起个名字吧',
        needsInput: true
      },
      {
        text: '按住WASD进行移动',
        needsInput: false
      },
      {
        text: '使用上下左右键平移相机',
        needsInput: false
      },
      {
        text: '首先招募工人帮助你建造一片农田吧',
        needsInput: false
      },
      {
        text: '种植，建造，采集物品都可以获得经验',
        needsInput: false
      },
      {
        text: '获得更多的经验升级解锁更多物品来探索这个世界吧',
        needsInput: false
      }
    ]
    
    this.currentTutorialIndex = 0
    this.tutorialCompleted = false
    
    this.init()
  }

  init() {
    this.confirmNameBtn.addEventListener('click', () => {
      this.nextTutorial()
    })

    this.playerNameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.nextTutorial()
      }
    })

    this.tutorialOverlay.addEventListener('click', (e) => {
      if (e.target === this.tutorialOverlay || e.target === this.tutorialText || e.target === this.tutorialHint) {
        if (this.currentTutorialIndex === 0 && this.tutorials[0].needsInput) {
          return
        }
        this.nextTutorial()
      }
    })

    this.showTutorial(0)
  }

  showTutorial(index) {
    if (index >= this.tutorials.length) {
      this.tutorialOverlay.style.display = 'none'
      this.tutorialCompleted = true
      return
    }
    
    const tutorial = this.tutorials[index]
    this.tutorialText.innerHTML = tutorial.text
    
    if (tutorial.needsInput) {
      this.tutorialInputContainer.style.display = 'flex'
      this.tutorialHint.style.display = 'none'
      this.playerNameInput.focus()
    } else {
      this.tutorialInputContainer.style.display = 'none'
      this.tutorialHint.style.display = 'block'
    }
  }

  nextTutorial() {
    if (this.currentTutorialIndex === 0 && this.tutorials[0].needsInput) {
      const name = this.playerNameInput.value.trim()
      if (name) {
        this.game.state.playerName = name
        this.currentTutorialIndex++
        this.showTutorial(this.currentTutorialIndex)
      } else {
        this.ui.toast('名字不能为空')
      }
    } else {
      this.currentTutorialIndex++
      this.showTutorial(this.currentTutorialIndex)
    }
  }

  isCompleted() {
    return this.tutorialCompleted
  }
}

