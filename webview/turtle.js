import {StateMachine} from '../stateMachine/stateMachine.js';
import {StateWalking} from '../stateMachine/stateWalking.js';
import {StateRest} from '../stateMachine/stateRest.js';

export class Turtle {
    constructor(turtleElement, heartElement, turtleUri, turtleWalking1Uri, turtleWalking2Uri) {
        debugger;
        this.element = turtleElement;
        this.heartElement = heartElement;
        this.turtleUri = turtleUri;
        this.turtleWalking1Uri = turtleWalking1Uri;
        this.turtleWalking2Uri = turtleWalking2Uri;
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

        // state rest
        this.stateRest = new StateRest(this);
        this.stateRest.addTransition(this.stateWalking, (data) => { 
            return this.wait === false; 
        });

        // state walking
        this.stateWalking = new StateWalking(this);
        this.stateWalking.addTransition(this.stateRest, (data) => {
            if (data.onClick)
                return true; // if clicked while walking, transition to rest

            if(!isnumber(data.dx))
                return false;

            // if desination reached, rest then pick new target destnation
            return Math.abs(data.dx) < 1;
        });

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
}