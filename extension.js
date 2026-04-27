const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Turtle Pet extension is now active!');

    // Register the webview view provider
    const provider = new TurtleWebviewView(context);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('turtle-pet-view', provider)
    );
}

class TurtleWebviewView {
    constructor(context) {
        this.context = context;
    }

    resolveWebviewView(webviewView) {
        // Configure the webview
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.context.extensionUri]
        };

        // get turtle images
        const turtleUri = webviewView.webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'media', 'mono-standing.png')
        );
        const turtleWalking1Uri = webviewView.webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'media', 'mono-walking-1.png')
        );
        const turtleWalking2Uri = webviewView.webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'media', 'mono-walking-2.png')
        );

        // set the webview HTML content
        webviewView.webview.html = getWebviewContent(turtleUri.toString(), turtleWalking1Uri.toString(), turtleWalking2Uri.toString());
    }
}

function getWebviewContent(turtleUri, turtleWalking1Uri, turtleWalking2Uri) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Turtle Pet</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            margin: 0;
            padding: 0;
            /*background: linear-gradient(180deg, #212121 0%, #292929 85%, #212121 100%);*/
            background: linear-gradient(180deg, #262626 0%, #1f1f1f 78%, #383838 79%, #2e2e2e 100%);
            overflow: hidden;
        }
        .playground {
            flex: 1;
            position: relative;
            overflow: hidden;
        }
        .turtle {
            position: absolute;
            width: 80px;
            height: auto;
            cursor: pointer;
            transition: left 0.05s linear;
        }
        .turtle:hover {
            scale: 1.05;
        }
        .heart {
            position: absolute;
            font-size: 20px;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s, transform 0.5s;
        }
        .heart.show {
            opacity: 1;
            transform: translateY(-30px);
        }
    </style>
</head>
<body>
    <div class="playground">
        <img src="${turtleUri}" alt="Turtle" class="turtle" id="turtle">
        <div class="heart" id="heart">❤️</div>
    </div>

    <script>
        const turtleUri = "${turtleUri}";
        const turtleWalking1Uri = "${turtleWalking1Uri}";
        const turtleWalking2Uri = "${turtleWalking2Uri}";
        
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
    </script>
</body>
</html>`;
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};