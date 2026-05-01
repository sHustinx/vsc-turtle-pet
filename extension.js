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
        const cssUri = webviewView.webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'webview', 'webview.css')
        );

        // set the webview HTML content
        webviewView.webview.html = getWebviewContent(
            turtleUri.toString(),
            turtleWalking1Uri.toString(),
            turtleWalking2Uri.toString(),
            jsUri.toString(),
            cssUri.toString()
        );
    }
}

function getWebviewContent(turtleUri, turtleWalking1Uri, turtleWalking2Uri, jsUri, cssUri) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Turtle Pet</title>
    <style>body.turtle-hidden{visibility:hidden;}</style>
    <link id="main-css" rel="stylesheet" href="${cssUri}">
    <script>
        const cssLink = document.getElementById('main-css');
        const reveal = () => document.body.classList.remove('turtle-hidden');
        const tryReveal = () => {
            try {
                if (cssLink.sheet && cssLink.sheet.cssRules) {
                    reveal();
                }
            } catch (e) {
                // stylesheet not ready yet
            }
        };
        cssLink.addEventListener('load', reveal);
        cssLink.addEventListener('error', reveal);
        requestAnimationFrame(tryReveal);
    </script>
</head>
<body class="turtle-hidden">
    <div class="playground">
        <img src="${turtleUri}" alt="Turtle" class="turtle" id="turtle">
        <div class="heart" id="heart">❤️</div>
        <button class="menu-button" id="menu-button">⋮</button>
        <div class="menu" id="menu" style="display: none;">
            <button id="party-button">surprise me</button>
        </div>
    </div>

    <script>
        const turtleUri = "${turtleUri}";
        const turtleWalking1Uri = "${turtleWalking1Uri}";
        const turtleWalking2Uri = "${turtleWalking2Uri}";
    </script>

    <script type="module" src="${jsUri}"></script>
</body>
</html>`;
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};