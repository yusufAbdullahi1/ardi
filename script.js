const gifStages = [
    "https://media.tenor.com/EBV7OT7ACfwAAAAj/u-u-qua-qua-u-quaa.gif",    // 0 normal
    "https://media1.tenor.com/m/uDugCXK4vI4AAAAd/chiikawa-hachiware.gif",  // 1 confused
    "https://media.tenor.com/f_rkpJbH1s8AAAAj/somsom1012.gif",             // 2 pleading
    "https://media.tenor.com/OGY9zdREsVAAAAAj/somsom1012.gif",             // 3 sad
    "https://media1.tenor.com/m/WGfra-Y_Ke0AAAAd/chiikawa-sad.gif",       // 4 sadder
    "https://media.tenor.com/CivArbX7NzQAAAAj/somsom1012.gif",             // 5 devastated
    "https://media.tenor.com/5_tv1HquZlcAAAAj/chiikawa.gif",               // 6 very devastated
    "https://media1.tenor.com/m/uDugCXK4vI4AAAAC/chiikawa-hachiware.gif"  // 7 crying runaway
]

const noMessages = [
    "No",
    "Are you sureeee? 🤨",
    "Wrong answer, gorgeous 😏",
    "The mirror disagrees 💜",
    "Denying it won't work 😌",
    "You're simply stunning, admit it 💅",
    "You can't escape the truth 😋",
    "Last chance to agreeee! 😤"
]

const yesTeasePokes = [
    "go on, try saying no 👀",
    "click no, I dareee you 😏",
    "bet you can't even click it 💜"
]

let yesTeasedCount = 0

let noClickCount = 0
let runawayEnabled = false
let musicPlaying = true

const catGif = document.getElementById('cat-gif')
const yesBtn = document.getElementById('yes-btn')
const noBtn = document.getElementById('no-btn')
const music = document.getElementById('bg-music')

// Background music. Try a silent autoplay (desktop may allow it; mobile won't).
music.volume = 0.3
music.muted = true
music.play().then(() => { music.muted = false }).catch(() => {})

// Reliable mobile start: unmute AND call play() inside the user's first gesture.
// iOS only unlocks sound when play() runs during a real interaction, so we must
// call it every time (the audio is already "playing" muted via autoplay, so a
// `paused` check would skip it). We listen for several gesture types and act on
// whichever fires first, then remove them all. These are passive and never call
// preventDefault or dispatch a click, so they can't trigger the Yes/No buttons.
// Calling play() on already-playing audio is a no-op, so music is never restarted.
const unlockEvents = ['pointerdown', 'touchstart', 'click', 'keydown']
function unlockMusic() {
    unlockEvents.forEach(ev => document.removeEventListener(ev, unlockMusic, true))
    if (!musicPlaying) return          // user already turned it off via the toggle
    music.muted = false
    music.play().catch(() => {})
}
unlockEvents.forEach(ev => document.addEventListener(ev, unlockMusic, { capture: true, passive: true }))

function toggleMusic() {
    if (musicPlaying) {
        music.pause()
        musicPlaying = false
        document.getElementById('music-toggle').textContent = '🔇'
    } else {
        music.muted = false
        music.play()
        musicPlaying = true
        document.getElementById('music-toggle').textContent = '🔊'
    }
}

function handleYesClick() {
    if (!runawayEnabled) {
        // Tease her to try No first
        const msg = yesTeasePokes[Math.min(yesTeasedCount, yesTeasePokes.length - 1)]
        yesTeasedCount++
        showTeaseMessage(msg)
        return
    }
    window.location.href = 'yes.html'
}

function showTeaseMessage(msg) {
    let toast = document.getElementById('tease-toast')
    toast.textContent = msg
    toast.classList.add('show')
    clearTimeout(toast._timer)
    toast._timer = setTimeout(() => toast.classList.remove('show'), 2500)
}

function handleNoClick() {
    noClickCount++

    // Cycle through guilt-trip messages
    const msgIndex = Math.min(noClickCount, noMessages.length - 1)
    noBtn.textContent = noMessages[msgIndex]

    // Grow the Yes button each time, but cap it relative to the viewport so the
    // No button always has room to dodge to a spot that isn't on top of it.
    const currentSize = parseFloat(window.getComputedStyle(yesBtn).fontSize)
    const maxFont = Math.min(window.innerWidth, window.innerHeight) * 0.11
    yesBtn.style.fontSize = `${Math.min(currentSize * 1.35, maxFont)}px`
    const padY = Math.min(18 + noClickCount * 5, 60, window.innerHeight * 0.06)
    const padX = Math.min(45 + noClickCount * 10, 120, window.innerWidth * 0.15)
    yesBtn.style.padding = `${padY}px ${padX}px`

    // Shrink No button to contrast
    if (noClickCount >= 2) {
        const noSize = parseFloat(window.getComputedStyle(noBtn).fontSize)
        noBtn.style.fontSize = `${Math.max(noSize * 0.85, 10)}px`
    }

    // Swap cat GIF through stages
    const gifIndex = Math.min(noClickCount, gifStages.length - 1)
    swapGif(gifStages[gifIndex])

    // Runaway starts at click 5
    if (noClickCount >= 5 && !runawayEnabled) {
        enableRunaway()
        runawayEnabled = true
    }
}

function swapGif(src) {
    catGif.style.opacity = '0'
    setTimeout(() => {
        catGif.src = src
        catGif.style.opacity = '1'
    }, 200)
}

function enableRunaway() {
    noBtn.addEventListener('mouseover', runAway)
    noBtn.addEventListener('touchstart', runAway, { passive: false })
    runAway() // jump to a safe spot immediately so it's never left sitting on Yes
}

function runAway(e) {
    // Suppress the synthetic "ghost click" mobile fires ~300ms after a touch:
    // once the No button jumps away, that click could otherwise land on the
    // (now larger) Yes button and trigger it by accident.
    if (e && e.cancelable) e.preventDefault()

    const margin = 20
    const buffer = 28 // clear space to keep around the Yes button
    const btnW = noBtn.offsetWidth
    const btnH = noBtn.offsetHeight
    const maxX = Math.max(window.innerWidth - btnW - margin, margin / 2)
    const maxY = Math.max(window.innerHeight - btnH - margin, margin / 2)

    const yesRect = yesBtn.getBoundingClientRect()

    // Try random spots until one is clear of the Yes button.
    let randomX, randomY, attempts = 0
    do {
        randomX = Math.random() * maxX + margin / 2
        randomY = Math.random() * maxY + margin / 2
        attempts++
    } while (attempts < 40 && overlapsYes(randomX, randomY, btnW, btnH, yesRect, buffer))

    // Guaranteed fallback: drop it into whichever gap around the Yes button has
    // the most room, flush to that edge, so it never sits on top of Yes.
    if (overlapsYes(randomX, randomY, btnW, btnH, yesRect, buffer)) {
        const spaceLeft = yesRect.left
        const spaceRight = window.innerWidth - yesRect.right
        const spaceTop = yesRect.top
        const spaceBottom = window.innerHeight - yesRect.bottom
        const mostSpace = Math.max(spaceLeft, spaceRight, spaceTop, spaceBottom)
        const clamp = (v, lo, hi) => Math.max(lo, Math.min(v, hi))

        if (mostSpace === spaceRight) {
            randomX = clamp(yesRect.right + buffer, margin / 2, maxX)
            randomY = clamp(yesRect.top, margin / 2, maxY)
        } else if (mostSpace === spaceLeft) {
            randomX = clamp(yesRect.left - buffer - btnW, margin / 2, maxX)
            randomY = clamp(yesRect.top, margin / 2, maxY)
        } else if (mostSpace === spaceBottom) {
            randomX = clamp(yesRect.left, margin / 2, maxX)
            randomY = clamp(yesRect.bottom + buffer, margin / 2, maxY)
        } else {
            randomX = clamp(yesRect.left, margin / 2, maxX)
            randomY = clamp(yesRect.top - buffer - btnH, margin / 2, maxY)
        }
    }

    noBtn.style.position = 'fixed'
    noBtn.style.left = `${randomX}px`
    noBtn.style.top = `${randomY}px`
    noBtn.style.zIndex = '50'
}

// True if a No button at (x, y) would touch or come within `buffer` px of Yes.
function overlapsYes(x, y, w, h, yesRect, buffer) {
    return !(
        x + w + buffer < yesRect.left ||
        x > yesRect.right + buffer ||
        y + h + buffer < yesRect.top ||
        y > yesRect.bottom + buffer
    )
}
