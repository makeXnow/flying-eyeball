export class AudioManager {
    constructor() {
        // Create audio elements ONCE - they persist across game restarts
        this.intro = new Audio('Sounds/intro.mp3');
        this.song = new Audio('Sounds/song.mp3');
        this.success = new Audio('Sounds/success.wav');
        this.fail = new Audio('Sounds/fail.wav');
        this.song.loop = true;
        
        this.currentSource = null;
        this.isMuted = false;
        
        // Loading state
        this.introLoaded = false;
        this.songLoaded = false;
        this.introFinishedPlaying = false;
        this.userHasInteracted = false; // Track if user has EVER interacted
        
        // Set up loading listeners
        const logLoad = (name) => console.log(`Audio loaded: ${name}`);
        this.intro.addEventListener('canplaythrough', () => {
            this.introLoaded = true;
            logLoad('intro');
            this.tryPlayIntro();
        }, { once: true });
        
        this.song.addEventListener('canplaythrough', () => {
            this.songLoaded = true;
            logLoad('song');
            // If intro already finished, start song now
            if (this.introFinishedPlaying) {
                this.playSong();
            }
        }, { once: true });

        this.success.addEventListener('canplaythrough', () => logLoad('success'), { once: true });
        this.fail.addEventListener('canplaythrough', () => logLoad('fail'), { once: true });
        
        // Set up intro end detection
        this.intro.addEventListener('ended', () => {
            console.log("Intro ended naturally");
            this.onIntroFinished();
        });

        this.intro.addEventListener('timeupdate', () => {
            if (this.intro.duration > 0 && this.intro.currentTime >= this.intro.duration - 0.5) {
                console.log("Intro finishing (0.5s remaining)");
                this.onIntroFinished();
            }
        });
        
        // Start loading immediately
        this.intro.preload = 'auto';
        this.song.preload = 'auto';
        this.success.preload = 'auto';
        this.fail.preload = 'auto';
        this.intro.load();
        this.song.load();
        this.success.load();
        this.fail.load();
    }

    tryPlayIntro() {
        // We no longer attempt autoplay to avoid "ghost" audio issues
        if (this.isMuted || this.introFinishedPlaying || !this.userHasInteracted) return;
        this.actuallyPlayIntro();
    }

    actuallyPlayIntro() {
        if (this.isMuted) return;
        
        this.currentSource = this.intro;
        this.intro.playbackRate = 1.0; 
        
        // Only reset to 0 if not already playing to avoid "skipping" sound
        if (this.intro.paused) {
            this.intro.currentTime = 0;
        }
        
        this.intro.play().catch(err => console.warn("Intro play failed:", err));
    }

    // Called when user interacts with the page
    onUserGesture() {
        if (this.userHasInteracted) return;
        this.userHasInteracted = true;

        console.log("Audio sequence started by user gesture");
        
        // Prime all sounds to unlock them for the browser
        const sounds = [this.intro, this.song, this.success, this.fail];
        sounds.forEach(sound => {
            const playPromise = sound.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    // Immediately pause and reset everything EXCEPT the intro
                    if (sound !== this.intro || this.introFinishedPlaying) {
                        sound.pause();
                        sound.currentTime = 0;
                    }
                }).catch(err => {
                    console.log(`Initial priming for ${sound.src} failed:`, err);
                });
            }
        });
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
        this.song.playbackRate = 1.0; // Reset to normal speed
        this.song.currentTime = 0;
        this.song.play().catch(err => console.warn("Song play failed:", err));
    }

    // Called when "Play Again" is clicked - restart the intro sequence
    restartIntro() {
        this.introFinishedPlaying = false;
        this.song.pause();
        this.song.currentTime = 0;
        
        if (this.introLoaded && !this.isMuted) {
            this.actuallyPlayIntro();
        }
    }

    playSuccess() {
        if (this.isMuted) return;
        this.success.currentTime = 0;
        this.success.play().catch(err => console.warn("Success sound failed:", err));
    }

    playFail() {
        if (this.isMuted) return;
        this.stopAll(); // Stop music when failing
        this.fail.currentTime = 0;
        this.fail.play().catch(err => console.warn("Fail sound failed:", err));

        // Play the main song at half speed for the Game Over screen
        this.currentSource = this.song;
        this.song.playbackRate = 0.5;
        if ('preservesPitch' in this.song) {
            this.song.preservesPitch = false; // Makes it sound deeper/warped
        } else if ('mozPreservesPitch' in this.song) {
            this.song.mozPreservesPitch = false;
        } else if ('webkitPreservesPitch' in this.song) {
            this.song.webkitPreservesPitch = false;
        }
        
        // Small delay to ensure stopAll() completion and clean playback start
        setTimeout(() => {
            if (!this.isMuted && this.currentSource === this.song) {
                this.song.play().catch(err => console.warn("Game over song failed:", err));
            }
        }, 100);
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
        this.fail.pause();
        this.intro.currentTime = 0;
        this.song.currentTime = 0;
        this.fail.currentTime = 0;
    }

    pause() {
        if (this.currentSource && !this.currentSource.paused) {
            this.currentSource.pause();
        }
    }

    resume() {
        if (this.currentSource && this.currentSource.paused && !this.isMuted) {
            this.currentSource.play().catch(err => console.warn("Resume failed:", err));
        }
    }
}
