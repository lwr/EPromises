/*
 * Copyright (c) 2018 Coremail.cn, Ltd. All Rights Reserved.
 */


// See: https://stackoverflow.com/questions/41792036/extending-a-promise-in-javascript/41792085#41792085
// Extends from Promise is not yet possible with ES5

import * as _ from './fn.mjs';
import {extendsClass, extendsError} from './proto.mjs';

const Super = Promise, undefined = _.noop(); // eslint-disable-line no-shadow-restricted-names

/**
 * A Promise extension: {@link EPromise}.
 * @module
 */

const /** @class */ Rethrow = extendsError('Rethrow', function (caught) {
    delete this.message;
    this.caught = caught;
    throw this; // eslint-disable-line no-throw-literal
});
const rethrow = _.fn(Rethrow, 0);
const abort = _.fn(Rethrow, 1);

// promise chain type bits
const ON_FULFILLED = 1, ON_REJECTED = 2, ON_FIN = 4, ON_FINALLY = 8;

// noinspection JSCheckFunctionSignatures
/**
 * A simple promise extension.
 *
 * This extension implements these features:
 * <ul>
 *     <li>Tuple supports: resolve / reject with multiple values, passing directly to thenable callbacks
 *     <li>Centralized error handling: promise rejection will all handled by default `EPromise#uncaught`
 * </ul>
 *
 * @class EPromise
 * @extends Promise
 */
const EPromise = extendsClass(Super, 'EPromise', /** @lends EPromise# */ {

    /** @see Promise#finally */
    finally : PRESERVE_STATE(ON_FULFILLED | ON_REJECTED | ON_FINALLY),

    /**
     * Attaches a callback that is invoked when the Promise is fulfilled.
     *
     * 1. if callback returns undefined (void), the promise fulfilled state will not be changed
     * 2. or else, it acts just like {@link #then}
     * 3. passing by any simple object (no callback), even `undefined`, will change the promise state directly
     *
     * @param {function|*} [onFulfilled] the callback function or else any simple object
     */
    onRTN : PRESERVE_STATE(ON_FULFILLED),

    /**
     * Attaches a callback that is invoked when the Promise is rejected.
     * <p>
     * different with {@link #catch}, this callback will not 'catch' any failure, but just bubble it up by default.
     *
     * 1. if callback returns undefined (void), the promise rejected state will not be changed
     * 2. or else, it acts like {@link #catch}, but do not drop the error, {@link #uncaught} will be called
     * 3. passing by any simple object (no callback), even `undefined`, will change the promise state directly,
     *    and {@link #uncaught} should be called for this case
     *
     * @param {function|*} [onRejected] the callback function or else any simple object
     */
    onERR : PRESERVE_STATE(ON_REJECTED),

    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected).
     * <p>
     * different with {@link #finally}, this callback passes the promise state to callback function and has option to
     * change the promise state by returning new values.
     *
     * 1. if callback returns undefined (void), the promise state will not be changed
     * 2. or else, it will change the promise state, if previous state is 'reject', {@link #uncaught} will be called
     * 3. passing by any simple object (no callback), even `undefined`, will change the promise state directly,
     *    and {@link #uncaught} should be called if previous state is rejected
     *
     * Callback arguments:<ul>
     * <li>while resolved -> `onSettled(true, ...result)`
     * <li>while rejected -> `onSettled(false, ...error)`
     *
     * @param {function|*} [onSettled] the callback function or else any simple object
     */
    fin : PRESERVE_STATE(ON_FULFILLED | ON_REJECTED | ON_FIN),

    /** convert `null / undefined / nothing / false / 0 / NaN` to silent reject */
    truthy : PRESERVE_STATE(ON_FULFILLED, t => { t || abort() }),

    /** skip the default uncaught handler if rejected */
    silent : PRESERVE_STATE(ON_REJECTED, abort),

    /** @type {function(...*)} - provided centralized error handling mechanism */
    // uncaught(...errArray) // reject(1, 2) // Uncaught (in promise): 1 2
    uncaught : _.fn(console.error, 'Uncaught (in promise):'),

}, initialize, 0);

/**
 * Promise callback chain to preserve previous promise state by default.
 *
 * returning `undefined` will not change the promise state, promise rejection would bubble up, or handled by {@link EPromise#uncaught}
 *
 * promise callback processing
 *  - if `instantCallback` specified, it is the promise callback.
 *  - or else, if passing a function as promise callback, it will be the callback function
 *  - if passing a non callback argument (except for `finally`), all arguments will be the new promise state, for example
 *          ```js
 *          EPromise.resolve(1, 2, 3).onRTN(4, 5).then(console.log) // output 4, 5 (all previous state are dropped)
 *          ```
 *          especially, no argument passing in is also a new promise state, for example
 *          ```js
 *          EPromise.resolve(1, 2, 3).onRTN().then(function() { console.log(arguments.length) }) // output 0
 *          ```
 *
 * @param {int} type - bit mask of: {@link ~ON_FULFILLED} | {@link ~ON_REJECTED} | {@link ~ON_FINALLY} | {@link ~ON_FIN}
 * @param {function|*} [instantCallback]
 * @private
 */
function PRESERVE_STATE(type, instantCallback) {
    /** @this {EPromise} */
    return function (callback) {
        // noinspection JSBitwiseOperatorUsage
        const hook = typeBit => (type & typeBit) && (
            _.isFUN(callback = instantCallback || callback)
                // strictly specified by `finally`, callback receive no arguments, return value will ignore
                ? (type & ON_FINALLY) ? () => { callback() }
                    // specified by `fin`, callback receives  `(true | false, ...result | ...error)`
                    : (type & ON_FIN) ? _.fn(callback, typeBit < ON_REJECTED)
                        : callback
                // except for `finally`, the passing in arguments will be boxed as new promise state
                : (type & ON_FINALLY) || _.fn(makePromise, /* default EPromise constructor */0, callback, arguments)
        );
        return this.then(hook(ON_FULFILLED), hook(ON_REJECTED), PRESERVE_STATE)
    }
}

// noinspection JSCheckFunctionSignatures
const /** @class */ Wrapper = extendsClass(Object, 'EPromiseWrapper', {}, function (args, root) {
    this.args = args;
    this.root = root;
});

const PASSTHROUGH = {};
const DURING_RESOLVE = 0;
const DURING_REJECT = 1;
const DURING_UNCAUGHT = 2;

function makePromise(EPromise, arg0 /* value / thenable / promise */, args /* [_, ... remains] | null */) {
    EPromise = promiseClass(EPromise);
    const root = (arg0 instanceof EPromise) ? arg0 : new EPromise()/* Object.create(EPromise.prototype) */;
    const future = wrap(arg0, args, false, root);
    return root === future ? root : construct(EPromise, root, future)
}

function construct(EPromise, root, thenable) {
    return (function construct(self, thenable) {

        let uncaught = 1;

        // promiseA.then() => promiseB
        // while promiseB registering new uncaught handling, the previous registry for promiseA must be clear,
        // so, one error should be processed only once
        thenable.then(undefined, err => { uncaught && proxyCall(0, DURING_UNCAUGHT, 0, err) });

        // adapt `promise.then` to supports general tuple arguments and uncaught handling
        function proxyCall(fn, during, helper, x) {
            const preserveState = helper === PRESERVE_STATE;
            const duringUncaught = during === DURING_UNCAUGHT;
            const _wrap = (x instanceof Wrapper) ? x : {};
            const _args = _wrap.args || [x];
            /** @type EPromise */
            const _this = _wrap.root || root;

            if (duringUncaught && (_wrap.caught || (x instanceof Rethrow && x.caught))) {
                return;
            }

            let result;
            try {
                result = (fn || (duringUncaught && _this.uncaught) || _.noop).apply(_this, _args);
            } catch (err) {
                if (duringUncaught) {
                    console.error('Uncaught handler threw:', err, x);
                    return;
                }

                if (err instanceof Rethrow) {
                    const caughtArgs = err.caught;
                    if (caughtArgs) {
                        x = (x instanceof Wrapper) ? x : wrap(_args[0], _args, /* isReject= */1);
                        x.caught = 1;
                    }
                    throw x;
                }
                // simple rethrow is also supported // x.catch(err => { throw err })
                if (err instanceof Object && err === _args[0]) throw x;
                if (preserveState) /* state dropped, to avoid error losing, install a new uncaught handler */ self.then();
                throw err;
            }

            if (result === undefined) {
                if (preserveState) /* state preserved */ if (during === DURING_REJECT) throw x; else return x;
                return wrap(result, []);
            } else {
                if (preserveState) /* state dropped, to avoid error losing, install a new uncaught handler */ self.then();
                return wrap(result, [result]);
            }
        }

        // noinspection PointlessBooleanExpressionJS, BadExpressionStatementJS
        /** @lends EPromise# */ void 0 && void { // should be removed by uglify
            constructor          : EPromise,
            catch                : PRESERVE_STATE(ON_REJECTED),
        }

        /** @name EPromise#then */
        self.then = (onFulfilled, onRejected, helper) => {
            const result = (helper === PASSTHROUGH) ? thenable.then(onFulfilled, onRejected)
                /* Object.create(EPromise.prototype) */
                : construct(new EPromise(), thenable.then(
                    _.isFUN(onFulfilled) ? _.fn(proxyCall, onFulfilled, DURING_RESOLVE, helper) : undefined,
                    _.isFUN(onRejected) ? _.fn(proxyCall, onRejected, DURING_REJECT, helper) : undefined
                ));
            uncaught = 0;
            return result;
        };

        return self;
    })(root, thenable);
}

function wrap(/* EPromise | Thenable | any */arg0, args, isReject, initialRoot) {
    args = args || [arg0];
    if (!isReject && arg0 && arg0.then) {
        // passing wrapper through multiple promise chain `then` to an other EPromise instance
        arg0 = (arg0 instanceof Super) ? arg0 : Super.resolve(arg0);
        if (args.length === 1) {
            return arg0.then(undefined, undefined, PASSTHROUGH);
        } else {
            return arg0.then(wrapper, e => { throw wrapper(e) }, PASSTHROUGH);
        }
    }
    return (initialRoot ? Super.resolve(wrapper(arg0)) : wrapper(arg0));

    function wrapper(x) {
        if ((args = Array.from(args)).length) {
            args[0] = (x instanceof Wrapper) ? x.args[0] : x;
        }
        return Wrapper(args, (x instanceof Wrapper) ? x.root : initialRoot);
    }
}


/** find out if we are called from an EPromise subclass */
function promiseClass(type) { return (type && type.prototype /* is subClass of */ instanceof EPromise) ? type : EPromise; }


/**
 * The promise constructor (using executor).
 * @this Class<EPromise> this EPromise subclass or even null
 * @param {Function} [executor]
 * @see PromiseConstructorLike
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/Promise
 */
function initialize(executor) {
    if (executor) {
        _.isFUN(executor) || new Super(executor) // TypeError(`Promise resolver ${executor} is not a function`)
        construct(this.constructor, this, new Super((resolve, reject) => {
            executor(function (x) { resolve(wrap(x, arguments)) }, function (e) { reject(wrap(e, arguments, true)) })
        }));
    }
}

/**
 * The promise constructor, extends {@link Promise.resolve} for tuple support.
 * @this Class<EPromise> this EPromise subclass or even null
 * @param {T | PromiseLike<T>} [result]
 * @return {EPromise<T>} A promise whose internal state matches the provided promise.
 * @template T
 */
EPromise.resolve = function (result/*, ...others */) {
    return makePromise(this, result, arguments)
};


/**
 * The promise constructor, extends {@link Promise.reject} for tuple support.
 * @this Class<EPromise> this EPromise subclass or even null
 * @param {...*} [reason] The reason(s) the promise was rejected.
 * @return {EPromise<*>} A new rejected Promise.
 */
EPromise.reject = function (reason/*, ...others */) {
    return makePromise(this, Super.reject(reason), arguments)
};


/**
 * Like {@link Promise.all}, but no error accessible.
 *
 * any error is handled by default uncaught and result in empty rejection.
 *
 * @this Class<EPromise> this EPromise subclass or even null
 */
EPromise.all = function (values) {
    return makePromise(this, Super.all(Array.from(values, p => makePromise(EPromise, p).then() && p))).catch(_.noop).truthy();
};

/**
 * Adaption for jQuery Deferred API.
 * @see https://api.jquery.com/jQuery.when/ $.when
 */
EPromise.when = function () {
    const Promise = promiseClass(this);
    return Promise.all(arguments).then(resultArray => Promise.resolve(...resultArray));
};

/**
 * Uses in catch callbacks to rethrow unhandled error.
 * If error is already processed, to preserve the promise rejected state, {@link abort} should be used instead.
 * @throws {Rethrow} Always
 */
EPromise.rethrow = rethrow;

/**
 * Uses in promise callbacks to escape, clearing uncaught state, to skip default error handler.
 *
 * Different with {@link reject}, {@link reject} returns a new rejected promise, {@link abort} just throws,
 * and skip the default error handler.
 *
 * ---
 * to simulate async-await returns, for example
 * ```js
 * async () => {
 *      if (await conditionA(await getX())) {
 *          return
 *      }
 *      if (await conditionB(await getY())) {
 *          return
 *      }
 *      // ...
 * }
 *
 * // no async-await (simulated)
 * EPromise.resolve()
 *     .then(getX)
 *     .then(x => { conditionA(x).truthy(EPromise.abort) })
 *     .then(getY)
 *     .then(y => { conditionB(y).truthy(EPromise.abort) })
 *     .then(() => {
 *         // ...
 *     });
 *     // different with async-await version, there is a promise reject as last, but skipped
 * ```
 *
 * @throws {Rethrow} Always
 */
EPromise.abort = abort;

export default EPromise;
