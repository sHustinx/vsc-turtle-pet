import { PlayGround } from "../webview/webview.js";

export class Spawnable {
    constructor(spawner, containerElement, key) {
        this.spawner = spawner;
        this.containerElement = containerElement;
        this.element = this.#createElement(containerElement);
        this.key = key;
    }

    #createElement(containerElement) {
        let element = document.createElement('div');
        element.classList.add('spawnable');
        containerElement.appendChild(element);

        return element;
    }

    despawn(data) {
        this.spawner.despawn(this, data);
    }

    onSpawn(data) {
        this.#show(data.mouseEvent);
    }

    onDespawn(data) {
        this.#hide();
    }

    #show(mouseEvent) {   
        this.floorHeight = PlayGround.getFloorHeight() - this.element.offsetHeight;     
        this.posY = Math.min(this.floorHeight, mouseEvent.clientY - this.element.offsetHeight / 2);
        this.posX = mouseEvent.clientX - this.element.offsetWidth / 2;
        this.element.style.top = this.posY + 'px';
        this.element.style.left = this.posX + 'px';

        this.element.classList.add('show');
    }

    #hide() {
        this.element.classList.remove('show');
    }
}