import { Events } from '../Events/events.js';
import { StateMachine } from '../stateMachine/statemachine.js';

export class Spawner {
    constructor(playGroundElement) {
        this.playGroundElement = playGroundElement;
        this.cabbageElement = document.getElementById('cabbage');
        this.playGroundElement.onclick = (mouseEvent) => {
            if(mouseEvent.target !== this.playGroundElement) return; // only trigger when clicking directly on playground, not its children (like cabbage)

            this.showCabbage(mouseEvent);
        };

        //this.initStateMachine();
    }

    initStateMachine() {


        this.Statemachine = new StateMachine();
    }

    showCabbage(mouseEvent) {
        this.cabbageElement.style.left = mouseEvent.clientX + 'px';
        this.cabbageElement.style.top = mouseEvent.clientY + 'px';
        this.cabbageElement.classList.add('show');
        
        setTimeout(() => {
            this.cabbageElement.classList.remove('show');
        }, 500);
    }
}