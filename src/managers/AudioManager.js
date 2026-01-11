export class AudioManager {
    constructor() {
        this.intro = new Audio('Sounds/intro.mp3');
        this.song = new Audio('Sounds/song.mp3');
        this.success = new Audio('Sounds/success.wav');
        this.song.loop = true;
        
        this.currentSource = null;
        this.isMuted = false;
        
        // Handle transitioning from intro to song
        // Moved to playIntro() to be more efficient
    }

    playIntro(forceRestart = false) {
        if (!forceRestart && (this.currentSource === this.intro || this.currentSource === this.song)) {
            if (!this.currentSource.paused) return; // Already playing
        }

        this.stopAll();
        this.currentSource = this.intro;
        this.intro.currentTime = 0;
        
        // Remove existing listener if any and add a clean one
        this.intro.ontimeupdate = () => {
            if (this.intro.duration > 0 && this.intro.currentTime >= this.intro.duration - 0.5) {
                // Clear listener immediately to prevent multiple triggers
                this.intro.ontimeupdate = null;
                this.intro.pause();
                this.intro.currentTime = 0;
                this.playSong();
            }
        };

        if (!this.isMuted) {
            this.intro.play().catch(err => console.warn("Audio play blocked:", err));
        }
    }

    playSong() {
        this.stopAll();
        // Clear intro listener just in case
        this.intro.ontimeupdate = null;
        
        this.currentSource = this.song;
        this.song.currentTime = 0;
        if (!this.isMuted) {
            this.song.play().catch(err => console.warn("Audio play blocked:", err));
        }
    }

    playSuccess() {
        if (this.isMuted) return;
        // Clone for overlapping sounds if needed, or just reset and play
        this.success.currentTime = 0;
        this.success.play().catch(err => console.warn("Audio play blocked:", err));
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.intro.pause();
            this.song.pause();
        } else {
            if (this.currentSource) {
                this.currentSource.play().catch(err => console.warn("Audio play blocked:", err));
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
