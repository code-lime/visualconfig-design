import * as vscode from 'vscode';
import * as fs from 'fs';
import { getNonce } from "./util";
import { WebviewCollection } from "./webviewCollection";
import { VcdEditor } from './vcdEditor';

export class VcdView implements vscode.WebviewViewProvider {
	public static readonly viewType = 'visualconfig-design.vcd-options';

	public static register(context: vscode.ExtensionContext, webviews: WebviewCollection): vscode.Disposable {
		const provider = new VcdView(context, webviews);
		const providerRegistration = vscode.window.registerWebviewViewProvider(VcdView.viewType, provider);
		/*const onDidChangedViewsEvent = webviews.onDidChangedViews(e => {
			for (const view of webviews.getByType(this.viewType)) {
				view.webview.postMessage({ type: 'visible-check' });
			}
		});*/
		return vscode.Disposable.from(/*onDidChangedViewsEvent, */providerRegistration);
	}
    
	constructor(
		private readonly context: vscode.ExtensionContext,
		private readonly webviews: WebviewCollection,
	) { }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		_context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this.webviews.add(undefined, webviewView);

		webviewView.webview.options = {
			enableScripts: true
		};

		webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(e => {
			console.log("[V]ODRM: ", e);
			const { type, body } = e;
			switch (type) {
				case 'ready':
					console.log('Active `.vcd` editors: ', ...this.webviews.getByType(VcdEditor.viewType));
					break;
				case 'select': 
					console.log('Select: ', body);
					break;
				default:
					console.warn(`Not register message listener of type ${type}: `, e);
					return;
			}
		});
	}

	private asMediaUri(webview: vscode.Webview, ...pathSegments: string[]) : vscode.Uri {
		return webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', ...pathSegments));
	}

	private getHtmlForWebview(webview: vscode.Webview) {
		const local = ['pages', 'view'];
		const libs = ['libs'];

		const scriptViewUri = this.asMediaUri(webview, ...local, 'view.js');
		const scriptOptionsUri = this.asMediaUri(webview, ...local, 'options.js');
		const scriptVaidationsUri = this.asMediaUri(webview, ...local, 'validation.js');
		const scriptUtilsUri = this.asMediaUri(webview, ...libs, 'utils.js');
		
		const styleViewUri = this.asMediaUri(webview, ...local, 'view.css');
		const styleResetUri = this.asMediaUri(webview, ...libs, 'reset.css');
		const styleVSCodeUri = this.asMediaUri(webview, ...libs, 'vscode.css');
		
		const htmlView = fs.readFileSync(this.asMediaUri(webview, ...local, 'view.html').fsPath);

		const assetsUri = this.asMediaUri(webview, 'assets');

		const nonce = getNonce();

		return `
			<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta charset="UTF-8">

					<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

					<meta name="viewport" content="width=device-width, initial-scale=1.0">

					<link href="${styleResetUri}" rel="stylesheet">
					<link href="${styleVSCodeUri}" rel="stylesheet">
					<link href="${styleViewUri}" rel="stylesheet">

					<meta name="assets-url" content="${assetsUri}">

					<title>Cat Colors</title>
				</head>
				<body>
					${htmlView}

					${[
						scriptUtilsUri,
						scriptVaidationsUri,
						scriptOptionsUri,
						scriptViewUri,
					].map(uri => `<script nonce="${nonce}" src="${uri}"></script>`).join('')}
				</body>
			</html>`;
	}
}