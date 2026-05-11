import { State } from "../state.js";
import { Spawner } from "../../actors/spawner.js";
import { PlayGround } from "../../webview/webview.js";

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
        this.targetX = this.getWalkingTargetX();
        this.turtle.setDirection(this.targetX > this.turtle.posX ? -1 : 1);

        if (this.walkInterval) 
            return; // already animating
        
        this.walkFrame = 1;
        this.turtle.animation.src = this.turtleWalking1Uri;
        
        this.walkInterval = setInterval(() => {
            this.walkFrame = this.walkFrame === 1 ? 2 : 1;
            this.turtle.animation.src = this.walkFrame === 1 ? this.turtleWalking1Uri : this.turtleWalking2Uri;
        }, 300); // switch every 300ms
    }

    exit() {
        if (this.walkInterval) {
            clearInterval(this.walkInterval);
            this.walkInterval = null;
        }
        this.turtle.animation.src = this.turtle.turtleUri;

        // Only finalize position if we've reached the target
        if (typeof this.turtle.dx === 'number' && Math.abs(this.turtle.dx) < 1) {
            this.turtle.posX += this.turtle.dx;
            this.turtle.element.style.left = this.turtle.posX + 'px';
        }
    }

    perform(stateMachine) {
        let speed = PlayGround.element.offsetWidth * 0.0005;
        this.turtle.dx = this.targetX - this.turtle.posX; // distance to target
        let moveX = this.turtle.posX + Math.sign(this.turtle.dx) * speed;

        if(!PlayGround.isInbounds(moveX, 10, this.turtle.getWidth())) {
            // stop at edges
            this.turtle.dx = 0; 
        } else {
            // move towards target
            this.turtle.posX = moveX;
            this.turtle.element.style.left = this.turtle.posX + 'px';
        }

        let nextState = this.checkTransitions(this.turtle);
        if (nextState) {
            return nextState;
        }

        return null;
    }

    // get walking target X position, accounting for turtle width
    // (otherwise he walks off the screen)
    getWalkingTargetX() {
        let dinner = this.turtle.dinner;
        if(dinner) {
            return dinner.posX;
        } else {
            return 10 + (Math.random() * (PlayGround.getHorizontalLimit(20)));
        }
    }
}