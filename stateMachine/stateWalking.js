import { State } from "./state.js";

export class StateWalking extends State {
    constructor(
        turtle
    ) {
        super();
        this.turtle = turtle;
        this.walkFrame = 1; // current walking frame (1 or 2)
        this.walkInterval = null; // interval for switching frames
        this.turtleWalking1Uri = `${turtle.mediaUri}/mono-walking-1.png`;
        this.turtleWalking2Uri = `${turtle.mediaUri}/mono-walking-2.png`;
    }

    enter() {
        // pick new target destination and face towards it
        this.targetX = this.getRandomTargetX();
        this.turtle.dirX = this.targetX > this.turtle.posX ? 1 : -1;
        this.turtle.element.style.transform = this.turtle.dirX > 0 ? 'scaleX(-1)' : 'scaleX(1)';

        if (this.walkInterval) 
            return; // already animating
        
        this.walkFrame = 1;
        this.turtle.element.src = this.turtleWalking1Uri;
        
        this.walkInterval = setInterval(() => {
            this.walkFrame = this.walkFrame === 1 ? 2 : 1;
            this.turtle.element.src = this.walkFrame === 1 ? this.turtleWalking1Uri : this.turtleWalking2Uri;
        }, 300); // switch every 300ms
    }

    exit() {
        if (this.walkInterval) {
            clearInterval(this.walkInterval);
            this.walkInterval = null;
        }
        this.turtle.element.src = this.turtle.turtleUri;

        // Only finalize position if we've reached the target
        if (typeof this.turtle.dx === 'number' && Math.abs(this.turtle.dx) < 1) {
            this.turtle.posX = this.targetX;
            this.turtle.element.style.left = this.turtle.posX + '%';
        }
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

    // get random target X position, accounting for turtle png width (80px)
    // (otherwise he walks off the screen)
    getRandomTargetX() {
        const containerWidth = document.querySelector('.playground').offsetWidth;
        const turtleWidth = 80;
        const maxX = ((containerWidth - turtleWidth) / containerWidth) * 100; 
        const newTarget = 10 + (Math.random() * (maxX - 10));
        // console.log('getRandomTargetX:', newTarget, 'posX:', posX);
        return newTarget;
    }
}