/*
 * Copyright (c) 2018 Coremail.cn, Ltd. All Rights Reserved.
 */

const {create} = Object;


// https://stackoverflow.com/questions/5905492/dynamic-function-name-in-javascript/9947842#9947842
function namedFunction(name, fn) {
    // eslint-disable-next-line no-new-func
    return name ? new Function('f', `return function ${name}(){return f.apply(this,arguments)}`)(fn) : fn;
}


/**
 * @param {Function|?} parentClass
 * @param {String}     name
 * @param {Object}     prototype
 * @param {Function}   [initializer]
 * @param {*}          [applySuper=true] - call super constructor before the initializer function
 */
export const extendsClass = function (parentClass, name, prototype, initializer, applySuper) {
    applySuper = applySuper === undefined || applySuper;
    const cls = namedFunction(name, function () {
        const self = (this instanceof cls) ? this : create(cls.prototype);
        applySuper && parentClass.apply(self, arguments);
        initializer && initializer.apply(self, arguments);
        return self;
    });

    cls.prototype = Object.assign(create(parentClass.prototype), prototype, {constructor : cls});
    return cls;
};


/**
 * Customized {@link Error} class.
 *
 * @param {String}   name
 * @param {Function} [initialize]
 */
export const extendsError = function (name, initialize) {
    return extendsClass(Error, name, {
        name,
        toString : function () { return `${this.name}: ${this.message}` },
    }, function (message) {
        this.message = message;
        initialize && initialize.apply(this, arguments);
        this.stack = (Error().stack || '').replace(/^Error$/m, this);
    }, 0);
};
