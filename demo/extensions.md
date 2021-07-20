## EPromise API extensions

### `EPromise.all`

It is similar to [`Promise.all`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all),
but the error is only accessible by its own promise:

```js
Promise.all([Promise.reject(1), Promise.reject(2)]).catch(err => console.log(`caught ${err}`));
// => [INFO]  caught 1 // second error is lost

EPromise.all([EPromise.reject(1), EPromise.reject(2)]).catch(err => console.log(`caught ${err}`));
// => [ERROR] Uncaught (in promise): 1
// => [ERROR] Uncaught (in promise): 2
// => [INFO]  caught undefined
```

### `EPromise.when`

For `EPromise` has tuple supports, it is recommended to use `when` rather than `all`, similar
to [`jQuery.when(deferreds)`](https://api.jquery.com/jquery.when/):

```js
EPromise.all([EPromise.resolve(1), EPromise.resolve(2)]).then(console.log);
// => [INFO] [1, 2]
EPromise.when(EPromise.resolve(1), EPromise.resolve(2)).then(console.log);
// => [INFO] 1 2
```

### `EPromise.abort`

Silent rejection and keep all errors:

```js
EPromise.resolve(1).then(() => EPromise.abort()).then(() => console.log('never see this'));
// => (Nothing happen)

EPromise.reject(-1).then(() => EPromise.abort()).catch(it => console.log(`you still can catch ${it}`));
// => [INFO] you still can catch -1
```

### `EPromise.rethrow`

As its name, just rethrow the caught errors.

```js
EPromise.reject(1, 2).catch((x, y) => x === y || EPromise.rethrow());
// [ERROR] Uncaught (in promise): 1 2

EPromise.reject(1, 1).catch((x, y) => x === y || EPromise.rethrow());
// (Nothing happen)
```

### `EPromise.prototype.uncaught`

As mentioned above, we can define a global handler when the rejected value is uncaught:

```js
/** @override */
EPromise.prototype.uncaught = function () {
    throw new Error(`Uncaught (in promise): ${[].join.call(arguments, ', ')}`);
};
```

### `EPromise.prototype.{onRTN,onERR,fin}`

These methods provide a way to attach a callback method invoked when fulfilled, rejected or settled:

|                            | Invoked When | Callback Arguments                                        |
|:---------------------------|:------------:|:----------------------------------------------------------|
| EPromise.prototype.onRTN   |  fulfilled   | function (...resolved tuple values)
| EPromise.prototype.onERR   |  rejected    | function (...rejected tuple values)
| EPromise.prototype.fin     |  settled     | function (isFulfilled: boolean, resolved or rejected tuple values)

```js
EPromise.resolve(1).onRTN(console.log);
// => [INFO]  1
EPromise.reject(-1).onERR(console.log);
// => [INFO]  -1
// => [ERROR] Uncaught (in promise): -1

EPromise.resolve(1).fin(console.log);
// => [INFO] true 1
EPromise.resolve(1).finally(console.log);
// => // empty line
```

If callback returns `undefined`, the state of the promise will not be changed:

```js
EPromise.resolve(1).onRTN(() => {}).then(console.log, console.error);
// => [INFO]  1
EPromise.reject(-1).onERR(() => {}).then(console.log, console.error);
// => [ERROR] -1

EPromise.resolve(1).fin(() => {}).then(console.log, console.error);
// => [INFO]  1
EPromise.reject(-1).fin(() => {}).then(console.log, console.error);
// => [ERROR] -1
```

If callback return any other value, promise state will change to resolved with it:

```js
EPromise.resolve(1).onRTN(() => 2).then(console.log, console.error);
// => [INFO] 2
EPromise.reject(-1).onERR(() => 2).then(console.log, console.error);
// => [INFO] 2
// => Uncaught (in promise): -1
EPromise.resolve(1).onRTN(() => Promise.resolve()).then(console.log, console.error);
// => [INFO] undefined // explict returns a thennable object to force promise state to change  
```

### `EPromise.prototype.truthy`

Simulating `if (await future) positive operations else negative operations`, only fulfilled for a truthy value 
(except `null` / `undefined` / `nothing` / `false` / `0` / `NaN`) is resolved, or else silently rejected:

```js
EPromise.resolve(false).truthy().then(console.log, console.error);
// => [ERROR] false

EPromise.resolve(false).truthy().then(console.log);
// (Nothing happen)
```
