import * as vscode from 'vscode';
import { VcdEditor } from './vcdEditor';
import { VcdView } from './vcdView';
import { WebviewCollection } from './webviewCollection';

export function activate(context: vscode.ExtensionContext) {
	var webviews = new WebviewCollection(() => {});

	context.subscriptions.push(VcdEditor.register(context, webviews));
	context.subscriptions.push(VcdView.register(context, webviews));
}
