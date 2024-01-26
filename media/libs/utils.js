//@ts-check

/**
 * @type {Utils}
 */
class Utils {
    /**
     * @template T
     * @param {T | null | undefined} value
     * @returns {T}
     */
    static notNull(value) {
        if (value === null || value === undefined) {
            throw Error('nullable value');
        }
        return value;
    }
    
    /**
     * @template T
     * @param {T | null | undefined} value
     * @param {T} other
     * @returns {T}
     */
    static orIfNull(value, other) {
        if (value === null || value === undefined) {
            return other;
        }
        return value;
    }
    
    /**
     * @template T
     * @param {((value:T)=>void) | null | undefined} callback
     * @param {T} value 
     */
    static orEmptyCallback(callback, value) {
        if (callback === null || callback === undefined) {
            return;
        }
        callback(value);
        return;
    }
}
