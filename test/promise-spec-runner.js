/*
 * Copyright (c) 2018 Coremail.cn, Ltd. All Rights Reserved.
 */

const isDeepStrictEqual = require('deep-is');

const declare = typeof it !== 'undefined' && it; // using jasmine
const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent /* running in karma-jasmine */ : '';
const sequential = typeof process !== 'undefined' && process.argv.includes('-s');

module.exports = (...args) => declare ? describe('EPromise', () => runTests(...args)) : runTests(...args)

function runTests(EPromise, extendsClass) {

    const Rethrow = (() => { try { EPromise.rethrow() } catch (t) { return t.constructor } })();

    const log = Symbol('[log]'), err = Symbol('[err]');
    // noinspection JSUnusedLocalSymbols, JSUnresolvedFunction, DuplicatedCode, JSVoidFunctionReturnValueUsed
    const tests = [[
        // place holder for index 0
        /* eslint-disable no-throw-literal, no-return-assign */

        // Test cases start
    ], (EP, console, i) => [EP.resolve().then(console.log), [log],
    ], (EP, console, i) => [EP.resolve(i).then(console.log), [log, i],
    ], (EP, console, i) => [EP.resolve(i, 'foo').then(console.log), [log, i, 'foo'],
    ], (EP, console, i) => [EP.resolve(i, 'foo').then().then(console.log), [log, i, 'foo'],
    ], (EP, console, i) => [EP.reject(), [err, 'Uncaught (in promise):'],
    ], (EP, console, i) => [EP.reject().catch(console.error), [err],
    ], (EP, console, i) => [EP.reject(i), [err, 'Uncaught (in promise):', i],
    ], (EP, console, i) => [EP.reject(i).catch(console.error), [err, i],
    ], (EP, console, i) => [EP.reject(i, 'foo'), [err, 'Uncaught (in promise):', i, 'foo'],
    ], (EP, console, i) => [EP.reject(i, 'foo').catch(console.error), [err, i, 'foo'],
    ], (EP, console, i) => [EP.reject(i, 'foo').then().catch(console.error), [err, i, 'foo'],


    ], (EP, console, i) => [
        EP.reject(i, 'foo').catch((x, ...args) => [x * 100, console.log(args)][0]).then(console.log).then(console.log),
        [log, ['foo']], [log, i * 100], [log],
    ], (EP, console, i) => [
        EP.reject(i, 'foo').catch(x => { throw x * 10 }).catch(x => { throw x * 10 }),
        [err, 'Uncaught (in promise):', i * 100],

    ], (EP, console, i) => [
        EP.resolve(i, 'foo').then(console.log).then(console.log).then(() => { throw 666 }),
        [log, i, 'foo'],
        [log],
        [err, 'Uncaught (in promise):', 666],


    ], (EP, console, i, it = EP.reject(i)) => [
        'Branches - each branch promise should have it\'s own handler',
        it.catch(x => { throw x * 10 }), it.catch(x => { throw x * 100 }),
        [err, 'Uncaught (in promise):', i * 10], [err, 'Uncaught (in promise):', i * 100],


    ], (EP, console, i) => [
        'Null uncaught - error suppressed (don\'t use)',
        Object.assign(EP.reject(i), {uncaught : null}),

    ], (EP, console, i) => [
        'Extension: fin / finally / onERR - no side effect, just for watching',
        EP.resolve(i, 'foo').fin(console.log).fin(console.log).finally(console.log),
        [log, true, i, 'foo'],
        [log, true, i, 'foo'],
        [log],
    ], (EP, console, i) => [
        EP.reject(i, 'foo').onERR(console.log).onERR(console.log),
        [log, i, 'foo'],
        [log, i, 'foo'],
        [err, 'Uncaught (in promise):', i, 'foo'],
    ], (EP, console, i) => [EP.reject(i, 'foo').fin(console.log), [log, false, i, 'foo'], [err, 'Uncaught (in promise):', i, 'foo'],
    ], (EP, console, i) => [EP.reject(i, 'foo').finally(console.log), [log], [err, 'Uncaught (in promise):', i, 'foo'],
    ], (EP, console, i) => [
        Object.assign(EP.reject(i, 'context'), {foo : 1}).onERR(console.error),
        [err /*                     */, i, 'context'],
        [err, 'Uncaught (in promise):', i, 'context', {'foo' : 1}],
    ], (EP, console, i) => [EP.reject(i, 'foo').fin((ok, x) => x + 1).then(console.log),
                            [log, i + 1], [err, 'Uncaught (in promise):', i, 'foo'],
    ], (EP, console, i) => [EP.reject(i, 'bar').onERR(x => x + 2).then(console.log),
                            [log, i + 2], [err, 'Uncaught (in promise):', i, 'bar'],

    ], (EP, console, i) => [
        'Extension: onERR - new exception',
        EP.reject(i, 'foo').onERR(() => EP.reject('new exception')),
        [err, 'Uncaught (in promise):', i, 'foo'],
        [err, 'Uncaught (in promise):', 'new exception'],
    ], (EP, console, i) => [
        EP.reject(i, 'foo').onERR(() => { throw 'new exception' }),
        [err, 'Uncaught (in promise):', 'new exception'],
        [err, 'Uncaught (in promise):', i, 'foo'],

    ], (EP, console, i) => [
        'Extension: fin / onERR - convert fail to nothing / others',
    ], (EP, console, i) => [EP.reject([i], 'foo').fin(/* nothing */).catch(console.log), [err, 'Uncaught (in promise):', [i], 'foo'],
    ], (EP, console, i) => [EP.reject([i], 'bar').onERR(/* nothing */).catch(console.log), [err, 'Uncaught (in promise):', [i], 'bar'],
    ], (EP, console, i) => [EP.reject(i).fin(/* nothing */).tap(), [err, 'Uncaught (in promise):', i], [log],
    ], (EP, console, i) => [EP.reject(i).onERR(/* nothing */).tap(), [err, 'Uncaught (in promise):', i], [log],
    ], (EP, console, i) => [EP.reject(i).fin([]).tap(), [err, 'Uncaught (in promise):', i], [log, []],
    ], (EP, console, i) => [EP.reject(i).onERR([]).tap(), [err, 'Uncaught (in promise):', i], [log, []],
    ], (EP, console, i) => [EP.resolve(i).fin([]).tap(), [log, []],
    ], (EP, console, i) => [EP.resolve(i).onERR([]).tap(), [log, i],

    ], (EP, console, i, delay = _delay(0, EP)) => [
        'Promise.all vs EPromise.all',
        // using Promise.all with EPromise will cause all errors dropped silently (catches by Promise.all and ignored)
        // So dont use Promise.all for that case
        Promise.all([delay.reject(i), delay.reject('disappears')]).catch(console.log),
        [log, i],
        // EPromise.all is justified that errors never dropped silently (would handled by default uncaught)
    ], (EP, console, i, delay = _delay(0, EP)) => [
        EP.all([delay.reject(i + 0, 'foo'), delay.reject(i + 1, 'bar')]).tap(),
        [err, 'Uncaught (in promise):', i + 0, 'foo'],
        [err], // EPromise.all always catch nothing
        [err, 'Uncaught (in promise):', i + 1, 'bar'],
    ], (EP, console, i, delay = _delay(0, EP)) => [
        EP.all([delay.resolve(i + 2, 'foo'), delay.resolve(i + 3, 'bar')]).tap(),
        [log, [i + 2, i + 3]],
    ], (EP, console, i, delay = _delay(0, EP)) => [
        EP.all([delay.resolve(i + 4, 'foo'), delay.reject(i + 5, 'bar')]).then(console.log, () => { throw i + 6 }),
        [err, 'Uncaught (in promise):', i + 5, 'bar'],
        [err, 'Uncaught (in promise):', i + 6],
    ], (EP, console, i, delay = _delay(0, EP)) => [
        EP.when(delay.resolve(i + 4, 'foo'), delay.reject(i + 5, 'bar')).then(console.log, () => { throw i + 6 }),
        [err, 'Uncaught (in promise):', i + 5, 'bar'],
        [err, 'Uncaught (in promise):', i + 6],
    ], (EP, console, i) => [
        EP.all([]).tap(), EP.all([i, i + 1]).tap(),
        [log, []], [log, [i, i + 1]],
    ], (EP, console, i) => [
        EP.when().tap(), EP.when(i, i + 1).tap(),
        [log], [log, i, i + 1],


    ], (EP, console, i) => [
        'Executor factory: new EPromise((resolve, reject)=> {...})',
        new EP(resolve => resolve(i, 'foo')).tap(),
        [log, i, 'foo'],

    ], (EP, console, i) => [
        'Executor factory: EPromise((resolve, reject)=> {...})',
        (EP(resolve => resolve(i, 'foo'))).tap(),
        [log, i, 'foo'],
    ], (EP, console, i) => [
        EP((_, reject) => reject(i, 'foo')).tap(),
        [err, i, 'foo'],
        [err, 'Uncaught (in promise):', i, 'foo'],
    ], (EP, console, i) => [
        EP(resolve => resolve(i)).tap(),
        [log, i],
    ], (EP, console, i) => [
        EP((_, reject) => reject(i)).tap(),
        [err, i],
        [err, 'Uncaught (in promise):', i],
    ], (EP, console, i) => [
        (() => {
            try {
                EP('[INVALID]')
            } catch (e) { console.error(e) }
        })(),
        [err, TypeError],


    ], (EP, console, i) => [
        'Passthrough - new created EPromise can pass back to parents',
        (EP.resolve(i, 'foo1').then(x => EP.reject(x + 1, 'bar1'))),
        [err, 'Uncaught (in promise):', i + 1, 'bar1'],
    ], (EP, console, i, it = EP.resolve(i, 'foo2')) => [
        it.then(x => EP.reject(x + 1, 'bar2')), it.then(x => EP.reject(x + 2, 'foobar2')),
        [err, 'Uncaught (in promise):', i + 1, 'bar2'], [err, 'Uncaught (in promise):', i + 2, 'foobar2'],
    ], (EP, console, i, _err = i => _uncaught(console, i)) => [
        Object.assign(EP.resolve(i), {foo : 0, uncaught : _err(0)})
            .then(x => Object.assign(EP.resolve(x + 1, 'context1'), {foo : 1, uncaught : _err(1)}))
            .then(x => Object.assign(EP.resolve(x + 1, 'context2'), {foo : 2, uncaught : _err(2)}))
            .tap(),
        [log, i + 2, 'context2'],
    ], (EP, console, i, _err = i => _uncaught(console, i)) => [
        Object.assign(EP.reject(i), {foo : 0, uncaught : _err(0)})
            .catch(x => Object.assign(EP.reject(x + 1, 'context1'), {foo : 1, uncaught : _err(1)}))
            .catch(x => Object.assign(EP.reject(x + 1, 'context2'), {foo : 2, uncaught : _err(2)}))
            .tap(),
        [err, i + 2, 'context2'],
        [err, 'Uncaught (in promise2):', i + 2, 'context2', {foo : 2}],   // triggered by second rejected promise (uncaught)
    ], (EP, console, i, _err = i => _uncaught(console, i)) => [
        Object.assign(EP.resolve(i), {foo : 0, uncaught : _err(0)})
            .then(x => Object.assign(EP.resolve(x + 1, 'context1'), {foo : 1, uncaught : _err(1)}))
            .fin((...args) => Promise.reject(args)),
        [err, 'Uncaught (in promise0):', [true, i + 1, 'context1'], {foo : 0}], // triggered by fin -> root uncaught
    ], (EP, console, i, _err = i => _uncaught(console, i)) => [
        Object.assign(EP.resolve(i), {foo : 0, uncaught : _err(0)})
            .then(x => Object.assign(EP.reject(x + 1, 'context1'), {foo : 1, uncaught : _err(1)}))
            .tap(),
        [err, i + 1, 'context1'],
        [err, 'Uncaught (in promise1):', i + 1, 'context1', {foo : 1}],   // triggered by the rejected promise (uncaught)
    ], (EP, console, i, _err = i => _uncaught(console, i)) => [
        Object.assign(EP.resolve(i), {foo : 0, uncaught : _err(0)})
            .then(x => Object.assign(EP.resolve(x + 1, 'context1'), {foo : 1, uncaught : _err(1)}))
            .fin((...args) => EP.reject(...args)),
        [err, 'Uncaught (in promise):', true, i + 1, 'context1'],         // triggered by fin -> new created promise
    ], (EP, console, i, _err = i => _uncaught(console, i)) => [
        Object.assign(EP.resolve(i), {foo : 0, uncaught : _err(0)})
            .then(x => Object.assign(EP.reject(x + 1, 'context1'), {foo : 1, uncaught : _err(1)}))
            .tap(),
        [err, i + 1, 'context1'],
        [err, 'Uncaught (in promise1):', i + 1, 'context1', {foo : 1}],   // triggered by the rejected promise (uncaught)


    ], (EP, console, i, _err = i => _uncaught(console, i)) => [
        'Rethrows',
        Object.assign(EP.reject(i), {foo : 0, uncaught : _err(0)})
            .catch(x => Object.assign(EP.reject([x + 1], 'context1'), {foo : 1, uncaught : _err(1)}))
            .catch(err => { throw err }),        // rethrow is handled by original promise source
        [err, 'Uncaught (in promise1):', [i + 1], 'context1', {foo : 1}],
    ], (EP, console, i, _err = i => _uncaught(console, i)) => [
        Object.assign(EP.reject(i), {foo : 0, uncaught : _err(0)})
            .catch(x => Object.assign(EP.reject(`${x + 1}`, 'context1'), {foo : 1, uncaught : _err(1)}))
            .catch(err => { throw err }),        // rethrow not supported for primary types (strings, numbers, etc)
        [err, 'Uncaught (in promise0):', `${i + 1}`, {foo : 0}],
    ], (EP, console, i, _err = i => _uncaught(console, i)) => [
        Object.assign(EP.reject(i), {foo : 0, uncaught : _err(0)})
            .catch(x => Object.assign(EP.reject(`${x + 1}`, 'context1'), {foo : 1, uncaught : _err(1)}))
            .catch(_ => EP.rethrow()),     // so we heed EPromise.rethrow()
        [err, 'Uncaught (in promise1):', `${i + 1}`, 'context1', {foo : 1}],

    ], (EP, console, i) => [
        'Rethrows: silent rethrow (abort) should keep errors',
        EP.reject(i).catch(EP.abort).catch(console.log), [log, i],
    ], (EP, console, i, _err = i => _uncaught(console, i)) => [
        Object.assign(EP.reject(i), {foo : 0, uncaught : _err(0)})
            .catch(x => Object.assign(EP.reject(`${x + 1}`, 'context1'), {foo : 1, uncaught : _err(1)}))
            .catch(EP.abort)   // silent rethrow
            .catch((...x) => [console.log('still can catch', ...x), EP.rethrow()]),
        [log, 'still can catch', `${i + 1}`, 'context1'],
    ], (EP, console, i, _err = i => _uncaught(console, i)) => [
        Object.assign(EP.reject(i), {foo : 0, uncaught : _err(0)})
            .catch(x => Object.assign(EP.reject([x + 1], 'context1'), {foo : 1, uncaught : _err(1)}))
            .catch(err => EP.reject(err)), // no rethrow, new rejected event triggered
        [err, 'Uncaught (in promise0):', [i + 1], {foo : 0}],

    ], (EP, console, i) => [
        'Rethrows: rethrow / abort will change state from fulfilled to rejected',
        EP.resolve(i).then(EP.rethrow).tap(),
        [err, i], [err, 'Uncaught (in promise):', i], // reject using last normal result is a-bit weird, but it is for purpose
    ], (EP, console, i) => [
        EP.resolve(i).then(EP.abort).tap(),
        [err, i],

    ], (EP, console, i) => [
        'Rethrows: rethrow / abort in executor', // rethrow in promise construction executor, nothing to unwrap
        EP(EP.rethrow).tap(), [err, Rethrow], [err, 'Uncaught (in promise):', Rethrow],
    ], (EP, console, i) => [
        EP(EP.abort).tap(), [err, Rethrow], // nothing uncaught (silent throw)

    ], (EP, console, i) => [
        'Rethrows: truthy',
        EP.resolve().truthy().tap(), [err], // fail with nothing
    ], ...[1, true, 'foo', {foo : 1}, [1]].map(v => (EP, console, i) => [
        EP.resolve(v).truthy().tap(), [log, v],
    ]), ...[null, undefined, false, 0, '', NaN].map(v => (EP, console, i) => [
        EP.resolve(v).truthy().tap(), [err, v],
    ]), ...[ //

    ], (EP, console, i) => [
        'Resolve with simple thenable',
        EP.resolve({then : resolve => resolve(i, 'optional args should be ignored')}).tap(),
        [log, i],
    ], (EP, console, i) => [
        EP.resolve({then : resolve => resolve(i)}, 'optional args').tap(),
        [log, i, 'optional args'],
    ], (EP, console, i) => [
        EP.resolve({then : (_, reject) => reject(i, 'optional args should be ignored')}),
        [err, 'Uncaught (in promise):', i],
    ], (EP, console, i) => [
        EP.resolve({then : (_, reject) => reject(i)}),
        [err, 'Uncaught (in promise):', i],
    ], (EP, console, i) => [
        EP.resolve(Promise.reject(i)),
        [err, 'Uncaught (in promise):', i],


    ], (EP, console, i) => [
        'Return with simple thenable',
        EP.resolve().then(() => ({then : resolve => resolve(i, 'optional args should be ignored')})).tap(),
        [log, i],

    ]].slice(1).map((x, i) => Object.assign(x, {index : i + 1})); // Test cases end, make it 1-base


    const _delay = (time = 0, EP = Promise) => ({
        resolve : (...x) => new EP(resolve => setTimeout(() => resolve(...x), time)),
        reject  : (...x) => new EP((_, reject) => setTimeout(() => reject(...x), time)),
    });

    const _uncaught = (console, x) => function () {
        const entries = Object.entries(this).filter(([, v]) => !(v instanceof Function));
        console.error(`Uncaught (in promise${x == null ? '' : x}):`, ...arguments, ...!entries.length ? [] : [
            // convert entries array [[k, v], ...] back to plain object
            entries.reduce((obj, [k, v]) => Object.assign(obj, {[k] : v}), {})])
    };

    function run(test) {
        const logged = test.actual = [];
        const loggerFor = type => (...args) => {
            // patch for PhantomJS: `throw []` result in two added property 'line' & 'stack' and causes test fail
            if (userAgent.includes('PhantomJS')) {
                args.forEach((e, i) => {
                    if (e instanceof Array && 'line' in e && 'stack' in e) {
                        args[i] = Array.from(e);
                    }
                })
            }
            logged.push([type, ...args]);
        }
        const hijackedConsole = {log : loggerFor(log), error : loggerFor(err)};

        const result = test(
            Object.assign(extendsClass(EPromise, `EPromise_${test.index}`, {
                uncaught : _uncaught(hijackedConsole),
                tap() { return this.then(hijackedConsole.log).onERR(hijackedConsole.error) && this },
            }), EPromise),
            hijackedConsole,
            test.index);

        const expected = result.filter(Array.isArray);
        const actual = () => logged.map(x => x.map(x => x instanceof Error ? x.constructor : x));

        test.description = (typeof result[0] === 'string') ? result[0] : '';
        const delayed = _delay(sequential ? 10 : 100).resolve().then(() => {
            const sideEffect = sideEffects.delete(0);
            const equal = isDeepStrictEqual(expected, actual());
            test.result = !sideEffect && equal ? 'passed' : 'failed';
            test.error = sideEffect ? '(site effect - console unexpected written)' : null;
            sequential && flush(test);
        });

        declare && declare(`Test-${String(100 + test.index).substr(1)}: ${test.description}`, () => delayed.then(() => {
            expect(actual()).toEqual(expected)
            expect(test.result).toBe('passed')
            expect(test.error).toBeNull()
        }));

        return delayed;
    }

    function flush(x) {
        const lines = [...x.description ? [[`===== ${x.description}`]] : [],
                       ...x.error ? [[x.error]] : [],
                       ...x.actual || []];
        (lines.length ? lines : [[]]).forEach((line, i) => consoleLog(
            i ? '               ' : `Test-${String(100 + x.index).substr(1)} ${x.result || 'aborted'}:`,
            ...line.map(it => it && it.constructor === Symbol ? it.toString().replace(/^Symbol\((.*)\)$/, '$1') : it)
        ));
    }

    const sideEffects = new Set();
    const consoleLog = console.log;
    const consoleErr = console.error;
    console.log = (...args) => sideEffects.add(0) && consoleLog(...args);
    console.error = (...args) => sideEffects.add(0) && consoleErr(...args);

    return (sequential
        ? tests.reduce((promise, test) => promise.then(() => run(test)), Promise.resolve())
        : Promise.all(tests.map(run))
    ).finally(() => {
        console.log = consoleLog;
        console.error = consoleErr;

        declare || sequential || tests.forEach(flush);
        declare || checkResult(tests);
    })
}

function checkResult(tests) {
    const fails = tests.filter(x => x.result !== 'passed').map(x => x.index);
    if (fails.length) {
        console.error(`Test results: ${tests.length - fails.length} / ${tests.length} (passed / total), fail list: ${fails}`);
        process.exit(1);
    } else {
        console.log('All tests passed!');
    }
}
