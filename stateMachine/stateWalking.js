import { State } from "./state.js";

export class StateWalking extends State {
    constructor(
        turtle
    ) {
        super();
        this.turtle = turtle;
        this.walkFrame = 1; // current walking frame (1 or 2)
        this.walkInterval = null; // interval for switching frames
    }

    enter() {
        // pick new target destination and face towards it
        this.targetX = getRandomTargetX();
        this.turtle.dirX = this.targetX > this.turtle.posX ? 1 : -1;
        this.turtle.element.style.transform = this.turtle.dirX > 0 ? 'scaleX(-1)' : 'scaleX(1)';

        if (this.walkInterval) 
            return; // already animating
        
        this.walkFrame = 1;
        this.turtle.element.src = this.turtle.turtleWalking1Uri;
        
        this.walkInterval = setInterval(() => {
            this.walkFrame = this.walkFrame === 1 ? 2 : 1;
            this.turtle.element.src = this.walkFrame === 1 ? this.turtle.turtleWalking1Uri : this.turtle.turtleWalking2Uri;
        }, 300); // switch every 300ms
    }

    exit() {
        if (this.walkInterval) {
            clearInterval(this.walkInterval);
            this.walkInterval = null;
        }
        this.turtle.element.src = this.turtle.turtleUri;
        this.turtle.posX = this.targetX;
        this.turtle.element.style.left = this.turtle.posX + '%';
    }

    perform(stateMachine) {        
        let speed = 0.05;
        this.turtle.dx = this.targetX - this.turtle.posX; // distance to target
        
        let nextState = this.checkTransitions(this.turtle);
        if (nextState) {
            stateMachine.setState(nextState);
            return;
        }
        
        // move towards target
        this.turtle.posX += Math.sign(this.turtle.dx) * speed;
        this.turtle.element.style.left = this.turtle.posX + '%';

        return this;
    }
}