# EPromise [![npm](https://img.shields.io/npm/v/e-promises.svg)][npm-url]

A simple promise extension with tuple state and centralized error handling supports in size less than 3kb.

[![NPM](https://nodei.co/npm/e-promises.png)][npm-url]

[npm-url]: https://npmjs.org/package/e-promises

## Introduction

- Primary scopes
    - Tuple supports

      resolve / reject with multiple values, passing directly to thenable callbacks, for example
      ```js
      EPromise((resolve, reject) => succeed ? resolve(result, meta) : reject(errors))
              .onERR(processWithErrors)
              .then(processWithResultAndMeta)
      ```

    - Centralized error handling

      We already have [UnhandledRejection](https://developer.mozilla.org/en-US/docs/Web/API/Window/unhandledrejection_event)
      and [NodeJS equivalent](https://nodejs.org/dist/latest-v16.x/docs/api/process.html#process_event_unhandledrejection), read
      this [for more information](https://github.com/domenic/unhandled-rejections-browser-spec)

      Any of these system-wide solutions seems not suitable for apps in most scenarios, this extension can take care of this
      simpler and lightweight

      Promise rejection will all be handled by default `uncaught` (registered in the prototype), without any global pollution

- Other extensions

  Such as `onRTN / onERR / fin`, and more extensions can be added easily, [see the documentation](#documentations).

## Compatibility

- IE6+ (polyfills required for ES7- browsers)
- NodeJS

## Limitation

`async await` interoperation

- only the first of the tuple could be seen by `await`

    ```js
    console.log(await EPromise.resolve(1, 2)); // output 1

    try {
        await EPromise.reject(1, 2);
    } catch (e) {
        console.log(e); // output 1      
    }  
    ```

- `await` for rejected promise doesn't trigger registered default uncaught handler, but system-wide `UnhandledRejection` would

    ```js
    // expected behaviour: handled by default uncaught, such as output `Uncaught (in promise): 1` in error console   
    EPromise.reject(1);
   
    // default uncaught not called, an exception is thrown here instead 
    await EPromise.reject(1);
                                                               
    // workaround: add `onERR` at last, default uncaught would be called, but promise state changes to resolved 
    const result = await EPromise.reject(1).onERR(null); // result is `null`, no exception thrown, you have to check null
    ```

## Install

```bash
npm install e-promises
```

## Usage

### Bundler (webpack etc)

- esm (recommended)
    ```js
    import EPromise from 'e-promises'
    ```

- CommonJS
    ```js
    const EPromise = require('e-promises')
    ```

### NodeJS

- CommonJS (recommended)
  ```js
  const EPromise = require('e-promises')
  ```

- ESM

  Now Nodejs does not support ESM module import directly, if you are willing to import the ESM version, you have to specify the full file name with extension
  ```js
  import EPromise from 'e-promises/lib/promise.mjs'
  ```

### Web browser with no bundler

- The ancient browser (with polyfills)
  ```html
  <!-- src="path/to/EPromise.all.min.js" -->
  <script src="dist/EPromise.all.min.js"></script>
  <!--suppress JSUnresolvedVariable -->
  <script>
  EPromise.resolve(); // ...
  </script>
  ```
  [see this example](demo/simple.html)

  if polyfills are not required (etc. injected in another way), the smallest version `dist/EPromise.min.js` should be used.

- Modern browser with esm supports
  ```html
  <!--suppress ES6UnusedImports, JSUnresolvedVariable -->
  <script type="module">
  // from 'path/to/promise.mjs'
  import EPromise from './lib/promise.mjs';
  
  EPromise.resolve(); // ...
  </script>
  ```
  [see this example](demo/simple-esm.html)

## Documentations

### `EPromise.all`

It is similar to [`Promise.all`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all), but it throws an error even if the error has been caught:

```js
Promise.all([Promise.reject(-1)]).catch(() => console.log('caught')); // => 'caught'

EPromise.all([EPromise.reject(-1)]) // => throw "Uncaught (in promise): -1"
    .catch(() => console.log('caught')); // => 'caught'
```

### `EPromise.when`

It is similar to [`jQuery.when`](https://api.jquery.com/jquery.when/):

```js
EPromise.all([EPromise.resolve(1), EPromise.resolve(2)]).then(console.log) // => [1, 2]
EPromise.when(EPromise.resolve(1), EPromise.resolve(2)).then(console.log); // => 1 2
```

It also short-circuits when one promise is rejected:

```js
EPromise.when(
    EPromise.resolve(2),
    EPromise(resolve => setTimeout(() => resolve(1))).then(console.log)
).then(() => console.log('resolved'));
// => 1
// => resolved

EPromise.when(
    EPromise.reject(-1), // throws "Uncaught (in promise): -1"
    EPromise(resolve => setTimeout(() => resolve(1))).then(console.log)
).then(() => {}, () => console.log('rejected'));
// => rejected
// => 1
```

### `EPromise.abort`

In the case when we have handled some error in a callback method and hope to silently reject the promise (it means won't be caught by the uncaught handler), we can use `EPromise.abort`:

```js
EPromise.resolve(1).then(v => v !== 1
    || EPromise.reject('should not throw 1')); // => throw "Uncaught (in promise): should not throw 1"

EPromise.resolve(1).then(v => v !== 1
    || console.log('should not throw 1') + EPromise.abort()); // => "should not throw 1"
```

### `EPromise.rethrow`

When we have caught some error in a callback method and hope to rethrow unhandled error, we can use `EPromise.rethrow`:

```js
EPromise.reject(-1).then(() => {}, v => v !== -1
    ? console.log('handle when not rejected with -1')
    : EPromise.rethrow()); // => throw "Uncaught (in promise): -1"
```

### `EPromise.prototype.uncaught`

As mentioned above, we can define a global handler when the rejected value is uncaught:

```js
/** @override */
EPromise.prototype.uncaught = function () {
    throw new Error(`Uncaught (in promise): ${[].join.call(arguments, ', ')}`);
};
```

### `EPromise.prototype.{onRTN,onERR,fin,finally}`

These methods provide a way to attach a callback method invoked when the promise is fulfilled, rejected or settled:

|                            | Invoked When | Callback Arguments                                        |
|:---------------------------|:------------:|:----------------------------------------------------------|
| EPromise.prototype.onRTN   |  fulfilled   | function (fulfilledValue)                                 |
| EPromise.prototype.onERR   |   rejected   | function (rejectedValue)                                  |
| EPromise.prototype.fin     |   settled    | function (isFulfilled: boolean, fulfilledOrRejectedValue) |
| EPromise.prototype.finally |   settled    | function ()                                               |

```js
EPromise.resolve(1).onRTN(console.log); // => 1
EPromise.reject(-1).onERR(console.log); // => -1

EPromise.resolve(1).fin(console.log); // => true 1
EPromise.resolve(1).finally(console.log); // =>
```

If these methods return `undefined` (nothing), they won't change the state of the promise chain:

```js
EPromise.resolve(1).onRTN(() => {}).then(console.log); // => 1
EPromise.reject(-1).onERR(() => void 0).then(() => {}, console.log); // => -1

EPromise.resolve(1).fin(() => {}).then(console.log); // => 1
EPromise.resolve(1).finally(() => {}).then(console.log); // => 1
```

If return values (something), they can change the state based on what they return:

```js
EPromise.resolve(1).onRTN(() => EPromise.reject(-1)).then(() => {}, console.log); // => -1
EPromise.reject(-1).onERR(() => EPromise.resolve(1)) // => throw "Uncaught (in promise): -1"
    .then(console.log); // => 1
```

### `EPromise.prototype.truthy`

With this method, you can make a promise fulfilled only when a truthy value (except for `null` / `undefined` / `nothing` / `false` / `0` / `NaN`) is resolved:

```js
EPromise.resolve(false).then(console.log); // => false
EPromise.resolve(false).truthy().then(() => {}, console.log); // => false
```

*Notice that: such a rejected state is silent which won't throw errors when it is uncaught.*

```js
EPromise.resolve(false).then(v => v || EPromise.reject(v)); // => throw  "Uncaught (in promise): false"
EPromise.resolve(false).truthy(); // => (silent but the promise is rejected)
```

### `EPromise.prototype.silent`

To skip the default handler of EPromise:

```js
EPromise.reject(-1); // => throw "Uncaught (in promise): -1"
EPromise.reject(-1).silent(); // => (silent and no error is thrown)
```
