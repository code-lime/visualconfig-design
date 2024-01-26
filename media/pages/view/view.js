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

    displayMain.appendChild(Options.createTitle('Test title'));
    displayMain.appendChild(Options.createLine());
    displayMain.appendChild(Options.createList(
        Options.createOptionText('Test text option', 'test value', {
            onchange: e => console.log('Text changed: ', e),
            readonly: true
        }),
        Options.createOptionColor('Test color option', '#FFFFFF', {
            onchange: e => console.log('Color changed: ', e)
        }),
        Options.createOptionDouble('Test double option', 1.5246, {
            onchange: e => console.log('Double changed: ', e)
        }),
        Options.createOptionInteger('Test integer option', 125, {
            onchange: e => console.log('Integer changed: ', e)
        }),
        Options.createGroup('Select region', 
            Options.createOptionSelect('Test select option', ['Test', 'select', 'option', 'testing'], 'select', {
                onchange: e => console.log('Select (array): ', e)
            }),
            Options.createOptionSelect('Test select option', { 'a':'Any', 'b':'other', 'c':'test with', 'd':'number', 'e':'indexing'}, 'b', {
                onchange: e => console.log('Select (object): ', e)
            }),
        ),
    ));

	/**
	 * @param {Array<{key:number,type:string,name:string}>} elements
	 */
    function onSelect(elements) {
        if (elements.length < 1) {

        }
    }

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