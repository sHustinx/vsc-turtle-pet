const turtle = document.getElementById('turtle');
const heart = document.getElementById('heart');

// init turtle
// start at 50%, facing right
let posX = 50;
let dirX = 1;
let targetX = null;
turtle.style.left = posX + '%';
turtle.style.bottom = '10%';
turtle.style.top = 'auto';
turtle.style.transform = 'scaleX(-1)';
let state = 'rest'; // movement state: either rest or walking
let walkFrame = 1; // current walking frame (1 or 2)
let walkInterval = null; // interval for switching frames
let moveTimeout = null; // timeout for next movement

// flip turtle png direction towards target
function updatePngDirection() {
    dirX = targetX > posX ? 1 : -1;
    turtle.style.transform = dirX > 0 ? 'scaleX(-1)' : 'scaleX(1)';
}

function startWalkingAnimation() {
    if (walkInterval) return; // already animating
    walkFrame = 1;
    turtle.src = turtleWalking1Uri;
    walkInterval = setInterval(() => {
        walkFrame = walkFrame === 1 ? 2 : 1;
        turtle.src = walkFrame === 1 ? turtleWalking1Uri : turtleWalking2Uri;
    }, 300); // switch every 300ms
}

function stopWalkingAnimation() {
    if (walkInterval) {
        clearInterval(walkInterval);
        walkInterval = null;
    }
    turtle.src = turtleUri;
}

function moveTurtle() {
    if (state === 'rest') return;
    
    startWalkingAnimation();
    
    const speed = 0.05;
    const dx = targetX - posX; // distance to target
    
    // if desination reached, rest then pick new target destnation
    if (Math.abs(dx) < 1) {
        posX = targetX;
        turtle.style.left = posX + '%';
        state = 'rest';
        stopWalkingAnimation();
        // clear any pending timeouts/start new one
        if (moveTimeout) clearTimeout(moveTimeout);
        moveTimeout = setTimeout(initMovement, 10000 + Math.random() * 5000);
        return;
    }
    
    // move towards target
    posX += Math.sign(dx) * speed;
    turtle.style.left = posX + '%';
    
    requestAnimationFrame(moveTurtle);
}

// show heart above turtle, then hide again 
function showHeart() {
    heart.style.left = turtle.style.left;
    heart.style.bottom = '30%';
    heart.classList.add('show');
    
    setTimeout(() => {
        heart.classList.remove('show');
    }, 500);
}

// get random target X position, accounting for turtle png width (80px)
// (otherwise he walks off the screen)
function getRandomTargetX() {
    const containerWidth = document.querySelector('.playground').offsetWidth;
    const turtleWidth = 80;
    const maxX = ((containerWidth - turtleWidth) / containerWidth) * 100; 
    const newTarget = 10 + (Math.random() * (maxX - 10));
    // console.log('getRandomTargetX:', newTarget, 'posX:', posX);
    return newTarget;
}

// Pick a random destination, start moving towards it, and flip png direction accordingly
function initMovement() {
    state = 'walking';
    startWalkingAnimation();
    targetX = getRandomTargetX();
    updatePngDirection();
    moveTurtle();
}

// Start with a longer rest period, then begin walking
setTimeout(initMovement, 3000);

// onclick on turtle: show heart and wake up to walk somewhere new
turtle.onclick = () => {
    showHeart();
    if (state === 'rest') {
        // clear any pending timeout and start new move
        if (moveTimeout) clearTimeout(moveTimeout);
        initMovement();
    } else {
        // Pick a new random destination, flip png accordingly
        targetX = getRandomTargetX();
        updatePngDirection();
    }
};