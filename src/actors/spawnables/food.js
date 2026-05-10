import { Spawnable } from "../spawnable.js";
import { Events } from "../../events/events.js";

export class Food extends Spawnable {
    icons = ['🥬', '🍎', '🥕', '🌽', '🍇', '🍉'];

    onSpawn(data) {
        this.element.textContent = this.icons[Math.floor(Math.random() * this.icons.length)];
        super.onSpawn(data);
        this.posY = this.floorHeight;
        this.element.style.top = this.posY + 'px';
        Events.trigger('dinnerIsServed', { food: this });
    }
}