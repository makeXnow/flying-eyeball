import { JOYSTICK_RADIUS } from '../core/constants.js';

export class InputManager {
    constructor(canvas, joystickEl, knobEl) {
        this.canvas = canvas;
        this.joystickEl = joystickEl;
        this.knobEl = knobEl;
        
        this.state = {
            active: false,
            startX: 0,
            startY: 0,
            currX: 0,
            currY: 0
        };

        this.gameActive = false;
        this.unit = 1;

        this.setupEventListeners();
    }

    setUnit(unit) {
        this.unit = unit;
    }

    setGameActive(active) {
        this.gameActive = active;
    }

    getState() {
        return this.state;
    }

    setupEventListeners() {
        // Mouse events
        window.addEventListener('mousedown', (e) => this.handleStart(e));
        window.addEventListener('mousemove', (e) => this.handleMove(e));
        window.addEventListener('mouseup', () => this.handleEnd());

        // Touch events
        window.addEventListener('touchstart', (e) => {
            // Only prevent default if we're actually starting a joystick interaction
            if (this.gameActive) {
                e.preventDefault();
                this.handleStart(e.touches[0]);
            }
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            if (this.state.active) {
                e.preventDefault();
                this.handleMove(e.touches[0]);
            }
        }, { passive: false });

        window.addEventListener('touchend', () => this.handleEnd());
    }

    handleStart(e) {
        if (!this.gameActive) return;

        const x = e.clientX;
        const y = e.clientY;

        this.state.active = true;
        this.state.startX = x;
        this.state.startY = y;
        this.state.currX = x;
        this.state.currY = y;

        this.showJoystick(x, y);
    }

    handleMove(e) {
        if (!this.state.active) return;

        this.state.currX = e.clientX;
        this.state.currY = e.clientY;

        this.updateKnobPosition();
    }

    handleEnd() {
        this.state.active = false;
        this.hideJoystick();
    }

    showJoystick(x, y) {
        const joystickSize = JOYSTICK_RADIUS * this.unit;
        this.joystickEl.style.display = 'block';
        this.joystickEl.style.left = `${x - joystickSize}px`;
        this.joystickEl.style.top = `${y - joystickSize}px`;
    }

    hideJoystick() {
        this.joystickEl.style.display = 'none';
    }

    updateKnobPosition() {
        const dx = this.state.currX - this.state.startX;
        const dy = this.state.currY - this.state.startY;
        const maxDist = JOYSTICK_RADIUS * this.unit;
        const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxDist);
        const angle = Math.atan2(dy, dx);

        const knobX = Math.cos(angle) * dist;
        const knobY = Math.sin(angle) * dist;

        this.knobEl.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;
    }

    reset() {
        this.state.active = false;
        this.state.startX = 0;
        this.state.startY = 0;
        this.state.currX = 0;
        this.state.currY = 0;
        this.hideJoystick();
    }
}
