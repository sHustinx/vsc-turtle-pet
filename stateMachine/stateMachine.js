import { State } from "./state.js";

export class StateMachine {
    constructor(initialState) {
        this.isValidState(initialState);
        this.currentState = initialState;
        this.nextState = null;
        this.isFresh = true; // flag to indicate if the machine has just started
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
        if(this.isFresh) {
            this.currentState?.enter();
            this.isFresh = false;
        } else if (this.nextState && this.nextState !== this.currentState) { 
            this.currentState?.exit();
            this.nextState.enter();
            this.currentState = this.nextState;
            this.nextState = null;
        }

        this.nextState = this.step();

        // self transition
        if(!this.nextState) {
            this.currentState.exit();
            this.currentState.enter();
        }
        
        requestAnimationFrame(() => this.run());
    }

    step() {
        if (this.currentState === null) {
            throw new Error("Turtle.exe has stopped working.");
        }

        let targetState = this.currentState.perform(this);

        if(this.nextState && this.nextState !== this.currentState) {
            return this.nextState; // if a forced state is set, transition to it immediately
        }

        return targetState; // otherwise transition to the state returned by perform (if any)
    }
}