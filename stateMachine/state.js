import { StateMachine } from "./stateMachine.js";

export class State {
    constructor() {
        this.transitions = [];
        this.conditions = [];
    }

    enter() {

    }

    exit() {
        
    }

    perform(stateMachine) {
        
    }

    addTransition(state, condition) {
        if (!this.transitions.includes(state)) {
            this.transitions.push(state);
            this.conditions.push(condition);
        }
    }

    getTransitions() {
        return this.transitions;
    }

    getConditions() {
        return this.conditions;
    }

    checkTransitions(data) {
        for (let i = 0; i < this.transitions.length; i++) {
            if (this.conditions[i](data)) {
                return this.transitions[i];
            }
        }

        return null;
    }
}