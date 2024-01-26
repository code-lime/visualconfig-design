// @ts-check


// This script is run within the webview itself
(function () {
	/**
	 * @template T
	 * @param {T?} value
	 * @returns {T}
	 */
	function nonNull(value) {
		if (value === null) throw 'NULLABLE';
		return value;
	}

	// @ts-ignore
	const vscode = acquireVsCodeApi();
	const $ = go.GraphObject.make;
	const editor = new go.Diagram('blueprint-div',
		{
			initialContentAlignment: go.Spot.Left,
			/*initialAutoScale: go.Diagram.UniformToFill,
			autoScale: go.Diagram.UniformToFill,*/
			layout: $(go.LayeredDigraphLayout, { direction: 0, alignOption: go.LayeredDigraphLayout.AlignAll }),
			"undoManager.isEnabled": true
		});
	const blueprint_div = nonNull(document.getElementById('blueprint-div'));
	const blueprint_scale = nonNull(document.getElementById('blueprint-scale'));
	function resizeExecute() {
		var rect = blueprint_scale.getBoundingClientRect();
		console.log('NEW SIZE: ' + rect.width + " " + rect.height);
		blueprint_div.style.width = rect.width + 'px';
		blueprint_div.style.height = rect.height + 'px';
	}


	window.addEventListener('resize', e => resizeExecute());

	/**
	 * @param {string} name
	 * @param {boolean} leftside
	 */
	function makePort(name, leftside) {
		var port = $(go.Shape, "Rectangle",
			{
				fill: "gray",
				stroke: null,
				desiredSize: new go.Size(8, 8),
				portId: name,  // declare this object to be a "port"
				toMaxLinks: 1,  // don't allow more than one link into a port
				cursor: "pointer"  // show a different cursor to indicate potential link point
			});

		var lab = $(go.TextBlock, name,  // the name of the port
			{ font: "7pt sans-serif" });

		var panel = $(go.Panel, "Horizontal",
			{ margin: new go.Margin(2, 0) });

		// set up the port/panel based on which side of the node it will be on
		if (leftside) {
			port.toSpot = go.Spot.Left;
			port.toLinkable = true;
			lab.margin = new go.Margin(1, 0, 0, 1);
			panel.alignment = go.Spot.TopLeft;
			panel.add(port);
			panel.add(lab);
		} else {
			port.fromSpot = go.Spot.Right;
			port.fromLinkable = true;
			lab.margin = new go.Margin(1, 1, 0, 0);
			panel.alignment = go.Spot.TopRight;
			panel.add(lab);
			panel.add(port);
		}
		return panel;
	}

	/**
	 * @param {string} typename
	 * @param {string | go.Binding | go.AnimationTrigger | go.EnumValue | HTMLDivElement | (Partial<go.Picture> & { [p: string]: any; }) | (string | go.Binding | go.AnimationTrigger | go.EnumValue | (Partial<go.Picture> & { [p: string]: any; }))[]} icon
	 * @param {string} background
	 * @param {string | go.GraphObject | go.Binding | go.AnimationTrigger | go.EnumValue | go.RowColumnDefinition | go.PanelLayout | HTMLDivElement | (Partial<go.Panel> & { [p: string]: any; }) | (string | go.GraphObject | go.Binding | go.AnimationTrigger | go.EnumValue | go.RowColumnDefinition | go.PanelLayout | (Partial<go.Panel> & { [p: string]: any; }))[]} inports
	 * @param {string | go.GraphObject | go.Binding | go.AnimationTrigger | go.EnumValue | go.RowColumnDefinition | go.PanelLayout | HTMLDivElement | (Partial<go.Panel> & { [p: string]: any; }) | (string | go.GraphObject | go.Binding | go.AnimationTrigger | go.EnumValue | go.RowColumnDefinition | go.PanelLayout | (Partial<go.Panel> & { [p: string]: any; }))[]} outports
	 */
	function makeTemplate(typename, icon, background, inports, outports) {
		var node = $(go.Node, "Spot",
			$(go.Panel, "Auto",
				{ width: 100, height: 120 },
				$(go.Shape, "Rectangle",
					{
						fill: background, stroke: null, strokeWidth: 0,
						spot1: go.Spot.TopLeft, spot2: go.Spot.BottomRight
					}),
				$(go.Panel, "Table",
					$(go.TextBlock, typename,
						{
							row: 0,
							margin: 3,
							maxSize: new go.Size(80, NaN),
							stroke: "black",
							font: "bold 12pt sans-serif"
						}),
					$(go.Picture, icon,
						{ row: 1, width: 16, height: 16, scale: 3.0 }),
					$(go.TextBlock,
						{
							row: 2,
							margin: 3,
							editable: true,
							maxSize: new go.Size(80, 40),
							stroke: "white",
							font: "bold 9pt sans-serif"
						},
						new go.Binding("text", "name").makeTwoWay())
				)
			),
			$(go.Panel, "Vertical",
				{
					alignment: go.Spot.Left,
					alignmentFocus: new go.Spot(0, 0.5, 8, 0)
				},
				inports),
			$(go.Panel, "Vertical",
				{
					alignment: go.Spot.Right,
					alignmentFocus: new go.Spot(1, 0.5, -8, 0)
				},
				outports)
		);
		editor.nodeTemplateMap.set(typename, node);
	}

	makeTemplate("Table", "images/table.svg", "forestgreen",
		[],
		[makePort("OUT", false)]);

	makeTemplate("Join", "images/join.svg", "mediumorchid",
		[makePort("L", true), makePort("R", true)],
		[makePort("UL", false), makePort("ML", false), makePort("M", false), makePort("MR", false), makePort("UR", false)]);

	makeTemplate("Project", "images/project.svg", "darkcyan",
		[makePort("", true)],
		[makePort("OUT", false)]);

	makeTemplate("Filter", "images/filter.svg", "cornflowerblue",
		[makePort("", true)],
		[makePort("OUT", false), makePort("INV", false)]);

	makeTemplate("Group", "images/group.svg", "mediumpurple",
		[makePort("", true)],
		[makePort("OUT", false)]);

	makeTemplate("Sort", "images/sort.svg", "sienna",
		[makePort("", true)],
		[makePort("OUT", false)]);

	makeTemplate("Export", "images/upload.svg", "darkred",
		[makePort("", true)],
		[]);

	editor.linkTemplate =
		$(go.Link,
			{
				routing: go.Link.Orthogonal, corner: 25,
				relinkableFrom: true, relinkableTo: true
			},
			$(go.Shape, { stroke: "gray", strokeWidth: 2 }),
			$(go.Shape, { stroke: "gray", fill: "gray", toArrow: "Standard" })
		);
	editor.addDiagramListener("Modified", e => {
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
		const { type, body, requestId } = e.data;
		switch (type) {
			case 'update':
				{
					console.log('UPDATE');
					console.log(body);
					editor.model = go.Model.fromJson(body);
					resizeExecute();
					return;
				}
			/*
		case 'getFileData':
			{
				// Get the image data for the canvas and post it back to the extension.
				editor.getImageData().then(data => {
					vscode.postMessage({ type: 'response', requestId, body: Array.from(data) });
				});
				return;
			}
			*/
		}
	});

	// Signal to VS Code that the webview is initialized.
	vscode.postMessage({ type: 'ready' });
}());