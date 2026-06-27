let musicPlaying = false

window.addEventListener('load', () => {
    // Set up music FIRST. The confetti library loads from a CDN; if that ever
    // fails to load, the thrown error must not stop the music from working.
    setupMusic()
    try {
        launchConfetti()
    } catch (e) {
        // Confetti is decorative — ignore if the CDN didn't load.
    }
})

function setupMusic() {
    const music = document.getElementById('bg-music')
    music.volume = 0.3
    musicPlaying = true
    document.getElementById('music-toggle').textContent = '🔊'

    // A page navigation does NOT carry a user gesture, so mobile blocks autoplay.
    // Start the music on the first interaction. We keep listening until play()
    // actually succeeds, so a failed first attempt retries on the next gesture.
    const events = ['pointerdown', 'touchend', 'click', 'keydown']
    function start() {
        if (!musicPlaying) { stopListening(); return }
        music.muted = false
        music.play().then(stopListening).catch(() => {})
    }
    function stopListening() {
        events.forEach(ev => document.removeEventListener(ev, start, true))
    }
    events.forEach(ev => document.addEventListener(ev, start, { capture: true, passive: true }))

    // Desktop may allow immediate playback; harmless if it's blocked.
    music.muted = false
    music.play().catch(() => {})
}

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
