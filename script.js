class MemoryGame {
  constructor() {
    this.currentLevel = 1
    this.score = 0
    this.startTime = null
    this.gameTimer = null
    this.sequence = []
    this.playerSequence = []
    this.isShowingSequence = false
    this.isPlayerTurn = false
    this.gameActive = false
    this.sequenceSpeed = 800
    this.settings = {
      language: "en",
      theme: "light",
      music: true,
      vibration: true,
    }

    this.translations = {
      en: {
        title: "Memory Game",
        play: "Play",
        settings: "Settings",
        language: "Language",
        theme: "Theme",
        light: "Light",
        dark: "Dark",
        music: "Music",
        vibration: "Vibration",
        on: "On",
        off: "Off",
        back: "Back",
        level: "Level",
        score: "Score",
        time: "Time",
        pause: "Pause",
        home: "Home",
        restart: "Restart",
        start: "Start",
        clickToStart: "Click Start to begin!",
        watchSequence: "Watch the sequence...",
        yourTurn: "Your turn!",
        correct: "Correct!",
        wrong: "Wrong! Try again",
        levelComplete: "Level Complete!",
        nextLevel: "Next Level",
        menu: "Menu",
        paused: "Game Paused",
        resume: "Resume",
        moves: "Moves",
      },
      pt: {
        title: "Jogo da Memória",
        play: "Jogar",
        settings: "Configurações",
        language: "Idioma",
        theme: "Tema",
        light: "Claro",
        dark: "Escuro",
        music: "Música",
        vibration: "Vibração",
        on: "Ligado",
        off: "Desligado",
        back: "Voltar",
        level: "Nível",
        score: "Pontos",
        time: "Tempo",
        pause: "Pausar",
        home: "Início",
        restart: "Reiniciar",
        start: "Começar",
        clickToStart: "Clique em Começar para iniciar!",
        watchSequence: "Observe a sequência...",
        yourTurn: "Sua vez!",
        correct: "Correto!",
        wrong: "Errado! Tente novamente",
        levelComplete: "Nível Completo!",
        nextLevel: "Próximo Nível",
        menu: "Menu",
        paused: "Jogo Pausado",
        resume: "Continuar",
        moves: "Jogadas",
      },
    }

    this.colors = ["red", "green", "blue", "yellow"]
    this.audioContext = null
    this.colorSounds = {}

    this.init()
  }

  init() {
    this.loadSettings()
    this.bindEvents()
    this.updateLanguage()
    this.updateTheme()
    this.initAudio()
  }

  initAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      this.createColorSounds()
    } catch (e) {
      console.log("Audio not supported")
    }
  }

  createColorSounds() {
    const frequencies = {
      red: 220, // A3
      green: 277, // C#4
      blue: 330, // E4
      yellow: 440, // A4
    }

    Object.keys(frequencies).forEach((color) => {
      this.colorSounds[color] = frequencies[color]
    })
  }

  playColorSound(color) {
    if (!this.settings.music || !this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.frequency.setValueAtTime(this.colorSounds[color], this.audioContext.currentTime)
    oscillator.type = "sine"

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.5)
  }

  loadSettings() {
    const saved = localStorage.getItem("memoryGameSettings")
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) }
    }
    this.applySettings()
  }

  saveSettings() {
    localStorage.setItem("memoryGameSettings", JSON.stringify(this.settings))
  }

  applySettings() {
    document.getElementById("languageSelect").value = this.settings.language
    document.getElementById(this.settings.theme + "Theme").classList.add("active")
    document.getElementById(this.settings.theme === "light" ? "darkTheme" : "lightTheme").classList.remove("active")
    document.getElementById("music" + (this.settings.music ? "On" : "Off")).classList.add("active")
    document.getElementById("music" + (this.settings.music ? "Off" : "On")).classList.remove("active")
    document.getElementById("vibration" + (this.settings.vibration ? "On" : "Off")).classList.add("active")
    document.getElementById("vibration" + (this.settings.vibration ? "Off" : "On")).classList.remove("active")
  }

  bindEvents() {
    // Menu navigation
    document.getElementById("playBtn").addEventListener("click", () => this.startGame())
    document.getElementById("settingsBtn").addEventListener("click", () => this.showSettings())
    document.getElementById("backBtn").addEventListener("click", () => this.showMainMenu())
    document.getElementById("homeBtn").addEventListener("click", () => this.showMainMenu())
    document.getElementById("restartBtn").addEventListener("click", () => this.restartLevel())
    document.getElementById("pauseBtn").addEventListener("click", () => this.pauseGame())
    document.getElementById("startSequenceBtn").addEventListener("click", () => this.startSequence())

    // Settings
    document.getElementById("languageSelect").addEventListener("change", (e) => {
      this.settings.language = e.target.value
      this.updateLanguage()
      this.saveSettings()
    })

    document.getElementById("lightTheme").addEventListener("click", () => this.setTheme("light"))
    document.getElementById("darkTheme").addEventListener("click", () => this.setTheme("dark"))
    document.getElementById("musicOn").addEventListener("click", () => this.setMusic(true))
    document.getElementById("musicOff").addEventListener("click", () => this.setMusic(false))
    document.getElementById("vibrationOn").addEventListener("click", () => this.setVibration(true))
    document.getElementById("vibrationOff").addEventListener("click", () => this.setVibration(false))

    // Color buttons
    this.colors.forEach((color) => {
      const button = document.querySelector(`[data-color="${color}"]`)
      button.addEventListener("click", () => this.colorClicked(color))
    })

    // Modals
    document.getElementById("nextLevelBtn").addEventListener("click", () => this.nextLevel())
    document.getElementById("menuBtn").addEventListener("click", () => this.showMainMenu())
    document.getElementById("resumeBtn").addEventListener("click", () => this.resumeGame())
    document.getElementById("pauseMenuBtn").addEventListener("click", () => this.showMainMenu())
  }

  updateLanguage() {
    const elements = document.querySelectorAll("[data-translate]")
    elements.forEach((element) => {
      const key = element.getAttribute("data-translate")
      element.textContent = this.translations[this.settings.language][key]
    })
    document.documentElement.lang = this.settings.language === "pt" ? "pt-BR" : "en"
  }

  setTheme(theme) {
    this.settings.theme = theme
    this.updateTheme()
    this.saveSettings()

    document.getElementById("lightTheme").classList.toggle("active", theme === "light")
    document.getElementById("darkTheme").classList.toggle("active", theme === "dark")
  }

  updateTheme() {
    document.documentElement.setAttribute("data-theme", this.settings.theme)
  }

  setMusic(enabled) {
    this.settings.music = enabled
    this.saveSettings()

    document.getElementById("musicOn").classList.toggle("active", enabled)
    document.getElementById("musicOff").classList.toggle("active", !enabled)
  }

  setVibration(enabled) {
    this.settings.vibration = enabled
    this.saveSettings()

    document.getElementById("vibrationOn").classList.toggle("active", enabled)
    document.getElementById("vibrationOff").classList.toggle("active", !enabled)
  }

  vibrate(pattern = [100]) {
    if (this.settings.vibration && "vibrate" in navigator) {
      navigator.vibrate(pattern)
    }
  }

  showScreen(screenId) {
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.remove("active")
    })
    document.getElementById(screenId).classList.add("active")
  }

  showModal(modalId) {
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.classList.remove("active")
    })
    document.getElementById(modalId).classList.add("active")
  }

  hideModals() {
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.classList.remove("active")
    })
  }

  showMainMenu() {
    this.showScreen("mainMenu")
    this.hideModals()
    this.stopTimer()
    this.gameActive = false
  }

  showSettings() {
    this.showScreen("settingsMenu")
  }

  startGame() {
    this.currentLevel = 1
    this.score = 0
    this.showScreen("gameScreen")
    this.initLevel()
  }

  initLevel() {
    this.sequence = []
    this.playerSequence = []
    this.isShowingSequence = false
    this.isPlayerTurn = false
    this.gameActive = true
    this.sequenceSpeed = Math.max(300, 800 - this.currentLevel * 30)

    document.getElementById("levelDisplay").textContent = this.currentLevel
    document.getElementById("scoreDisplay").textContent = this.score

    this.updateGameStatus("clickToStart")
    this.enableColorButtons(false)
    document.getElementById("startSequenceBtn").style.display = "block"
    document.getElementById("startSequenceBtn").style.visibility = "visible"
  }

  updateGameStatus(key) {
    const statusElement = document.getElementById("gameStatus")
    statusElement.textContent = this.translations[this.settings.language][key]
  }

  enableColorButtons(enabled) {
    this.colors.forEach((color) => {
      const button = document.querySelector(`[data-color="${color}"]`)
      button.classList.toggle("disabled", !enabled)
    })
  }

  startSequence() {
    if (!this.gameActive) return

    document.getElementById("startSequenceBtn").style.display = "none"
    this.startTimer()
    this.addToSequence()
    this.showSequence()
  }

  addToSequence() {
    const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)]
    this.sequence.push(randomColor)
  }

  async showSequence() {
    this.isShowingSequence = true
    this.isPlayerTurn = false
    this.enableColorButtons(false)
    this.updateGameStatus("watchSequence")

    await this.delay(1000)

    for (let i = 0; i < this.sequence.length; i++) {
      await this.highlightColor(this.sequence[i])
      await this.delay(this.sequenceSpeed)
    }

    this.isShowingSequence = false
    this.isPlayerTurn = true
    this.playerSequence = []
    this.enableColorButtons(true)
    this.updateGameStatus("yourTurn")
  }

  async highlightColor(color) {
    const button = document.querySelector(`[data-color="${color}"]`)
    button.classList.add("active")
    this.playColorSound(color)
    this.vibrate([100])

    await this.delay(300)
    button.classList.remove("active")
  }

  colorClicked(color) {
    if (!this.isPlayerTurn || this.isShowingSequence) return

    this.playerSequence.push(color)
    this.highlightColor(color)

    const currentIndex = this.playerSequence.length - 1

    if (this.playerSequence[currentIndex] !== this.sequence[currentIndex]) {
      this.wrongMove()
      return
    }

    if (this.playerSequence.length === this.sequence.length) {
      this.correctSequence()
    }
  }

  wrongMove() {
    this.updateGameStatus("wrong")
    this.enableColorButtons(false)
    this.vibrate([200, 100, 200])

    this.colors.forEach((color) => {
      const button = document.querySelector(`[data-color="${color}"]`)
      button.classList.add("wrong")
    })

    setTimeout(() => {
      this.colors.forEach((color) => {
        const button = document.querySelector(`[data-color="${color}"]`)
        button.classList.remove("wrong")
      })
      this.showSequence()
    }, 1500)
  }

  correctSequence() {
    this.updateGameStatus("correct")
    this.score += this.currentLevel * 10
    document.getElementById("scoreDisplay").textContent = this.score
    this.enableColorButtons(false)
    this.vibrate([100, 50, 100, 50, 100])

    setTimeout(() => {
      if (this.sequence.length >= this.currentLevel + 3) {
        this.levelComplete()
      } else {
        this.addToSequence()
        this.showSequence()
      }
    }, 1000)
  }

  levelComplete() {
    this.gameActive = false
    this.stopTimer()

    const finalTime = document.getElementById("timeDisplay").textContent
    document.getElementById("finalTime").textContent = finalTime
    document.getElementById("finalMoves").textContent = this.sequence.length

    setTimeout(() => {
      this.showModal("levelCompleteModal")
    }, 1000)

    this.vibrate([100, 100, 100, 100])
  }

  nextLevel() {
    this.currentLevel++
    this.hideModals()
    document.getElementById("timeDisplay").textContent = "00:00"
    this.stopTimer()
    this.startTime = null
    this.initLevel()
  }

  restartLevel() {
    document.getElementById("timeDisplay").textContent = "00:00"
    this.stopTimer()
    this.startTime = null
    this.initLevel()
  }

  pauseGame() {
    this.gameActive = false
    this.stopTimer()
    this.showModal("pauseModal")
  }

  resumeGame() {
    this.gameActive = true
    this.startTimer()
    this.hideModals()
  }

  startTimer() {
    if (this.gameTimer || !this.gameActive) return

    this.startTime = Date.now()
    this.gameTimer = setInterval(() => {
      if (this.gameActive && this.startTime) {
        const elapsed = Date.now() - this.startTime
        const minutes = Math.floor(elapsed / 60000)
        const seconds = Math.floor((elapsed % 60000) / 1000)
        document.getElementById("timeDisplay").textContent =
          `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      }
    }, 1000)
  }

  stopTimer() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer)
      this.gameTimer = null
    }
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// Initialize game when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new MemoryGame()
})
