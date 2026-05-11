import { Events } from '../events/events.js';
import { StateMachine } from '../stateMachine/stateMachine.js';
import { StateWalking } from '../stateMachine/turtleMachine/stateWalking.js';
import { StateRest } from '../stateMachine/turtleMachine/stateRest.js';
import { StateParty } from '../stateMachine/turtleMachine/stateParty.js';
import { StateDoNotDisturb } from '../stateMachine/turtleMachine/stateDoNotDisturb.js';
import { PlayGround } from '../webview/webview.js';


export class Turtle {
    constructor(turtle, turtleAnimation, heartElement, mediaUri) {
        this.element = turtle;
        this.animation = turtleAnimation;
        this.heartElement = heartElement;
        this.mediaUri = mediaUri;
        this.turtleUri = `${mediaUri}/mono-standing.png`;
        this.posX = PlayGround.element.offsetWidth / 2;
        this.dirX = 1; // start facing right
        this.baseWidth = 80;
        this.minSize = 0.8;
        this.maxSize = 2;
        this.baseSpeed = 0.05;
        this.setSize(1);

        // set initial position and image
        this.element.style.left = this.posX + 'px';
        this.element.style.bottom = '10%';
        this.element.style.top = 'auto';
        this.element.style.transform = 'scaleX(-1)';

        // onPet on turtle: show heart and wake up to walk somewhere new
        this.element.onclick = (mouseEvent) => {
            if (!this.isClicked(mouseEvent)) return;

            this.showHeart();
            Events.trigger('onPet', { target: this });
        };

        Events.subscribe('dinnerIsServed', (data) => {
            this.dinner = data.food;
        });
        Events.subscribe('onDespawn', (data) => {
            if(this.dinner = data.spawnable) {
                this.dinner = null;
            }
        });

        this.initTurtleMachine();
        this.initGrowth();
    }

    isClicked(mouseEvent) {
        return this.element.contains(mouseEvent.target);
    }

    initTurtleMachine() {
        // init states
        this.stateRest = new StateRest(this);
        this.stateWalking = new StateWalking(this);
        this.stateParty = new StateParty(this);
        this.stateDoNotDisturb = new StateDoNotDisturb(this);

        // start walking after resting for a bit.
        this.stateRest.addTransition(this.stateWalking, (data) => { 
            return this.stateRest.wait === false; 
        });
        // also start walking if turtle is clicked while resting
        this.stateRest.addEventTransition('onPet', this.stateWalking);

        // move towards dinner, when it is served. this only happens when already walking, because the turtle is lazy
        this.stateWalking.addEventTransition('dinnerIsServed', this.stateWalking);
        // eat
        this.stateWalking.addTransition(this.stateRest, (data) => this.tryEatDinner());
        // when reaching destination, rest for a bit.
        this.stateWalking.addTransition(this.stateRest, (data) => {
            return typeof data.dx === 'number' && Math.abs(data.dx) < 1;
        });

        // transitions for do not disturb state
        this.stateRest.addTransition(this.stateDoNotDisturb, () => this.doNotDisturb === true);
        this.stateWalking.addTransition(this.stateDoNotDisturb, () => this.doNotDisturb === true);
        this.stateDoNotDisturb.addTransition(this.stateRest, () => this.stateDoNotDisturb.timerDone);

        // transitions for party state
        this.stateRest.addTransition(this.stateParty, () => this.onParty === true);
        this.stateWalking.addTransition(this.stateParty, () => this.onParty === true);
        this.stateParty.addTransition(this.stateWalking, (data) => this.stateParty.timerDone);

        // init state machine with turtle data
        this.turtleMachine = new StateMachine(this.stateWalking);
        this.turtleMachine.run();
    }

    /**
     * Initializes the growth cycle.
     */
    initGrowth() {
        this.foodValue = 0.5; // How much fat each piece food grants if Mono is size 1.
        this.timeToDigest = 30; // The amount of seconds required, to consume 1 fat.
        this.growthRate = 0.1; // The size increase possible with 1 fat.
        this.fat = 1; // The amount of fat stored at the start of the game.
        this.maxDiet = -1; // The lowest amount of fat possible. Negative fat causes the turtle to shrink.
        this.growthIntervalDuration = 0.1;
        this.totalGrow = 0;

        this.growthInterval = setInterval(() => {
            let fatAvailable = 1 / this.timeToDigest;
            let fatConsumed = fatAvailable * this.growthIntervalDuration;
            this.fat = Math.max(this.fat - fatConsumed, this.maxDiet); // Consume fat.

            let growth = fatConsumed * this.growthRate; // Calculate growth value
            this.setSize(this.size + Math.sign(this.fat) * growth); 
        }, this.growthIntervalDuration * 1000); // Smaller timesteps for smoother transition
    }

    // show heart above turtle, then hide again 
    showHeart() {
        // if pet too much, hide for a bit
        if (!this.doNotDisturb) {
            
            // check for spamming 
            // (but allow during parties)
            if (this.turtleMachine.getState() !== this.stateParty){
                const now = Date.now();
                this.petTimestamps = (this.petTimestamps ?? []).filter(t => now - t < 5000);
                this.petTimestamps.push(now);
                if (this.petTimestamps.length > 8) {
                    this.doNotDisturb = true;
                    this.onParty = false;
                    this.petTimestamps = [];
                    return; // don't show heart
                }
            }

            this.heartFollowInterval = this.heartFollowInterval ?? setInterval(() => {
                // position heart above turtle
                let offsetX = this.element.offsetWidth * (this.dirX < 0 ? 1.1 : -0.1);
                this.heartElement.style.left =  this.posX + offsetX + 'px';
                let offsetY = this.element.offsetHeight * 0.95;
                this.heartElement.style.top = this.element.offsetTop - offsetY + 'px';
                this.heartElement.classList.add('show');
            }, 30);
            
            setTimeout(() => {
                this.heartElement.classList.remove('show');
                clearInterval(this.heartFollowInterval);
                this.heartFollowInterval = null;
            }, 500);
        }
    }

    enterParty() {
        if (this.turtleMachine.getState() === this.stateParty) return; // already partying
        this.onParty = true; 
    }

    tryEatDinner() {
        if(!this.dinner) 
            return false;
        
        let dinnerWidth = this.dinner.element.offsetWidth;
        let inRange = this.isTouching(this.dinner.posX, dinnerWidth * 0.7, -dinnerWidth * 0.4);
        if(inRange) {
            this.fat += (this.foodValue ?? 1) / this.size;
        }

        // cleanup
        if(inRange || PlayGround.isInbounds(this.dinner.posX, this.getWidth())) {
            this.dinner.despawn();
            this.dinner = null;
        }

        return inRange;
    }

    getWidth() {
        return this.baseWidth * this.size;
    }

    setDirection(value) {
        this.dirX = value;
        this.setSize(this.size);
    }

    setSize(value) {
        value = Math.max(Math.min(value, this.maxSize), this.minSize);
        this.size = value;
        this.speed = this.baseSpeed * this.size;
        this.element.style.transform = 'scale(' + (this.size * Math.sign(this.dirX)) + ',' + this.size + ')';
    }

    isTouching(posX, marginLeft = 0, marginRight = 0) {
        let leftBounds = this.posX - marginLeft <= posX;
        let rightBounds = this.posX + marginRight + this.getWidth() >= posX;
        return leftBounds && rightBounds;
    }
}