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