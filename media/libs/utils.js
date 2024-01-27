//@ts-check

/**
 * @typedef {Object} Random
 * @property {() => number} next
 */

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

    /**
     * @param {string} str
     */
    static #cyrb128(str) {
        let h1 = 1779033703, h2 = 3144134277,
            h3 = 1013904242, h4 = 2773480762;
        for (let i = 0, k; i < str.length; i++) {
            k = str.charCodeAt(i);
            h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
            h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
            h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
            h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
        }
        h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
        h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
        h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
        h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
        h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
        return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
    }
    /**
     * @param {number} a
     * @param {number} b
     * @param {number} c
     * @param {number} d
     */
    static #sfc32(a, b, c, d) {
        return function() {
          a |= 0; b |= 0; c |= 0; d |= 0; 
          var t = (a + b | 0) + d | 0;
          d = d + 1 | 0;
          a = b ^ b >>> 9;
          b = c + (c << 3) | 0;
          c = (c << 21 | c >>> 11);
          c = c + t | 0;
          return (t >>> 0) / 4294967296;
        };
    }
    /**
     * @param {string} seed
     * @returns {Random}
     */
    static random(seed) {
        const raw = Utils.#cyrb128(seed);
        const func = Utils.#sfc32(raw[0], raw[1], raw[2], raw[3]);
        return {
            next: func
        };
    }

    /**
     * 
     * @param {number} value 
     * @param {number} digits 
     * @returns {string}
     */
    static toHex(value, digits = 2) {
        const hex = value.toString(16);
        const append = Math.max(0, digits - hex.length);
        return '0'.repeat(append) + hex;
    }

    /**
     * @param {number} h [0;1]
     * @param {number} s [0;1]
     * @param {number} v [0;1]
     */
    static asHsv(h, s, v) {
        let r, g, b;

        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);

        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
            default: r = 0, g = 0, b = 0; break;
        }

        return Utils.toHex(Math.round(r * 255)) + Utils.toHex(Math.round(g * 255)) + Utils.toHex(Math.round(b * 255));
    }
}
