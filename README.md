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

      Any of these system-wide solutions seems not suitable for apps in most scenario, this extension can take care of this
      simpler and lightweight

      Promise rejection will all handled by default `uncaught` (regist in prototype), without any global pollution

- Other extensions

  such as `onRTN / onERR / fin`, and more extentions can be added easily, [see this example](demo/simple-esm.html)

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
        console.log(e); // outout 1      
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

- esm

  Now nodejs does not support esm module import directly, if you are willing to import the esm version, you have to specify the
  full file name with extension
  ```js
  import EPromise from 'e-promises/lib/promise.mjs'
  ```

### Web browser with no bundler

- Ancient browser (with polyfills)
  ```html
  <!-- src="path/to/EPromise.all.min.js" -->
  <script src="dist/EPromise.all.min.js"></script>
  <!--suppress JSUnresolvedVariable -->
  <script>
  EPromise.resolve(); // ...
  </script>
  ```
  [see this example](demo/simple.html)

  if polyfills are not required (etc. injected in other way), the smallest version `dist/EPromise.min.js` should be used.

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
