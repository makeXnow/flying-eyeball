export class AudioManager {
    constructor() {
        // Create audio elements ONCE - they persist across game restarts
        this.intro = new Audio('Sounds/intro.mp3');
        this.song = new Audio('Sounds/song.mp3');
        this.success = new Audio('Sounds/success.wav');
        this.song.loop = true;
        
        this.currentSource = null;
        this.isMuted = false;
        
        // Loading state
        this.introLoaded = false;
        this.songLoaded = false;
        this.introFinishedPlaying = false;
        this.waitingForGesture = false;
        
        // Set up loading listeners
        this.intro.addEventListener('canplaythrough', () => {
            this.introLoaded = true;
            this.tryPlayIntro();
        }, { once: true });
        
        this.song.addEventListener('canplaythrough', () => {
            this.songLoaded = true;
            // If intro already finished, start song now
            if (this.introFinishedPlaying) {
                this.playSong();
            }
        }, { once: true });
        
        // Set up intro end detection (0.5s before actual end)
        this.intro.addEventListener('timeupdate', () => {
            if (this.intro.duration > 0 && this.intro.currentTime >= this.intro.duration - 0.5) {
                this.onIntroFinished();
            }
        });
        
        // Start loading immediately
        this.intro.preload = 'auto';
        this.song.preload = 'auto';
        this.success.preload = 'auto';
        this.intro.load();
        this.song.load();
        this.success.load();
    }

    tryPlayIntro() {
        if (!this.introLoaded || this.isMuted) return;
        
        this.currentSource = this.intro;
        this.intro.currentTime = 0;
        
        const playPromise = this.intro.play();
        if (playPromise) {
            playPromise.catch(err => {
                // Autoplay blocked - wait for user gesture
                console.log("Autoplay blocked, waiting for user gesture");
                this.waitingForGesture = true;
            });
        }
    }

    // Called when user interacts with the page
    onUserGesture() {
        if (this.waitingForGesture && this.introLoaded && !this.isMuted) {
            this.waitingForGesture = false;
            this.intro.play().catch(err => console.warn("Audio play failed:", err));
        }
    }

    onIntroFinished() {
        if (this.introFinishedPlaying) return; // Prevent multiple triggers
        this.introFinishedPlaying = true;
        
        this.intro.pause();
        this.intro.currentTime = 0;
        
        // Play song if it's loaded, otherwise it will play when loaded
        if (this.songLoaded) {
            this.playSong();
        }
    }

    playSong() {
        if (this.isMuted) return;
        
        this.currentSource = this.song;
        this.song.currentTime = 0;
        this.song.play().catch(err => console.warn("Song play failed:", err));
    }

    // Called when "Play Again" is clicked - restart the intro sequence
    restartIntro() {
        this.introFinishedPlaying = false;
        this.song.pause();
        this.song.currentTime = 0;
        
        if (this.introLoaded && !this.isMuted) {
            this.currentSource = this.intro;
            this.intro.currentTime = 0;
            this.intro.play().catch(err => console.warn("Intro play failed:", err));
        }
    }

    playSuccess() {
        if (this.isMuted) return;
        this.success.currentTime = 0;
        this.success.play().catch(err => console.warn("Success sound failed:", err));
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.intro.pause();
            this.song.pause();
        } else {
            // Resume current source
            if (this.currentSource) {
                this.currentSource.play().catch(err => console.warn("Resume failed:", err));
            }
        }
        return this.isMuted;
    }

    stopAll() {
        this.intro.pause();
        this.song.pause();
        this.intro.currentTime = 0;
        this.song.currentTime = 0;
    }
}
