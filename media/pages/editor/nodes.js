// @ts-check

/**
 * @typedef {Object} NodeTemplate
 * @property {string} icon
 * @property {string} background
 * @property {Object.<string, NodePort>} [inports]
 * @property {Object.<string, NodePort>} [outports]
 */

/**
 * @typedef {Object} NodePort
 */

/**
 * @type {Nodes}
 */
class Nodes {
	/**
	 * @param {string} name
	 * @param {boolean} leftside
	 */
	static #makePort(name, leftside) {
        const port = new go.Shape("Rectangle", {
            fill: "gray",
            stroke: null,
            desiredSize: new go.Size(8, 8),
            portId: name,
            toMaxLinks: 1,
            cursor: "pointer",
        });
        const lab = new go.TextBlock(name, { // the name of the port
            font: "7pt sans-serif"
        });
        const panel = new go.Panel("Horizontal", {
            margin: new go.Margin(2, 0)
        });
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
     * @param {go.Diagram} editor 
	 * @param {string} typename
	 * @param {string} icon
	 * @param {string} background
	 * @param {go.GraphObject[]} inports
	 * @param {go.GraphObject[]} outports
     * @returns {go.Node}
	 */
	static #makeTemplate(editor, typename, icon, background, inports, outports) {
		const node =  new go.Node("Spot", {
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
        return node;
	}

    /**
     * @param {go.Diagram} editor
     * @param {Object.<string, NodeTemplate>} templates
     */
    static make(editor, templates) {
        for (const [typename, template] of Object.entries(templates)) {
            this.#makeTemplate(
                editor, 
                typename, 
                template.icon,
                template.background, 
                Object.entries(template.inports ?? {})?.map(v => this.#makePort(v[0], true)),
                Object.entries(template.outports ?? {})?.map(v => this.#makePort(v[0], false)),
            );
        }
    }
}