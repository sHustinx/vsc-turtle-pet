import { State } from "../state.js";

export class StateDoNotDisturb extends State {
    constructor(turtle) {
        super();
        this.turtle = turtle;
        this.timer = null;
        this.timerDone = false;
        this.turtleHide1Uri = `${turtle.mediaUri}/mono-hiding-1.png`;
        this.turtleHide2Uri = `${turtle.mediaUri}/mono-hiding-2.png`;
    }

    enter() {
        this.timerDone = false;

        // mono hiding
        this.turtle.animation.src = this.turtleHide2Uri;

        // for 4 seconds
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.timerDone = true;
        }, 4000);
    }

    perform(stateMachine) {
        return this.checkTransitions(this.turtle) ?? null;
    }

    exit() {
        this.turtle.doNotDisturb = false;
        if (this.timer) { clearTimeout(this.timer); this.timer = null; }
        this.turtle.animation.src = this.turtle.turtleUri;
    }
}