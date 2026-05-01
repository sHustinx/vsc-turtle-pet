import { State } from "./state.js";

export class StateParty extends State {
    constructor(turtle) {
        super();
        this.turtle = turtle;
        this.timer = null;
        this.timerDone = false;
        this.isPartying = false;
        this.danceFrame = 1; // current walking frame (1 or 2)
        this.danceInterval = null; // interval for switching frames
    }

    enter() {
        // Only initialize once
        if (this.isPartying) {
            return;
        }
        
        this.isPartying = true;

        // Reset party flag
        this.turtle.onParty = false;
        this.timerDone = false;

        // Replace turtle image with mono-party.png
        //this.turtle.element.src = this.turtle.turtlePartyUri;

        // Show disco ball dropping from ceiling
        this.discoBall = document.createElement('img');
        this.discoBall.src = this.turtle.discoBallUri;
        this.discoBall.className = 'disco-ball enter';
        const playground = document.querySelector('.playground');
        playground.appendChild(this.discoBall);

        // Remove any existing overlay
        const existing = document.getElementById('backgroundOverlay');
        if (existing) existing.remove();

        // add party background
        this.overlay = document.createElement('div');
        this.overlay.id = 'backgroundOverlay';
        this.overlay.className = 'discoOverlay enter';
        playground.appendChild(this.overlay);

        // play transitions
        requestAnimationFrame(() => {
            this.discoBall.classList.remove('enter');
            setTimeout(() => {
                this.overlay.classList.remove('enter');
            }, 500);
        });

        this.danceInterval = setInterval(() => {
            this.danceFrame = this.danceFrame === 1 ? 2 : 1;
            this.turtle.element.src = this.danceFrame === 1 ? this.turtle.turtleParty1Uri : this.turtle.turtleParty2Uri;
        }, 300); // switch every 300ms

        // End party after timer
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.timerDone = true;
        }, 8000);
    }

    perform(stateMachine) {

        // End party after timer expires
        if (this.timerDone) {
            this.timerDone = false;
            stateMachine.setState(this.turtle.previousState || this.turtle.stateRest);
            return null;
        }

        return this;
    }

    exit() {
        this.isPartying = false;
        if (this.timer) { clearTimeout(this.timer); this.timer = null; }
        if (this.danceInterval) {
            clearInterval(this.danceInterval);
            this.danceInterval = null;
        }

        // fade out and remove party props
        if (this.overlay) {
            this.overlay.classList.add('enter'); 
            setTimeout(() => {
                this.overlay.remove();
                this.overlay = null;
            }, 500); 
        }
        if (this.discoBall) {
            const ball = this.discoBall;
            ball.classList.add('exit');
            setTimeout(() => ball.remove(), 800);
            this.discoBall = null;
        }

        // reset turtle image
        this.turtle.element.src = this.turtle.turtleUri;
    }
}