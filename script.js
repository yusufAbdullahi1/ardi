// ---- Chase state ----
let dodgeCount = 0          // how many times the No button has run away
let musicPlaying = true
const DODGES_TO_WIN = 3     // No must dodge this many times before Yes works

// ---- Toast copy (all teasing lives here, never on the buttons) ----
const DODGE_FIRST = "No keeps running, Yes is right there 😌"
const dodgeLaterMsgs = [
    "even the No button knows you're stunning 💜",
    "you can't deny it, gorgeous 💕",
    "the truth is one tap away 💜"
]
const yesEarlyMsgs = [
    "catch a No first, then we'll talk 😏",
    "make it run a little, gorgeous 💜"
]
let yesEarlyIndex = 0

// ---- Elements ----
const yesBtn = document.getElementById('yes-btn')
const noBtn = document.getElementById('no-btn')
const toast = document.getElementById('tease-toast')
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

// ---- Yes button: always reacts, never moves ----
function handleYesClick() {
    if (dodgeCount >= DODGES_TO_WIN) {
        window.location.href = 'yes.html'   // chase done — go celebrate (no toast)
        return
    }
    // Too early: shrink Yes a little, in place (it's in normal flow, so it can
    // never move off-screen or overlap No), and nudge her with a toast.
    const size = parseFloat(window.getComputedStyle(yesBtn).fontSize)
    yesBtn.style.fontSize = `${Math.max(size * 0.9, 12)}px`
    showToast(yesEarlyMsgs[yesEarlyIndex % yesEarlyMsgs.length])
    yesEarlyIndex++
}

// ---- No button: every click/tap moves it and shows a popup ----
// No hover. A tap on mobile fires a click too, so this one handler works on both
// phone and desktop. The button's text never changes.
function handleNoClick() {
    dodgeCount++
    moveNoToSafeSpot()
    showToast(dodgeCount === 1
        ? DODGE_FIRST
        : dodgeLaterMsgs[(dodgeCount - 2) % dodgeLaterMsgs.length])
}

// ---- Toast helper ----
function showToast(msg) {
    toast.textContent = msg
    toast.classList.add('show')
    clearTimeout(toast._timer)
    toast._timer = setTimeout(() => toast.classList.remove('show'), 4500)
}

// ---- Positioning: keep No fully on screen and clear of Yes ----
function moveNoToSafeSpot() {
    const margin = 20
    const buffer = 28 // clear space to keep around the Yes button
    const btnW = noBtn.offsetWidth
    const btnH = noBtn.offsetHeight
    const maxX = Math.max(window.innerWidth - btnW - margin, margin / 2)
    const maxY = Math.max(window.innerHeight - btnH - margin, margin / 2)

    const yesRect = yesBtn.getBoundingClientRect()

    // Try random spots until one is clear of the Yes button.
    let x, y, attempts = 0
    do {
        x = Math.random() * maxX + margin / 2
        y = Math.random() * maxY + margin / 2
        attempts++
    } while (attempts < 40 && overlapsYes(x, y, btnW, btnH, yesRect, buffer))

    // Guaranteed fallback: drop it into whichever gap around the Yes button has
    // the most room, flush to that edge, so it never sits on top of Yes.
    if (overlapsYes(x, y, btnW, btnH, yesRect, buffer)) {
        const spaceLeft = yesRect.left
        const spaceRight = window.innerWidth - yesRect.right
        const spaceTop = yesRect.top
        const spaceBottom = window.innerHeight - yesRect.bottom
        const mostSpace = Math.max(spaceLeft, spaceRight, spaceTop, spaceBottom)
        const clamp = (v, lo, hi) => Math.max(lo, Math.min(v, hi))

        if (mostSpace === spaceRight) {
            x = clamp(yesRect.right + buffer, margin / 2, maxX)
            y = clamp(yesRect.top, margin / 2, maxY)
        } else if (mostSpace === spaceLeft) {
            x = clamp(yesRect.left - buffer - btnW, margin / 2, maxX)
            y = clamp(yesRect.top, margin / 2, maxY)
        } else if (mostSpace === spaceBottom) {
            x = clamp(yesRect.left, margin / 2, maxX)
            y = clamp(yesRect.bottom + buffer, margin / 2, maxY)
        } else {
            x = clamp(yesRect.left, margin / 2, maxX)
            y = clamp(yesRect.top - buffer - btnH, margin / 2, maxY)
        }
    }

    noBtn.style.position = 'fixed'
    noBtn.style.left = `${x}px`
    noBtn.style.top = `${y}px`
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
