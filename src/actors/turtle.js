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
        this.size = 1;
        this.baseWidth = 80;

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

        // get new target if turtle is clicked while walking.
        this.stateWalking.addEventTransition('onPet', this.stateWalking);
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

            // position heart above turtle
            const turtleRect = this.element.getBoundingClientRect();
            const heartOffsetY = turtleRect.height * 0.7; // offset heart relative to turtle height
            const heartOffsetX = turtleRect.width * -0.35; // offset heart relative to turtle width, based on look direction

            this.heartElement.style.left = `calc(50% + ${heartOffsetX}px)`;
            this.heartElement.style.top = `-${heartOffsetY}px`;
            this.heartElement.classList.add('show');
            
            setTimeout(() => {
                this.heartElement.classList.remove('show');
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
        
        debugger;
        let inRange = this.isTouching(this.dinner.posX, this.dinner.element.offsetWidth);
        if(inRange) {
            // TODO actually eat it :)
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

    isTouching(posX, marginLeft = 0, marginRight = 0) {
        let leftBounds = this.posX - marginLeft <= posX;
        let rightBounds = this.posX + marginRight + this.getWidth() >= posX;
        return leftBounds && rightBounds;
    }
}