import { State } from "./state.js";

export class StateMachine {
    constructor(currentState) {
        this.isValidState(currentState);
        this.currentState = currentState;
    }

    isValidState(state) {
        if(!(state instanceof State))
            throw new Error("Invalid state: must be an instance of State.");

        return true;
    }

    setState(state, bForce = false) {
        if(state === this.currentState) 
            return false; // No change needed

        this.isValidState(state);

        if(!bForce && this.currentState && !this.currentState.getTransitions().includes(state))
            return false; // Transition not allowed

        this.nextState = state;
        return true;
    }

    getState() {
        return this.currentState;
    }

    run() {
        // Transition to next state if set.
        if (this.nextState) {
            this.currentState = this.nextState;
            this.nextState = null;
        }

        if (!this.currentState) {
            throw new Error("Turtle.exe has stopped working.");
        }

        this.currentState.enter();
        this.nextState = this.currentState.perform(this);
        this.currentState.exit();
        this.currentState = null; // Clear current state after performing

        requestAnimationFrame(() => this.step());
    }

    step() {
        if (this.currentState === null) {
            throw new Error("Turtle.exe has stopped working.");
        }

        targetState = this.currentState.perform(this);

        if(this.nextState) {
            return this.nextState; // if a forced state is set, transition to it immediately
        }

        if (targetState !== this.currentState) {
            return targetState;
        }

        requestAnimationFrame(() => this.step());
    }
}