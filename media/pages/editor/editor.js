// @ts-check

(function() {
	// @ts-ignore
	const assetsUrl = document.querySelector('meta[name="assets-url"]').content;

	// @ts-ignore
	const vscode = acquireVsCodeApi();
	const $ = go.GraphObject.make;
	const editor = new go.Diagram('display-div',
		{
            initialContentAlignment: go.Spot.None,
            initialAutoScale: go.Diagram.UniformToFill,
            layout: $(go.LayeredDigraphLayout, { direction: 0, alignOption: go.LayeredDigraphLayout.AlignAll }),
            "undoManager.isEnabled": true
		});

	// @ts-ignore
	window.editor = editor;
    
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
	 * @param {string} icon
	 * @param {string} background
	 * @param {go.GraphObject[]} inports
	 * @param {go.GraphObject[]} outports
	 */
	function makeTemplate(typename, icon, background, inports, outports) {
		var node =  new go.Node("Spot", {
			//margin: 5,
			//background: "red"
		})
		//.bind(new go.Binding("location", "location", go.Point.parse).makeTwoWay(go.Point.stringify))
		.add(new go.Panel("Auto", {
				width: 100,
				height: 120,
			})
			.add(new go.Shape("Rectangle", {
				fill: background,
				stroke: null,
				strokeWidth: 0,
				spot1: go.Spot.TopLeft,
				spot2: go.Spot.BottomRight
			}))
			.add(new go.Panel("Table")
				.add(new go.TextBlock(typename, {
					row: 0,

					margin: 3,
					maxSize: new go.Size(80, NaN),
					stroke: "black",
					font: "bold 12pt sans-serif"
				}))
				.add(new go.Picture(icon, {
					row: 1,

					width: 16,
					height: 16,
					scale: 3.
				}))
				.add(new go.TextBlock({
					row: 2,
				
					margin: 3,
					editable: true,
					maxSize: new go.Size(80, 40),
					stroke: "white",
					font: "bold 9pt sans-serif"
				})
					.bind(new go.Binding("text", "name").makeTwoWay()))
		))
		.add(new go.Panel("Vertical", {
			alignment: go.Spot.Left,
			alignmentFocus: new go.Spot(0, 0.5, 8, 0)
		}).add(...inports))
		.add(new go.Panel("Vertical", {
			alignment: go.Spot.Right,
			alignmentFocus: new go.Spot(1, 0.5, -8, 0)
		}).add(...outports));
/*
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
*/
		editor.nodeTemplateMap.set(typename, node);
	}

	makeTemplate("Table", `${assetsUrl}/images/table.svg`, "forestgreen",
		[],
		[makePort("OUT", false)]);

	makeTemplate("Join", `${assetsUrl}/images/join.svg`, "mediumorchid",
		[makePort("L", true), makePort("R", true)],
		[makePort("UL", false), makePort("ML", false), makePort("M", false), makePort("MR", false), makePort("UR", false)]);

	makeTemplate("Project", `${assetsUrl}/images/project.svg`, "darkcyan",
		[makePort("", true)],
		[makePort("OUT", false)]);

	makeTemplate("Filter", `${assetsUrl}/images/filter.svg`, "cornflowerblue",
		[makePort("", true)],
		[makePort("OUT", false), makePort("INV", false)]);

	makeTemplate("Group", `${assetsUrl}/images/group.svg`, "mediumpurple",
		[makePort("", true)],
		[makePort("OUT", false)]);

	makeTemplate("Sort", `${assetsUrl}/images/sort.svg`, "sienna",
		[makePort("", true)],
		[makePort("OUT", false)]);

	makeTemplate("Export", `${assetsUrl}/images/upload.svg`, "darkred",
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
	/*
	export type DiagramEventName = 
	'InitialAnimationStarting' | 
	'AnimationStarting' | 
	'AnimationFinished' | 
	'BackgroundSingleClicked' | 
	'BackgroundDoubleClicked' | 
	'BackgroundContextClicked' | 
	'ChangingSelection' | 
	'ChangedSelection' | 
	'ClipboardChanged' | 
	'ClipboardPasted' | 
	'DocumentBoundsChanged' | 
	'ExternalObjectsDropped' | 
	'GainedFocus' | 
	'InitialLayoutCompleted' | 
	'LayoutCompleted' | 
	'LinkDrawn' | 
	'LinkRelinked' | 
	'LinkReshaped' | 
	'LostFocus' | 
	'Modified' | 
	'ObjectSingleClicked' | 
	'ObjectDoubleClicked' | 
	'ObjectContextClicked' | 
	'PartCreated' | 
	'PartResized' | 
	'PartRotated' | 
	'SelectionMoved' | 
	'SelectionCopied' | 
	'SelectionDeleted' | 
	'SelectionDeleting' | 
	'SelectionGrouped' | 
	'SelectionUngrouped' | 
	'SubGraphCollapsed' | 
	'SubGraphExpanded' | 
	'TextEdited' | 
	'TreeCollapsed' | 
	'TreeExpanded' | 
	'ViewportBoundsChanged' | 
	'InvalidateDraw';
	*/
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