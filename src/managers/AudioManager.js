const AudioState = {
    IDLE: 'idle',
    INTRO: 'intro',
    PLAYING: 'playing',
    GAME_OVER: 'gameover'
};

/**
 * HYBRID AudioManager
 * - HTML5 Audio for music (reliable on mobile)
 * - Web Audio API for sound effects (no lag)
 */
export class AudioManager {
    constructor() {
        this.state = AudioState.IDLE;
        this.isMuted = false;
        
        // HTML5 Audio for music only
        this.intro = new Audio('Sounds/intro.mp3');
        this.song = new Audio('Sounds/song.mp3');
        this.song.loop = true;
        this.intro.preload = 'auto';
        this.song.preload = 'auto';
        this.intro.load();
        this.song.load();

        // Web Audio API for sound effects (no lag)
        this.ctx = null;
        this.gainNode = null;
        this.effectBuffers = {};
        this.effectsReady = false;
        
        // Set up intro end detection
        this.intro.addEventListener('timeupdate', () => {
            if (this.state === AudioState.INTRO && 
                this.intro.duration > 0 && 
                this.intro.currentTime >= this.intro.duration - 0.5) {
                this.onIntroFinished();
            }
        });

        this.intro.addEventListener('ended', () => {
            this.onIntroFinished();
        });
    }

    /**
     * Initialize and unlock Web Audio - called during user gesture
     */
    async initWebAudio() {
        if (this.ctx) return;

        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContextClass();
            this.gainNode = this.ctx.createGain();
            this.gainNode.connect(this.ctx.destination);

            // Aggressively try to resume
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
                
                // Silent buffer trick
                const buffer = this.ctx.createBuffer(1, 1, 22050);
                const source = this.ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(this.ctx.destination);
                source.start(0);
            }

            // Start loading effects immediately
            await this.loadEffects();

        } catch (e) {
            console.warn('WebAudio init failed:', e);
        }
    }

    async loadEffects() {
        if (!this.ctx) return;

        const manifest = {
            fail: 'Sounds/fail.wav',
            success: 'Sounds/success.wav',
            success_cherry: 'Sounds/success_cherry.wav',
            success_blueberry: 'Sounds/success_blueberry.mp3'
        };

        const loadPromises = Object.entries(manifest).map(async ([name, url]) => {
            try {
                const response = await fetch(url);
                const arrayBuffer = await response.arrayBuffer();
                const decoded = await new Promise((resolve, reject) => {
                    this.ctx.decodeAudioData(arrayBuffer, resolve, reject);
                });
                this.effectBuffers[name] = decoded;
            } catch (e) {
                console.warn(`Effect load failed: ${name}`, e);
            }
        });

        await Promise.all(loadPromises);
        this.effectsReady = true;
    }

    /**
     * Play a sound effect using Web Audio (no lag!)
     */
    playEffect(name) {
        if (this.isMuted || !this.ctx || !this.effectBuffers[name]) return;

        // Try to resume if still suspended
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        // Only play if context is running
        if (this.ctx.state !== 'running') return;

        try {
            const source = this.ctx.createBufferSource();
            source.buffer = this.effectBuffers[name];
            source.connect(this.gainNode);
            source.start(0);
        } catch (e) {
            console.warn(`Effect play error: ${name}`, e);
        }
    }

    /**
     * Start playing - unlocks HTML5 Audio AND initializes Web Audio
     */
    start() {
        this.state = AudioState.INTRO;

        // Initialize Web Audio for effects (async, but start it now)
        this.initWebAudio();

        if (this.isMuted) return;

        // Unlock HTML5 Audio elements by playing them briefly at volume 0
        [this.intro, this.song].forEach(audio => {
            const vol = audio.volume;
            audio.volume = 0;
            audio.play().then(() => {
                if (audio !== this.intro) {
                    audio.pause();
                    audio.currentTime = 0;
                }
                audio.volume = vol;
            }).catch(() => {
                audio.volume = vol;
            });
        });

        // Start intro properly
        this.intro.volume = 1;
        this.intro.currentTime = 0;
        this.intro.play().catch(err => console.warn('Intro play failed:', err));

        // Keep trying to resume Web Audio context
        this.startContextResumeLoop();
    }

    /**
     * Periodically try to resume the Web Audio context until it's running
     */
    startContextResumeLoop() {
        const tryResume = () => {
            if (!this.ctx) return;
            if (this.ctx.state === 'running') return;
            
            this.ctx.resume();
            setTimeout(tryResume, 100);
        };
        tryResume();
    }

    onIntroFinished() {
        if (this.state !== AudioState.INTRO) return;
        this.state = AudioState.PLAYING;
        this.playSongNormal();
    }

    playSongNormal() {
        if (this.isMuted) return;
        this.song.playbackRate = 1.0;
        if ('preservesPitch' in this.song) this.song.preservesPitch = true;
        this.song.currentTime = 0;
        this.song.play().catch(() => {});
    }

    playSongSlow() {
        if (this.isMuted) return;
        this.song.playbackRate = 0.5;
        if ('preservesPitch' in this.song) this.song.preservesPitch = false;
        this.song.currentTime = 0;
        this.song.play().catch(() => {});
    }

    playFail() {
        this.state = AudioState.GAME_OVER;
        this.intro.pause();
        this.song.pause();
        this.playEffect('fail');
        setTimeout(() => {
            if (this.state === AudioState.GAME_OVER) {
                this.playSongSlow();
            }
        }, 100);
    }

    playSuccess(emoji = null) {
        let name = 'success';
        if (emoji === '🍒') name = 'success_cherry';
        else if (emoji === '🫐') name = 'success_blueberry';
        this.playEffect(name);
    }

    restartIntro() {
        this.intro.pause();
        this.intro.currentTime = 0;
        this.song.pause();
        this.song.currentTime = 0;
        this.state = AudioState.INTRO;
        if (this.isMuted) return;
        this.intro.play().catch(() => {});
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.intro.pause();
            this.song.pause();
            if (this.gainNode && this.ctx) {
                this.gainNode.gain.setTargetAtTime(0, this.ctx.currentTime, 0.02);
            }
        } else {
            if (this.state === AudioState.INTRO) {
                this.intro.play().catch(() => {});
            } else if (this.state === AudioState.PLAYING || this.state === AudioState.GAME_OVER) {
                this.song.play().catch(() => {});
            }
            if (this.gainNode && this.ctx) {
                this.gainNode.gain.setTargetAtTime(1, this.ctx.currentTime, 0.02);
            }
        }
        return this.isMuted;
    }

    pause() {
        if (this.state === AudioState.INTRO) this.intro.pause();
        else this.song.pause();
    }

    resume() {
        if (this.isMuted) return;
        if (this.state === AudioState.INTRO) this.intro.play().catch(() => {});
        else if (this.state === AudioState.PLAYING || this.state === AudioState.GAME_OVER) {
            this.song.play().catch(() => {});
        }
    }

    stopAll() {
        this.intro.pause();
        this.intro.currentTime = 0;
        this.song.pause();
        this.song.currentTime = 0;
        this.state = AudioState.IDLE;
    }

    unlock() {} // Compatibility
}
