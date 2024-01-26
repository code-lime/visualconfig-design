import * as vscode from 'vscode';

/**
 * Tracks all webviews.
 */
export class WebviewCollection extends vscode.Disposable {
	private readonly _webviews = new Set<{
		readonly resource: string | undefined;
		readonly webview: vscode.WebviewPanel | vscode.WebviewView;
	}>();

	/*private readonly _onDidChangedViews = new vscode.EventEmitter<vscode.WebviewPanel | vscode.WebviewView>();
	private readonly _onDidAppendedViews = new vscode.EventEmitter<vscode.WebviewPanel | vscode.WebviewView>();
	private readonly _onDidRemovedViews = new vscode.EventEmitter<vscode.WebviewPanel | vscode.WebviewView>();

	public readonly onDidChangedViews = this._onDidChangedViews.event;
	public readonly onDidAppendedViews = this._onDidAppendedViews.event;
	public readonly onDidRemovedViews = this._onDidRemovedViews.event;*/

	private readonly _disposing = new Array<vscode.Disposable>(/*this._onDidChangedViews, this._onDidAppendedViews, this._onDidRemovedViews*/);

	/**
	 * Get all known webviews for a given uri.
	 */
	public *getByResource(uri: vscode.Uri): Iterable<vscode.WebviewPanel | vscode.WebviewView> {
		const key = uri.toString();
		for (const entry of this._webviews) {
			if (entry.resource === key) {
				yield entry.webview;
			}
		}
	}
	/**
	 * Get all known webviews for a view type.
	 */
	public *getByType(viewType: string): Iterable<vscode.WebviewPanel | vscode.WebviewView> {
		for (const entry of this._webviews) {
			if (entry.webview.viewType === viewType) {
				yield entry.webview;
			}
		}
	}

	/**
	 * Add a new webview to the collection.
	 */
	public add(uri: vscode.Uri | undefined | null, webview: vscode.WebviewPanel | vscode.WebviewView) {
		const entry = {
			resource: uri?.toString(),
			webview: webview
		};
		this._webviews.add(entry);
		/*this._onDidChangedViews.fire(webview);
		this._onDidAppendedViews.fire(webview);*/

		const disposable = webview.onDidDispose(() => {
			this._webviews.delete(entry);
			/*this._onDidChangedViews.fire(webview);
			this._onDidRemovedViews.fire(webview);*/
			const removeIndex = this._disposing.indexOf(disposable);
			if (removeIndex > -1) {
				this._disposing.splice(removeIndex, 1);
			}
		});
		this._disposing.push(disposable);
	}

	public override dispose() {
		for (const _dispose of this._disposing) {
			_dispose.dispose();
		}
	}
}