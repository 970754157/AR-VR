// 教程系统
import { t } from './i18n.js'
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
      { key: 'tutorial.0', needsInput: true },
      { key: 'tutorial.1', needsInput: false },
      { key: 'tutorial.2', needsInput: false },
      { key: 'tutorial.3', needsInput: false },
      { key: 'tutorial.4', needsInput: false },
      { key: 'tutorial.5', needsInput: false }
    ]
    
    this.currentTutorialIndex = 0
    this.tutorialCompleted = false
    
    this.init()
    
    window.addEventListener('i18n:change', () => {
      this.refresh()
    })
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
    this.tutorialText.innerHTML = t(tutorial.key)
    
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
        this.ui.toast(t('tutorial.nameEmpty'))
      }
    } else {
      this.currentTutorialIndex++
      this.showTutorial(this.currentTutorialIndex)
    }
  }

  refresh() {
    if (this.tutorialCompleted) return
    this.showTutorial(this.currentTutorialIndex)
  }

  isCompleted() {
    return this.tutorialCompleted
  }
}
