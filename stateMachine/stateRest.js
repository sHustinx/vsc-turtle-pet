import { State } from "./state.js";

export class StateRest extends State {
    constructor(turtle) {
        super();
        this.turtle = turtle;
    }

    enter() {
        // clear any pending timeouts/start new one
        if (this.turtle.moveTimeout) 
            clearTimeout(this.turtle.moveTimeout);

        this.turtle.moveTimeout = setTimeout(() => { this.wait = false;}, 10000 + Math.random() * 5000);
        this.wait = true;
    }

    perform(stateMachine) {
        let nextState = this.checkTransitions(this.turtle);
        if (nextState) {
            stateMachine.setState(nextState);
            return;
        }

        if(this.wait)
            return this; 

        return null;
    }

    exit() {
        this.wait = false;
        if(this.turtle.moveTimeout)
            clearTimeout(this.turtle.moveTimeout);
    }
}