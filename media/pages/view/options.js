//@ts-check

/** 
 * @template T
 * @typedef {Object} OptionConfig
 * @property {CallbackFunc<T> | undefined} [onchange]
 * @property {boolean} [readonly]
 */

/**
 * @type {Options}
 */
class Options {

    /** 
     * @param {Array<Node>} elements 
     */
    static #createList(...elements) {
        const element = /** @type {HTMLElement} */ (Utils.notNull(document.querySelector("#instances>#list")).cloneNode(true));
        element.append(...elements);
        return element;
    }
    /** 
     * @param {string} title 
     */
    static #createTitle(title) {
        const element = /** @type {HTMLElement} */ (Utils.notNull(document.querySelector("#instances>#title")).cloneNode(true));
        element.textContent = title;
        return element;
    }
    static #createLine() {
        const element = /** @type {HTMLElement} */ (Utils.notNull(document.querySelector("#instances>#line")).cloneNode(true));
        return element;
    }

    /**
     * @param {string} title
     * @param {Array<Node>} elements
     * @returns {Iterable<HTMLElement>}
     */
    static *create(title, ...elements) {
        yield this.#createTitle(title);
        yield this.#createLine();
        yield this.#createList(...elements);
    }

    /** 
     * @param {string} name
     * @param {Array<Node>} elements 
     */
    static createGroup(name, ...elements) {
        const element = /** @type {HTMLFieldSetElement} */ (Utils.notNull(document.querySelector("#instances>#group")).cloneNode(true));
        const legend = /** @type {HTMLLegendElement} */ (element.querySelector('legend'));
        legend.textContent = name;
        element.append(this.#createList(...elements));
        return element;
    }
    /** 
     * @param {string} name
     * @param {string} value
     * @param {OptionConfig<string> | undefined} options
     */
    static createOptionText(name, value, options = undefined) {
        const element = /** @type {HTMLElement} */ (Utils.notNull(document.querySelector("#instances>#entry-text")).cloneNode(true));
        Utils.notNull(element.querySelector(".option-name>span")).textContent = name;

        const input = /** @type {HTMLInputElement} */ (Utils.notNull(element.querySelector(".option-value")));

        if (options?.readonly) {
            input.disabled = true;
        }

        input.value = value;
        
        input.addEventListener('input', _ => Utils.orIfNull(options?.onchange, _ => {})(input.value));
        return element;
    }
    
    /** 
     * @param {string} name
     * @param {string} value
     * @param {OptionConfig<string> | undefined} options
     */
    static createOptionColor(name, value, options = undefined) {
        const element = /** @type {Element} */ (Utils.notNull(document.querySelector("#instances>#entry-color")).cloneNode(true));
        Utils.notNull(element.querySelector(".option-name>span")).textContent = name;
    
        const color = /** @type {HTMLInputElement} */ (Utils.notNull(element.querySelector(".option-color")));
        const text = /** @type {HTMLInputElement} */ (Utils.notNull(element.querySelector(".option-value")));

        if (options?.readonly) {
            color.disabled = true;
            text.disabled = true;
        }

        const validation = ValidationProvider.color;
    
        validation.setter(color, value);
        validation.setter(text, value);
    
        color.addEventListener('input', _ => ValidationProvider.syncValidation(color, text, validation, options?.onchange));
        text.addEventListener('input', _ => ValidationProvider.syncValidation(text, color, validation, options?.onchange));
        return element;
    }
    
    /** 
     * @param {string} name
     * @param {number} value
     * @param {OptionConfig<number> | undefined} options
     * @param {boolean} isDouble
     */
    static #createOptionNumber(name, value, options, isDouble) {
        const element = /** @type {HTMLElement} */ (Utils.notNull(document.querySelector("#instances>#entry-number")).cloneNode(true));
        Utils.notNull(element.querySelector(".option-name>span")).textContent = name;
        
        const input = /** @type {HTMLInputElement} */ (Utils.notNull(element.querySelector(".option-value")));
        
        if (options?.readonly) {
            input.disabled = true;
        }

        const validation = isDouble ? ValidationProvider.double : ValidationProvider.integer;
    
        validation.setter(input, value);
    
        input.addEventListener('input', _ => ValidationProvider.changeValidation(input, validation, options?.onchange));
        return element;
    }
    
    /** 
     * @param {string} name
     * @param {number} value
     * @param {OptionConfig<number> | undefined} options
     */
    static createOptionInteger(name, value, options = undefined) {
        return Options.#createOptionNumber(name, value, options, false);
    }
    /** 
     * @param {string} name
     * @param {number} value
     * @param {OptionConfig<number> | undefined} options
     */
    static createOptionDouble(name, value, options = undefined) {
        return Options.#createOptionNumber(name, value, options, true);
    }
    
    /** 
     * @param {string} name
     * @param {Array<string> | Object.<string,string>} values
     * @param {string} selected
     * @param {OptionConfig<string> | undefined} options
     */
    static createOptionSelect(name, values, selected, options = undefined) {
        const element = /** @type {Element} */ (Utils.notNull(document.querySelector("#instances>#entry-select")).cloneNode(true));
        Utils.notNull(element.querySelector(".option-name>span")).textContent = name;
    
        const select = /** @type {HTMLSelectElement} */ (Utils.notNull(element.querySelector(".option-value")));
    
        if (options?.readonly) {
            select.disabled = true;
        }

        const select_item = /** @type {HTMLOptionElement} */ (Utils.notNull(select.querySelector("#select-item")).cloneNode(true));
        const select_item_current = /** @type {HTMLOptionElement} */ (Utils.notNull(select.querySelector("#select-item-current")).cloneNode(true));
    
        select.innerHTML = "";

        const isArray = Array.isArray(values);

        for (const [key, data] of Object.entries(values)) {
            let value;
            let display;
            if (isArray) {
                value = data;
                display = data;
            } else {
                value = key;
                display = data;
            }

            const item = value === selected ? select_item_current : select_item;
            const element = /** @type {HTMLOptionElement} */ (item.cloneNode(true));
            element.value = value;
            element.text = display;
            select.add(element);
        }
    
        select.addEventListener('change', _ => {
            const onchange = options?.onchange;
            if (onchange !== undefined) {
                onchange(select.value);
            }
        });
        select_item.remove();
        select_item_current.remove();
        return element;
    }
}