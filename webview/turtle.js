import {StateMachine} from '../stateMachine/stateMachine.js';
import {StateWalking} from '../stateMachine/stateWalking.js';
import {StateRest} from '../stateMachine/stateRest.js';
import {StateParty} from '../stateMachine/stateParty.js';

export class Turtle {
    constructor(turtleElement, heartElement, turtleUri, turtleWalking1Uri, turtleWalking2Uri, turtleParty1Uri, turtleParty2Uri, discoBallUri) {
        this.element = turtleElement;
        this.heartElement = heartElement;
        this.turtleUri = turtleUri;
        this.turtleWalking1Uri = turtleWalking1Uri;
        this.turtleWalking2Uri = turtleWalking2Uri;
        this.turtleParty1Uri = turtleParty1Uri;
        this.turtleParty2Uri = turtleParty2Uri;
        this.discoBallUri = discoBallUri;
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
            this.onClick = true; 
        };

        // init states
        this.stateRest = new StateRest(this);
        this.stateWalking = new StateWalking(this);
        this.stateParty = new StateParty(this);

        // define transitions
        this.stateRest.addTransition(this.stateWalking, (data) => { 
            if (data.onClick) {
                data.onClick = false;
                return true;
            }
            
            return this.stateRest.wait === false; 
        });
        this.stateWalking.addTransition(this.stateRest, (data) => {
            // if desination reached, rest then pick new target destnation
            return typeof data.dx === 'number' && Math.abs(data.dx) < 1;
        });
        this.stateWalking.addTransition(null, (data) => {
            if (data.onClick) {
                this.stateWalking.targetX = data.posX; // stop in place
                data.onClick = false; 
                return true; 
            }
        });

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