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
 * @property {string} type
 */

/**
 * @type {Nodes}
 */
class Nodes {
	static #figures = [
		"M 1,0 L 0,1 L 1,2 L 2,1 L 1,0 z", //diamond
		"M 1,0 A 1,1, 180, 0,0, 1,2 A 1,1, 180, 0,0, 1,0 z", //circle
		"M 1,0 L 0,0 L 0,2 L 2,2 L 2,0 z", //square
		"M 1,0 L 0.75,0.75 L 0,1 L 0.75,1.25 L 1,2 L 1.25,1.25 L 2,1 L 1.25,0.75 L 1,0 z" //star
	];

	/**
	 * @param {string} name
	 * @param {NodePort} data
	 * @param {boolean} isInput
	 */
	static #makePort(name, data, isInput) {
		const random = Utils.random(data.type);
		const figure = Nodes.#figures[Math.floor(random.next() * Nodes.#figures.length)];
		const color = Utils.asHsv(random.next(), random.next() * 0.25 + 0.75, random.next() * 0.25 + 0.75);

        const port = new go.Shape({
            fill: '#' + color,
            stroke: null,
			width: 10,
			height: 10,
            portId: name,
            toMaxLinks: 1,
			geometryString: 'F ' + figure,
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

	/**
	 * @param {go.GraphObject} port
	 * @returns {NodePort | undefined}
	 */
	static #getNodePort(port) {
		const typename = port.part?.name;
		if (typename === undefined) {
			return undefined;
		}
		const part = port.diagram?.nodeTemplateMap.get(typename);
		if (part === undefined || part === null || !('rawData' in part)) {
			return undefined;
		}
		const portname = port.portId;
		const template = /** @type {NodeTemplate} */ (part.rawData);
		const isInput = port.toLinkable;
		const ports = isInput ? template.inports : template.outports;
		if (ports === undefined || !(portname in ports)) {
			return undefined;
		}
		return ports[portname];
	}

	/**
	 * @param {go.Node} fromNode 
	 * @param {go.GraphObject} fromPort 
	 * @param {go.Node} toNode 
	 * @param {go.GraphObject} toPort 
	 * @param {go.Link} link
	 * @returns {boolean}
	 */
	static #portTypeValidation(fromNode, fromPort, toNode, toPort, link) {
		const fromData = Nodes.#getNodePort(fromPort);
		const toData = Nodes.#getNodePort(toPort);
		if (fromData === undefined || toData === undefined) {
			console.error('Not typed ports ', fromPort, toPort, ' in nodes ', fromNode, toNode, ' in link ', link);
			return false;
		}
		return fromData.type === toData.type;
	}

    /**
     * @param {go.Diagram} editor
     */
	static registerPortTypeValidation(editor) {
		const tool = editor.toolManager.linkingTool;
		if (tool.linkValidation === null) {
			tool.linkValidation = Nodes.#portTypeValidation;
		} else {
			const otherValidation = tool.linkValidation;
			if (otherValidation === Nodes.#portTypeValidation) {
				return;
			}
			tool.linkValidation = (v0,v1,v2,v3,v4) => otherValidation(v0,v1,v2,v3,v4) || Nodes.#portTypeValidation(v0,v1,v2,v3,v4);
		}
	}
}