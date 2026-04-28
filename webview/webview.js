import { Turtle } from './turtle.js';

const turtle = document.getElementById('turtle');
const heart = document.getElementById('heart');

// init turtle
const turtleData = new Turtle(turtle, heart, turtleUri, turtleWalking1Uri, turtleWalking2Uri);