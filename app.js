const FRENCH_TEXT = [
  "Le Cancre",
  "Il dit non avec la tête",
  "mais il dit oui avec le coeur",
  "il dit oui à ce qu'il aime",
  "il dit non au professeur",
  "il est debout",
  "on le questionne",
  "et tous les problèmes sont posés",
  "soudain le fou rire le prend",
  "et il efface tout",
  "les chiffres et les mots",
  "les dates et les noms",
  "les phrases et les pièges",
  "et malgré les menaces du maître",
  "sous les huées des enfants prodiges",
  "avec des craies de toutes les couleurs",
  "sur le tableau noir du malheur",
  "il dessine le visage du bonheur."
]

let mode = 1
let currentLine = 0
let hidden = new Set()
let audioPlayer = null

function setMode(m) {
  mode = m
  currentLine = 0
  render()
  updateActiveButton()
}

function updateActiveButton() {
  document.getElementById('btn-mode-1').classList.toggle('active', mode === 1)
  document.getElementById('btn-mode-2').classList.toggle('active', mode === 2)
  document.getElementById('btn-mode-3').classList.toggle('active', mode === 3)
}

function speak(text) {
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'fr-FR'
  u.rate = 0.9
  speechSynthesis.speak(u)
}

// פונקציית מרחק לֶוֶנְשְטַיְן
function levenshtein(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () => [])
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      )
    }
  }
  return matrix[a.length][b.length]
}

// תרגול קולי
function practiceLine(line, container) {
  if (!('webkitSpeechRecognition' in window)) {
    alert("הדפדפן שלך לא תומך בזיהוי דיבור (SpeechRecognition). נסה ב-Chrome.")
    return
  }

  const recognition = new webkitSpeechRecognition()
  recognition.lang = 'fr-FR'
  recognition.interimResults = false
  recognition.maxAlternatives = 1

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript

    let resultSpan = container.querySelector('.result')
    if (!resultSpan) {
      resultSpan = document.createElement('div')
      resultSpan.className = 'result'
      container.appendChild(resultSpan)
    }

    const ref = line.toLowerCase().trim()
    const said = transcript.toLowerCase().trim()

    const dist = levenshtein(ref, said)
    const maxLen = Math.max(ref.length, said.length)
    const similarity = 1 - dist / maxLen

    if (similarity >= 0.6) {
      resultSpan.textContent = "✔️ נכון!"
      resultSpan.style.color = "green"
    } else {
      resultSpan.textContent = `❌ שמעת: "${transcript}"`
      resultSpan.style.color = "red"
    }
  }

  recognition.onerror = () => {
    let resultSpan = container.querySelector('.result')
    if (!resultSpan) {
      resultSpan = document.createElement('div')
      resultSpan.className = 'result'
      container.appendChild(resultSpan)
    }
    resultSpan.textContent = "⚠️ שגיאה בזיהוי דיבור"
    resultSpan.style.color = "orange"
  }

  recognition.start()
}

// ציור הממשק
function render() {
  const main = document.getElementById('main')
  main.innerHTML = ''

  // מצב 1: טקסט מלא
  if (mode === 1) {
    const controls = document.createElement('div')
    controls.style.marginBottom = '20px'

    const playBtn = document.createElement('button')
    playBtn.textContent = "השמע את הטקסט"
    playBtn.onclick = () => {
      if (audioPlayer) {
        audioPlayer.pause()
      }
      audioPlayer = new Audio('french_poem.wav')
      audioPlayer.play()
    }
    controls.appendChild(playBtn)

    const stopBtn = document.createElement('button')
    stopBtn.textContent = "עצור"
    stopBtn.style.marginLeft = '12px'
    stopBtn.onclick = () => {
      if (audioPlayer) {
        audioPlayer.pause()
        audioPlayer.currentTime = 0
      }
      speechSynthesis.cancel()
    }
    controls.appendChild(stopBtn)

    main.appendChild(controls)

    FRENCH_TEXT.forEach(line => {
      const p = document.createElement('p')
      p.textContent = line
      main.appendChild(p)
    })
  }

  // מצב 2: שורה אחר שורה
  if (mode === 2) {
    const nav = document.createElement('div')
    nav.className = 'nav-line'

    const back = document.createElement('button')
    back.textContent = "⬅️"
    back.onclick = () => { if (currentLine > 0) { currentLine--; render() } }
    nav.appendChild(back)

    const span = document.createElement('span')
    span.textContent = `${currentLine + 1} / ${FRENCH_TEXT.length}`
    nav.appendChild(span)

    const next = document.createElement('button')
    next.textContent = "➡️"
    next.onclick = () => { if (currentLine < FRENCH_TEXT.length - 1) { currentLine++; render() } }
    nav.appendChild(next)

    main.appendChild(nav)

    const line = document.createElement('p')
    line.textContent = FRENCH_TEXT[currentLine]
    main.appendChild(line)

    const playBtn = document.createElement('button')
    playBtn.textContent = "השמע שורה זו"
    playBtn.onclick = () => speak(FRENCH_TEXT[currentLine])
    main.appendChild(playBtn)

    const practiceBtn = document.createElement('button')
    practiceBtn.textContent = "תרגל ואמר בקול"
    practiceBtn.onclick = () => practiceLine(FRENCH_TEXT[currentLine], main)
    main.appendChild(practiceBtn)
  }

  // מצב 3: הצג/הסתר
  if (mode === 3) {
    const controls = document.createElement('div')
    controls.className = 'nav-line'

    const showAll = document.createElement('button')
    showAll.textContent = "הצג הכל"
    showAll.onclick = () => { hidden.clear(); render() }
    controls.appendChild(showAll)

    const hideAll = document.createElement('button')
    hideAll.textContent = "הסתר הכל"
    hideAll.onclick = () => { hidden = new Set(FRENCH_TEXT.map((_, i) => i)); render() }
    controls.appendChild(hideAll)

    main.appendChild(controls)

    FRENCH_TEXT.forEach((line, i) => {
      const div = document.createElement('div')
      div.className = 'line'

      const toggle = document.createElement('button')
      toggle.textContent = hidden.has(i) ? "👁‍🗨" : "👁"
      toggle.onclick = () => {
        if (hidden.has(i)) hidden.delete(i)
        else hidden.add(i)
        render()
      }
      div.appendChild(toggle)

      const text = document.createElement('span')
      text.textContent = hidden.has(i) ? "──────" : line
      div.appendChild(text)

      const playBtn = document.createElement('button')
      playBtn.textContent = "🔊"
      playBtn.disabled = hidden.has(i)
      playBtn.onclick = () => speak(line)
      div.appendChild(playBtn)

      const practiceBtn = document.createElement('button')
      practiceBtn.textContent = "💬"
      practiceBtn.disabled = hidden.has(i)
      practiceBtn.onclick = () => practiceLine(line, div)
      div.appendChild(practiceBtn)

      const result = document.createElement('div')
      result.className = 'result'
      div.appendChild(result)

      main.appendChild(div)
    })
  }
}

// הפעלה ראשונית
updateActiveButton()
render()
