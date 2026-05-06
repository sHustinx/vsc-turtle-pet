import { Spawner } from '../actors/spawner.js';
import { Turtle } from '../actors/turtle.js';

const playGroundElement = document.querySelector('.playground');
const turtleElement = document.getElementById('turtle');
const turtleAnimationElement = document.getElementById('turtleAnimation');
const heartElement = document.getElementById('heart');
const menuButtonElement = document.getElementById('menu-button');
const menuElement = document.getElementById('menu');
const partyButtonElement = document.getElementById('party-button');

// init spawner
const spawner = new Spawner(playGroundElement);

// init turtle
const turtle = new Turtle(turtleElement, turtleAnimationElement, heartElement, mediaUri);

// menu functionality
menuButtonElement.addEventListener('click', () => {
    menuElement.style.display = menuElement.style.display === 'none' ? 'block' : 'none';
});

partyButtonElement.addEventListener('click', () => {
    turtle.enterParty();
    menuElement.style.display = 'none';
});