import { Turtle } from './turtle.js';

const turtle = document.getElementById('turtle');
const heart = document.getElementById('heart');
const menuButton = document.getElementById('menu-button');
const menu = document.getElementById('menu');
const partyButton = document.getElementById('party-button');

// init turtle
const turtleData = new Turtle(turtle, heart, turtleUri, turtleWalking1Uri, turtleWalking2Uri, turtleParty1Uri, turtleParty2Uri, discoBallUri);

// menu functionality
menuButton.addEventListener('click', () => {
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
});

partyButton.addEventListener('click', () => {
    turtleData.enterParty();
    menu.style.display = 'none';
});