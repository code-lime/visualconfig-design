// @ts-check

/**
 * @typedef {Object} NodeTemplate
 * @property {string | undefined} icon
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
	 * @param {NodePort} data
	 * @param {boolean} isInput
	 */
	static #makePort(name, data, isInput) {
            stroke: null,
            desiredSize: new go.Size(8, 8),
            portId: name,
            toMaxLinks: 1,
            cursor: "pointer",
        });
		// @ts-ignore
		port.rawData = data;
        const lab = new go.TextBlock(name, { // the name of the port
            font: "7pt sans-serif"
        });
        const panel = new go.Panel("Horizontal", {
            margin: new go.Margin(2, 0)
        });
		// set up the port/panel based on which side of the node it will be on
		if (isInput) {
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
	 * @param {NodeTemplate} data
     * @returns {go.Node}
	 */
	static #makeTemplate(editor, typename, data) {
		const node =  new go.Node("Spot", {
			name: typename
			//margin: 5,
			//background: "red"
		})
		//.bind(new go.Binding("location", "location", go.Point.parse).makeTwoWay(go.Point.stringify))
		.add(new go.Panel("Auto", {
				width: 100,
				height: 120,
			})
			.add(new go.Shape("Rectangle", {
				fill: data.background,
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
				.add(new go.Picture(data.icon, {
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
		}).add(...Object.entries(data.inports ?? {})?.map(v => Nodes.#makePort(v[0], v[1], true))))
		.add(new go.Panel("Vertical", {
			alignment: go.Spot.Right,
			alignmentFocus: new go.Spot(1, 0.5, -8, 0)
		}).add(...Object.entries(data.outports ?? {})?.map(v => Nodes.#makePort(v[0], v[1], false))));

		// @ts-ignore
		node.rawData = data;

		editor.nodeTemplateMap.set(typename, node);
        return node;
	}

    /**
     * @param {go.Diagram} editor
     * @param {Object.<string, NodeTemplate>} templates
     */
    static make(editor, templates) {
        for (const [typename, template] of Object.entries(templates)) {
            Nodes.#makeTemplate(editor, typename, template);
        }
    }
}