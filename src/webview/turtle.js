import { Events } from '../events/events.js';
import {StateMachine} from '../stateMachine/stateMachine.js';
import {StateWalking} from '../stateMachine/turtleMachine/stateWalking.js';
import {StateRest} from '../stateMachine/turtleMachine/stateRest.js';
import {StateParty} from '../stateMachine/turtleMachine/stateParty.js';

export class Turtle {
    constructor(turtle, turtleAnimation, heartElement, mediaUri) {
        this.element = turtle;
        this.animation = turtleAnimation;
        this.heartElement = heartElement;
        this.mediaUri = mediaUri;
        this.turtleUri = `${mediaUri}/mono-standing.png`;
        this.posX = 50; // start in middle
        this.dirX = 1; // start facing right

        // set initial position and image
        this.element.style.left = this.posX + '%';
        this.element.style.bottom = '10%';
        this.element.style.top = 'auto';
        this.element.style.transform = 'scaleX(-1)';

        // onPet on turtle: show heart and wake up to walk somewhere new
        this.element.onclick = () => {
            this.showHeart();
            Events.trigger('onPet', { target: this });
        };

        this.initTurtleMachine();
    }

    initTurtleMachine() {
        // init states
        this.stateRest = new StateRest(this);
        this.stateWalking = new StateWalking(this);
        this.stateParty = new StateParty(this);

        // start walking after resting for a bit.
        this.stateRest.addTransition(this.stateWalking, (data) => { 
            return this.stateRest.wait === false; 
        });
        // also start walking if turtle is clicked while resting
        this.stateRest.addEventTransition('onPet', this.stateWalking);

        // when reaching destination, rest for a bit.
        this.stateWalking.addTransition(this.stateRest, (data) => {
            return typeof data.dx === 'number' && Math.abs(data.dx) < 1;
        });
        // get new target if turtle is clicked while walking.
        this.stateWalking.addEventTransition('onPet', this.stateWalking);

        // transitions for party state
        this.stateRest.addEventTransition('onParty', this.stateParty);
        this.stateWalking.addEventTransition('onParty', this.stateParty);
        this.stateParty.addTransition(this.stateWalking, (data) => this.stateParty.timerDone);

        // init state machine with turtle data
        this.turtleMachine = new StateMachine(this.stateWalking);
        this.turtleMachine.run();
    }

    // show heart above turtle, then hide again 
    showHeart() {
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

    enterParty() {
        this.previousState = this.turtleMachine.getState();
        Events.trigger('onParty', { target: this });
    }
}