/*
 * Copyright (c) 2021 Coremail.cn, Ltd. All Rights Reserved.
 */

const {extendsClass} = require('../dist/cjs/proto.js');
const testFor = require('./promise-spec-runner');

const CI = typeof process !== 'undefined' && (process.argv.includes('-ci') || process.env.CI);

(async () => {
    const consoleLog = console.log;
    CI && (console.log = () => {});
    for (const id of [
        '../dist/cjs/promise.js',
        '../dist/EPromiseCJS.js',
        '../dist/EPromiseCJS.min.js',
    ].slice(0, CI ? undefined : 1)) {
        await testFor(require(id), extendsClass);
        CI && consoleLog(`Tests for CommonJS module '${id}' passed`);
    }
})();
