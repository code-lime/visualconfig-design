//@ts-check

/**
 * @template T
 * @typedef {(value:T)=>void} CallbackFunc
 */
/**
 * @template T
 * @typedef {(value:T)=>boolean} ValidateFunc
 */
/**
 * @template T
 * @typedef {(element:HTMLInputElement)=>T} GetterFunc
 */
/**
 * @template T
 * @typedef {(element:HTMLInputElement,value:T)=>void} SetterFunc
 */
/**
 * @template T
 * @typedef {{validate:ValidateFunc<T>,getter:GetterFunc<T>,setter:SetterFunc<T>}} ValidationElement
 */

/**
 * @typedef {'integer' | 'double' | 'color' | 'text' | 'select'} TypeNodeField
 */

/**
 * @typedef {Object} BaseNodeField
 * @property {string} name
 * @property {boolean} readonly
 * @property {TypeNodeField} type
 * @property {number | string} value
 * @property {string | undefined} [group]
 */

/**
 * @typedef {NodeFieldInteger | NodeFieldDouble | NodeFieldColor | NodeFieldText | NodeFieldSelect} AnyNodeField
 */

/**
 * @typedef {Object} _NodeFieldInteger
 * @property {'integer'} type
 * @property {number} value
 * 
 * @typedef {BaseNodeField & _NodeFieldInteger} NodeFieldInteger 
 */
/**
 * @typedef {Object} _NodeFieldDouble
 * @property {'double'} type
 * @property {number} value
 * 
 * @typedef {BaseNodeField & _NodeFieldDouble} NodeFieldDouble 
 */
/**
 * @typedef {Object} _NodeFieldColor
 * @property {'color'} type
 * @property {string} value
 * 
 * @typedef {BaseNodeField & _NodeFieldColor} NodeFieldColor 
 */
/**
 * @typedef {Object} _NodeFieldText
 * @property {'text'} type
 * @property {string} value
 * 
 * @typedef {BaseNodeField & _NodeFieldText} NodeFieldText 
 */
/**
 * @typedef {Object} _NodeFieldSelect
 * @property {'select'} type
 * @property {string} value
 * @property {Array<string>} list
 * 
 * @typedef {BaseNodeField & _NodeFieldSelect} NodeFieldSelect 
 */

/**
 * @typedef {Object} NodeElement
 * @property {number} id
 * @property {string} type
 * @property {Object.<string, AnyNodeField>} fields
 */
