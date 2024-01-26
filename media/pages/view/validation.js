//@ts-check

/**
 * @type {ValidationProvider}
 */
class ValidationProvider {
    /**
     * @template T
     * @param {RegExp} regex
     * @param {GetterFunc<T>} getter
     * @param {SetterFunc<T>} setter
     * @returns {ValidationElement<T>}
     */
    static #createValidation(regex, getter, setter) {
        return {
            validate: value => regex.test(String(value)),
            getter: getter,
            setter: setter
        };
    }

    static color = ValidationProvider.#createValidation(new RegExp(/^#(?:[0-9a-fA-F]{6})$/), e => e.value, (e, v) => e.value = v);
    static double = ValidationProvider.#createValidation(new RegExp(/^\d+(?:.\d+|)$/), e => e.valueAsNumber, (e, v) => e.valueAsNumber = v);
    static integer = ValidationProvider.#createValidation(new RegExp(/^\d+$/), e => {
        const value = e.valueAsNumber;
        const castValue = value | 0;
        if (value !== castValue) {
            e.valueAsNumber = castValue;
        }
        return castValue;
    }, (e, v) => e.valueAsNumber = v | 0);
    
    /** 
     * @template T
     * @param {HTMLInputElement} target
     * @param {HTMLInputElement} other
     * @param {ValidationElement<T>} validation
     * @param {CallbackFunc<T> | undefined} onchange
     */
    static syncValidation(target, other, validation, onchange) {
        const newValue = validation.getter(target);
        const oldValue = validation.getter(other);
        if (newValue !== oldValue) {
            if (validation.validate(newValue)) {
                target.setAttribute('valid', 'true');
                other.setAttribute('valid', 'true');
                validation.setter(other, newValue);
                if (onchange !== undefined) {
                    onchange(newValue);
                }
            } else {
                target.setAttribute('valid', 'false');
            }
        }
    }
    
    /** 
     * @template T
     * @param {HTMLInputElement} target
     * @param {ValidationElement<T>} validation
     * @param {CallbackFunc<T> | undefined} onchange
     */
    static changeValidation(target, validation, onchange) {
        const newValue = validation.getter(target);
        if (validation.validate(newValue)) {
            target.setAttribute('valid', 'true');
            if (onchange !== undefined) {
                onchange(newValue);
            }
        } else {
            target.setAttribute('valid', 'false');
        }
    }
}