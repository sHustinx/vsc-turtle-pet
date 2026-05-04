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

        const jsUri = webviewView.webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'src', 'webview', 'webview.js')
        );
        const cssUri = webviewView.webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'src', 'webview', 'webview.css')
        );
        const mediaUri = webviewView.webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'media')
        );

        // set the webview HTML content
        webviewView.webview.html = getWebviewContent(
            mediaUri.toString(),
            jsUri.toString(),
            cssUri.toString()
        );
    }
}

function getWebviewContent(mediaUri, jsUri, cssUri) {
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
        <img src="${mediaUri}/mono-standing.png" alt="Turtle" class="turtle" id="turtle">
        <div class="heart" id="heart">❤️</div>
        <button class="menu-button" id="menu-button">⋮</button>
        <div class="menu" id="menu" style="display: none;">
            <button id="party-button">let's party!</button>
        </div>
    </div>

    <script>
        const mediaUri = "${mediaUri}";
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