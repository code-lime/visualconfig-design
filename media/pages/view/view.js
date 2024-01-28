//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    //@ts-ignore
    const vscode = acquireVsCodeApi();
    //@ts-ignore
    window.vscode = vscode;

    const displayMain = Utils.notNull(document.querySelector('#display-main'));

    displayMain.innerHTML = '';

    /**
     * @param {NodeElement} element 
     * @param {string} fieldName 
     */
    function onChange(element, fieldName) {
        const message = {
            type: 'change',
            body: {
                id: element.id,
                field: fieldName,
                value: element.fields[fieldName].value
            }
        };
        console.log(`Changed field '${fieldName}' in element '${element.id}' with new value ${element.fields[fieldName].value}`);
        console.log(`Send message: ${JSON.stringify(message)}`);
        vscode.postMessage(message);
    }

	/**
	 * @param {Array<NodeElement>} elements
	 */
    function onSelect(elements) {
        if (elements.length >= 1) {
            const element = elements[0];

            /** @type {Object.<string, (Object.<string, Node>)>} */
            const groups = {};

            for (const [key, field] of Object.entries(element.fields)) {
                const groupKey = field.group ?? '';

                /** @type {Object.<string, Node>} */
                let group;

                if (groupKey in groups) {
                    group = groups[groupKey];
                } else {
                    group = {};
                    groups[groupKey] = group;
                }

                /** @type {Node} */
                let node;

                switch (field.type) {
                    case "color": {
                        node = Options.createOptionColor(field.name, field.value, {
                            readonly: field.readonly,
                            onchange: e => {
                                field.value = e;
                                onChange(element, key);
                            },
                        });
                        break;
                    }
                    case "text": {
                        node = Options.createOptionText(field.name, field.value, {
                            readonly: field.readonly,
                            onchange: e => {
                                field.value = e;
                                onChange(element, key);
                            },
                        });
                        break;
                    }
                    case "integer": {
                        node = Options.createOptionInteger(field.name, field.value, {
                            readonly: field.readonly,
                            onchange: e => {
                                field.value = e;
                                onChange(element, key);
                            },
                        });
                        break;
                    }
                    case "double": {
                        node = Options.createOptionDouble(field.name, field.value, {
                            readonly: field.readonly,
                            onchange: e => {
                                field.value = e;
                                onChange(element, key);
                            },
                        });
                        break;
                    }
                    case "select": {
                        node = Options.createOptionSelect(field.name, field.list, field.value, {
                            readonly: field.readonly,
                            onchange: e => {
                                field.value = e;
                                onChange(element, key);
                            },
                        });
                        break;
                    }
                }

                group[key] = node;
            }

            displayMain.replaceChildren(...Options.create(
                element.type,
                ...Object.entries(groups)
                    .flatMap(v => {
                        const [groupKey, group] = v;
                        if (groupKey === '') {
                            return Object.values(group);
                        } else {
                            return Options.createGroup(groupKey, ...Object.values(group));
                        }
                    })));
        } else {
            displayMain.replaceChildren(...Options.create('...'));
        }
    }
    onSelect([]);

    window.addEventListener("message", e => {
		const { type, body } = e.data;
        switch (type)
        {
            case 'select':
                onSelect(body);
                console.log('Select data: ', body);
                return;
            default:
                console.warn(`Not register message listener of type ${type}: `, e);
                return;
        }
    });

	// Signal to VS Code that the webview is initialized.
	vscode.postMessage({ type: 'ready' });
    /*
    const oldState = vscode.getState() || { colors: [] };

    /** @type {Array<{ value: string }>} *//*
    let colors = oldState.colors;

    updateColorList(colors);

    document.querySelector('.add-color-button').addEventListener('click', () => {
        addColor();
    });

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
            case 'addColor':
                {
                    addColor();
                    break;
                }
            case 'clearColors':
                {
                    colors = [];
                    updateColorList(colors);
                    break;
                }

        }
    });

    /**
     * @param {Array<{ value: string }>} colors
     *//*
    function updateColorList(colors) {
        const ul = document.querySelector('.color-list');
        ul.textContent = '';
        for (const color of colors) {
            const li = document.createElement('li');
            li.className = 'color-entry';

            const colorPreview = document.createElement('div');
            colorPreview.className = 'color-preview';
            colorPreview.style.backgroundColor = `#${color.value}`;
            colorPreview.addEventListener('click', () => {
                onColorClicked(color.value);
            });
            li.appendChild(colorPreview);

            const input = document.createElement('input');
            input.className = 'color-input';
            input.type = 'text';
            input.value = color.value;
            input.addEventListener('change', (e) => {
                const value = e.target.value;
                if (!value) {
                    // Treat empty value as delete
                    colors.splice(colors.indexOf(color), 1);
                } else {
                    color.value = value;
                }
                updateColorList(colors);
            });
            li.appendChild(input);

            ul.appendChild(li);
        }

        // Update the saved state
        vscode.setState({ colors: colors });
    }

    /** 
     * @param {string} color 
     *//*
    function onColorClicked(color) {
        vscode.postMessage({ type: 'colorSelected', value: color });
    }

    /**
     * @returns string
     *//*
    function getNewCalicoColor() {
        const colors = ['020202', 'f1eeee', 'a85b20', 'daab70', 'efcb99'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function addColor() {
        colors.push({ value: getNewCalicoColor() });
        updateColorList(colors);
    }*/
    
}());