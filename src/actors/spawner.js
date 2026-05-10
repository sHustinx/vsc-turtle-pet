import { Events } from '../events/events.js';
import { StateMachine } from '../stateMachine/statemachine.js';
import { Food } from './spawnables/food.js';

export class Spawner {
    spawnables = new Map();

    constructor(playGroundElement, turtleElement) {
        this.playGroundElement = playGroundElement;
        this.turtleElement = turtleElement;
        this.playGroundElement.onclick = (mouseEvent) => {
            if(mouseEvent.target !== this.playGroundElement) return; // only trigger when clicking directly on playground, not its children (like cabbage)
            this.spawn('food', { mouseEvent });
        };

        this.#initSpawnables();
        //this.initStateMachine();
    }

    #initSpawnables() {
        let containerElement = document.getElementById('spawnables');
        this.addSpawnable(new Food(this, containerElement, 'food'), 1);
    }

    #initStateMachine() {


        this.Statemachine = new StateMachine();
    }

    addSpawnable(spawnable, limit = 1) {
        this.spawnables.set(spawnable.key, { spawnable, limit, active: [], inactive: [ spawnable ] });
    }

    spawn(spawnableKey, data, lifetime = 60000) {
        const spawnableData = this.spawnables.get(spawnableKey);
        if (!spawnableData) return;

        const { prototype, limit, active, inactive } = spawnableData;
        if (active.length >= limit) return;

        const spawnable = 
            inactive.pop() || 
            new prototype.constructor(prototype.containerElement, spawnableKey);
        
        active.push(spawnable);

        if(lifetime > 0) {
            setTimeout(() => {
                this.despawn(spawnable, null);
            }, lifetime);
        }

        spawnable.onSpawn(data);
        Events.trigger('onSpawn', { data: { spawnable, data } });
    }

    despawn(spawnable, data) {
        const spawnableData = this.spawnables.get(spawnable.key);
        if (!spawnableData) return;

        const { active, inactive } = spawnableData;
        const index = active.indexOf(spawnable);
        if (index === -1) return;

        active.splice(index, 1);
        inactive.push(spawnable);

        spawnable.onDespawn(data);
        Events.trigger('onDespawn', { data: { spawnable, data } });
    }
}