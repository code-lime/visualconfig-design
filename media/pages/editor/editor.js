// @ts-check

(function() {
	// @ts-ignore
	const assetsUrl = document.querySelector('meta[name="assets-url"]').content;

	// @ts-ignore
	const vscode = acquireVsCodeApi();

	const editor = new go.Diagram('display-div',
		{
            initialContentAlignment: go.Spot.None,
            initialAutoScale: go.Diagram.UniformToFill,
            layout: new go.LayeredDigraphLayout({
				direction: 0,
				alignOption: go.LayeredDigraphLayout.AlignAll
			}),
			"undoManager.isEnabled": true
		});

	// @ts-ignore
	window.editor = editor;

	Nodes.registerPortTypeValidation(editor);
	Nodes.make(editor, {
		'Table': {
			icon: `${assetsUrl}/images/table.svg`,
			background: 'forestgreen',
			fields: {
				'rows': {
					name: 'Rows',
					readonly: false,
					type: "integer",
					value: 1
				},
				'cells': {
					name: 'Cells',
					readonly: false,
					type: "integer",
					value: 1
				}
			},
			outports: {
				'OUT': {
					type: 'a'
				}
			}
		},
		'Join': {
			icon: `${assetsUrl}/images/join.svg`,
			background: 'mediumorchid',
			inports: {
				'L': {
					type: 'a'
				},
				'R': {
					type: 'a'
				},
			},
			outports: {
				'UL': {
					type: 'a'
				},
				'ML': {
					type: 'a'
				},
				'M': {
					type: 'a'
				},
				'MR': {
					type: 'a'
				},
				'UR': {
					type: 'a'
				}
			}
		},
		'Project': {
			icon: `${assetsUrl}/images/project.svg`,
			background: 'darkcyan',
			fields: {
				'project_name': {
					name: "Project name",
					readonly: false,
					type: "text",
					value: "Base project name"
				}
			},
			inports: {
				'': {
					type: 'a'
				}
			},
			outports: {
				'OUT': {
					type: 'filter'
				}
			}
		},
		'Filter': {
			icon: `${assetsUrl}/images/filter.svg`,
			background: 'cornflowerblue',
			inports: {
				'': {
					type: 'filter'
				}
			},
			outports: {
				'OUT': {
					type: 'a'
				},
				'INV': {
					type: 'a'
				}
			}
		},
		'Group': {
			icon: `${assetsUrl}/images/group.svg`,
			background: 'mediumpurple',
			inports: {
				'': {
					type: 'a'
				}
			},
			outports: {
				'OUT': {
					type: 'a'
				}
			}
		},
		'Sort': {
			icon: `${assetsUrl}/images/sort.svg`,
			background: 'sienna',
			inports: {
				'': {
					type: 'a'
				}
			},
			outports: {
				'OUT': {
					type: 'b'
				}
			}
		},
		'Export': {
			icon: `${assetsUrl}/images/upload.svg`,
			background: 'darkred',
			fields: {
				'output_name': {
					name: "Output name",
					readonly: false,
					type: "text",
					value: "result"
				},
				'file_output_name': {
					name: "File name",
					readonly: false,
					type: "text",
					value: "result",
					group: 'file'
				},
				'file_output_dir': {
					name: "File path",
					readonly: false,
					type: "text",
					value: "result",
					group: 'file'
				},
			},
			inports: {
				'': {
					type: 'b'
				}
			}
		}
	});
	editor.linkTemplate = new go.Link({
		routing: go.Link.Orthogonal,
		corner: 25,
		relinkableFrom: true,
		relinkableTo: true
	})
	.add(new go.Shape({
		stroke: 'gray',
		strokeWidth: 2
	}))
	.add(new go.Shape({
		stroke: 'gray',
		fill: 'gray',
		toArrow: "Standard"
	}));
	
	editor.addDiagramListener("ChangedSelection", e => {
		console.log('Changed: ', e.subject);
		var elements = [];
		editor.selection.each(e => {
			elements.push(e.data);
		});
		vscode.postMessage({ type: 'select', body: elements });
		/*var idx = document.title.indexOf("*");
		if (myDiagram.isModified) {
			if (idx < 0) document.title += "*";
		} else {
			if (idx >= 0) document.title = document.title.slice(0, idx);
		}
		document.title = 
		/*var button = document.getElementById("SaveButton");
		if (button) button.disabled = !myDiagram.isModified;
		var idx = document.title.indexOf("*");
		if (myDiagram.isModified) {
			if (idx < 0) document.title += "*";
		} else {
			if (idx >= 0) document.title = document.title.slice(0, idx);
		}*/
	});

	// Handle messages from the extension
	window.addEventListener('message', async e => {
		console.log("OM: ", e);
		const { type, body } = e.data;
		switch (type) {
			case 'update':
				console.log('UPDATE: ', JSON.parse(body));
				editor.model = go.Model.fromJson(body);
				vscode.postMessage({ type: 'select', body: [] });
				return;
			default:
				console.warn(`Not register message listener of type ${type}: `, e);
				return;
		}
	});

	// Signal to VS Code that the webview is initialized.
	vscode.postMessage({ type: 'ready' });
}());