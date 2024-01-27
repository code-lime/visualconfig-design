import * as vscode from 'vscode';
import * as fs from 'fs';
import { getNonce } from "./util";
import { WebviewCollection } from "./webviewCollection";
import { VcdView } from './vcdView';

export class VcdEditor implements vscode.CustomTextEditorProvider {
	public static readonly viewType = 'visualconfig-design.vcd';

	public static register(context: vscode.ExtensionContext, webviews: WebviewCollection): vscode.Disposable {
		const provider = new VcdEditor(context, webviews);
		const providerRegistration = vscode.window.registerCustomEditorProvider(VcdEditor.viewType, provider);
		return providerRegistration;
	}
	
	constructor(
		private readonly context: vscode.ExtensionContext,
		private readonly webviews: WebviewCollection,
	) { }

	public async resolveCustomTextEditor(
		document: vscode.TextDocument,
		webviewPanel: vscode.WebviewPanel,
		_token: vscode.CancellationToken
	): Promise<void> {
		this.webviews.add(document.uri, webviewPanel);

		// Setup initial content for the webview
		webviewPanel.webview.options = {
			enableScripts: true,
		};
		webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

		function updateWebview() {
            console.log('SEND UPDATE');
            console.log('Document: ', document);
			webviewPanel.webview.postMessage({
				type: 'update',
				body: document.getText(),
			});
		}

		// Hook up event handlers so that we can synchronize the webview with the text document.
		//
		// The text document acts as our model, so we have to sync change in the document to our
		// editor and sync changes in the editor back to the document.
		// 
		// Remember that a single text document can also be shared between multiple custom
		// editors (this happens for example when you split a custom editor)

		const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
			if (e.document.uri.toString() === document.uri.toString()) {
				updateWebview();
			}
		});

		// Make sure we get rid of the listener when our editor is closed.
		webviewPanel.onDidDispose(() => {
			changeDocumentSubscription.dispose();
		});

		// Receive message from the webview.
		webviewPanel.webview.onDidReceiveMessage(e => {
			console.log("ODRM: ", e);
			const { type, body } = e;
			switch (type)
			{
				case 'ready':
					updateWebview();
					return;
				case 'select':
					this.selectView(body);
					return;
				default:
					console.warn(`Not register message listener of type ${type}: `, e);
					return;
			}
			/*switch (e.type) {
				case 'add':
					this.addNewScratch(document);
					return;

				case 'delete':
					this.deleteScratch(document, e.id);
					return;
			}*/
		});
	}

	private selectView(body: any): void {
		console.log('SELECT: ', body);
		for (var view of this.webviews.getByType(VcdView.viewType)) {
			view.webview.postMessage({type: 'select', body: body});
		}
	}

	private asMediaUri(webview: vscode.Webview, ...pathSegments: string[]) : vscode.Uri	{
		return webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', ...pathSegments));
	}

	private getHtmlForWebview(webview: vscode.Webview) {
		const local = ['pages', 'editor'];
		const libs = ['libs'];

		const scriptEditorUri = this.asMediaUri(webview, ...local, 'editor.js');
		const scriptNodesUri = this.asMediaUri(webview, ...local, 'nodes.js');
		const scriptGoJSUri = this.asMediaUri(webview, ...libs, 'go-debug.js');
		const scriptUtilsUri = this.asMediaUri(webview, ...libs, 'utils.js');
		
		const styleEditorUri = this.asMediaUri(webview, ...local, 'editor.css');
		
		const htmlEditor = fs.readFileSync(this.asMediaUri(webview, ...local, 'editor.html').fsPath);

		const assetsUri = this.asMediaUri(webview, 'assets');

		const nonce = getNonce();

		return `
			<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta charset="UTF-8">

					<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

					<meta name="viewport" content="width=device-width, initial-scale=1.0">

					<link href="${styleEditorUri}" rel="stylesheet" />

					<meta name="assets-url" content="${assetsUri}">

					<title>VisualConfig Design</title>
				</head>
				<body>
					${htmlEditor}

					<script nonce="${nonce}" src="${scriptGoJSUri}"></script>
					<script nonce="${nonce}" src="${scriptEditorUri}"></script>
				</body>
			</html>`;
	}

	/**
	 * Add a new scratch to the current document.
	 */
	/*private addNewScratch(document: vscode.TextDocument) {
		const json = this.getDocumentAsJson(document);
		const character = CatScratchEditorProvider.scratchCharacters[Math.floor(Math.random() * CatScratchEditorProvider.scratchCharacters.length)];
		json.scratches = [
			...(Array.isArray(json.scratches) ? json.scratches : []),
			{
				id: getNonce(),
				text: character,
				created: Date.now(),
			}
		];

		return this.updateTextDocument(document, json);
	}

	/**
	 * Delete an existing scratch from a document.
	 */
	/*private deleteScratch(document: vscode.TextDocument, id: string) {
		const json = this.getDocumentAsJson(document);
		if (!Array.isArray(json.scratches)) {
			return;
		}

		json.scratches = json.scratches.filter((note: any) => note.id !== id);

		return this.updateTextDocument(document, json);
	}

	/**
	 * Try to get a current document as json text.
	 */
	/*private getDocumentAsJson(document: vscode.TextDocument): any {
		const text = document.getText();
		if (text.trim().length === 0) {
			return {};
		}

		try {
			return JSON.parse(text);
		} catch {
			throw new Error('Could not get document as json. Content is not valid json');
		}
	}

	/**
	 * Write out the json to a given document.
	 */
	/*private updateTextDocument(document: vscode.TextDocument, json: any) {
		const edit = new vscode.WorkspaceEdit();

		// Just replace the entire document every time for this example extension.
		// A more complete extension should compute minimal edits instead.
		edit.replace(
			document.uri,
			new vscode.Range(0, 0, document.lineCount, 0),
			JSON.stringify(json, null, 2));

		return vscode.workspace.applyEdit(edit);
	}*/
}
