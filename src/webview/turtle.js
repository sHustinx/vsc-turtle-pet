import { Events } from '../events/events.js';
import {StateMachine} from '../stateMachine/stateMachine.js';
import {StateWalking} from '../stateMachine/stateWalking.js';
import {StateRest} from '../stateMachine/stateRest.js';
import {StateParty} from '../stateMachine/stateParty.js';

export class Turtle {
    constructor(turtleElement, heartElement, mediaUri) {
        this.element = turtleElement;
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

        // onclick on turtle: show heart and wake up to walk somewhere new
        this.element.onclick = () => {
            this.showHeart();
            Events.trigger('onClick', { target: this });
        };

        // init states
        this.stateRest = new StateRest(this);
        this.stateWalking = new StateWalking(this);
        this.stateParty = new StateParty(this);

        // start walking after resting for a bit.
        this.stateRest.addTransition(this.stateWalking, (data) => { 
            return this.stateRest.wait === false; 
        });
        // also start walking if turtle is clicked while resting
        this.stateRest.addEventTransition('onClick', this.stateWalking);

        // when reaching destination, rest for a bit.
        this.stateWalking.addTransition(this.stateRest, (data) => {
            return typeof data.dx === 'number' && Math.abs(data.dx) < 1;
        });
        // get new target if turtle is clicked while walking.
        this.stateWalking.addEventTransition('onClick', this.stateWalking);

        // transitions for party state
        this.stateRest.addTransition(this.stateParty, (data) => data.onParty);
        this.stateWalking.addTransition(this.stateParty, (data) => data.onParty);
        this.stateParty.addTransition(this.stateRest, () => true);
        this.stateParty.addTransition(this.stateWalking, () => true);

        // init state machine with turtle data
        this.turtleMachine = new StateMachine(this.stateWalking);
        this.turtleMachine.run();
    }

    // show heart above turtle, then hide again 
    showHeart() {
        this.heartElement.style.left = this.element.style.left;
        this.heartElement.style.bottom = '30%';
        this.heartElement.classList.add('show');
        
        setTimeout(() => {
            this.heartElement.classList.remove('show');
        }, 500);
    }

    enterParty() {
        this.previousState = this.turtleMachine.getState();
        this.onParty = true;
    }
}