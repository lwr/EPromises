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
    // noinspection JSConsecutiveCommasInArrayLiteral
    return func.bind.apply(func, [,].concat([].slice.call(arguments, 1))); // eslint-disable-line no-sparse-arrays, comma-spacing
};
