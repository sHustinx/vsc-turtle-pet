import { StateMachine } from "./stateMachine.js";
import { Events } from "../events/events.js";

export class State {
    constructor() {
        this.transitions = [];
        this.eventTransitions = [];
        this.eventTriggers = [];
    }

    /**
     * INTERNAL do not override or call directly. Use enter() instead.
     */
    enterInternal() {
        this.eventTransitions.forEach(([event, state]) => {
            Events.subscribe(event, (data) => {
                this.debugger = true; // trigger debugger on event transition for easier debugging
                this.eventTriggers.push(event);
            });
        });

        this.enter();
    }

    /**
     * Enter is called ONCE whenever the state is entered. Use this for initialization and setup.
     * You don't have to track, whether this state is already running, since the state machine will handle that.
     */
    enter() {

    }

    /**
     * INTERNAL do not override or call directly. Use exit() instead.
     */
    exitInternal() {
        this.eventTransitions.forEach(([event, state]) => {
            Events.unsubscribe(event, (data) => {
                this.eventTriggers.push(event);
            });
        }); 

        this.exit();
    }

    /**
     * Exit is called ONCE whenever the state is exited. Use this for cleanup and teardown.
     * You don't have to track, whether this state is already running, since the state machine will handle that.
     */
    exit() {
        
    }

    /**
     * Perform is called every frame while the state is active. Use this for continuous behavior.
     * Remember to check your transitions in this method and return the state to transition to if a transition condition is met.
     * 
     * @return the next state to transition to, or NULL to stay in the current state.
     */
    perform(stateMachine) {
        
    }

    /**
     * Add a transition that is triggered by an event. This is often more convenient than adding a regular transition.
     * Transitions are checked in order.
     */
    addEventTransition(event, state) {
        if(this.eventTransitions.includes([event, state]))
            return;

        this.eventTransitions.push([event, state]);
        this.addTransition(state, (data) => this.eventTriggers.includes(event));
    }

    /**
     * Add a transition to another state. If the condition evaluates to TRUE, the condiition applies. 
     * Transitions are checked in order.
     */
    addTransition(state, condition) {
        if (!this.transitions.includes([state, condition])) {
            this.transitions.push([state, condition]);
        }
    }

    getTransitions() {
        return this.transitions;
    }

    getConditions() {
        return this.conditions;
    }

    /**
     * Checks all transitions and returns the first valid state to transition to.
     * Returns NULL if no transition was valid. Transitions are checked in order.
     */
    checkTransitions(data) {
        let result = null;

        for (const [state, condition] of this.transitions) {
            if (condition(data)) {
                result = state;
                break;
            }
        }

        this.eventTriggers = []; // reset event triggers after checking transitions
        return result;
    }
}