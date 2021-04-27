/*
 * Copyright (c) 2018 Coremail.cn, Ltd. All Rights Reserved.
 */

export const noop = () => {};
export const isFUN = x => x instanceof Function;

/**
 * Bind partial arguments, ignoring `this`.
 * @see https://lodash.com/docs/4.17.15#partial lodash.partial
 */
export const fn = function (func) {
    // compatible with IE such as `console.error` is not a `Function'
    return fn.bind.apply(fn.call, [func, 0].concat([].slice.call(arguments, 1)));
};
