let musicPlaying = false

window.addEventListener('load', () => {
    launchConfetti()

    const music = document.getElementById('bg-music')
    music.volume = 0.3
    musicPlaying = true
    document.getElementById('music-toggle').textContent = '🔊'

    // Try a silent autoplay (desktop may allow it; mobile won't). A page
    // navigation does NOT carry the user's gesture, so mobile blocks audible
    // playback until the first interaction.
    music.muted = true
    music.play().then(() => { music.muted = false }).catch(() => {})

    // Reliable mobile start: unmute AND call play() inside the first gesture.
    // Listeners are passive and never dispatch clicks, then remove themselves.
    const unlockEvents = ['pointerdown', 'touchstart', 'click', 'keydown']
    function unlockMusic() {
        unlockEvents.forEach(ev => document.removeEventListener(ev, unlockMusic, true))
        if (!musicPlaying) return
        music.muted = false
        music.play().catch(() => {})
    }
    unlockEvents.forEach(ev => document.addEventListener(ev, unlockMusic, { capture: true, passive: true }))
})

function launchConfetti() {
    const colors = ['#ff69b4', '#ff1493', '#ff85a2', '#ffb3c1', '#ff0000', '#ff6347', '#fff', '#ffdf00']
    const duration = 6000
    const end = Date.now() + duration

    // Initial big burst
    confetti({
        particleCount: 150,
        spread: 100,
        origin: { x: 0.5, y: 0.3 },
        colors
    })

    // Continuous side cannons
    const interval = setInterval(() => {
        if (Date.now() > end) {
            clearInterval(interval)
            return
        }

        confetti({
            particleCount: 40,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
            colors
        })

        confetti({
            particleCount: 40,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.6 },
            colors
        })
    }, 300)
}

function toggleMusic() {
    const music = document.getElementById('bg-music')
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
