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
        const jsUri = webviewView.webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'webview', 'webview.js')
        );

        // set the webview HTML content
        webviewView.webview.html = getWebviewContent(
            turtleUri.toString(),
            turtleWalking1Uri.toString(),
            turtleWalking2Uri.toString(),
            jsUri.toString()
        );
    }
}

function getWebviewContent(turtleUri, turtleWalking1Uri, turtleWalking2Uri, jsUri) {
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
    </script>

    <script src="${jsUri}"></script>
</body>
</html>`;
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};