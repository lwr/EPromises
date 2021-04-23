/*
 * Copyright (c) 2018 Coremail.cn, Ltd. All Rights Reserved.
 */

// see https://github.com/inferpse/es3-harmony-webpack-plugin

const name = 'ES3HarmonyPlugin';

module.exports = class ES3HarmonyPlugin {
    apply({hooks, webpack : {javascript : {JavascriptModulesPlugin}}}) {
        // noinspection JSUnresolvedVariable
        hooks.compilation.tap({name}, compilation => {
            // noinspection JSUnresolvedVariable, JSUnresolvedFunction
            JavascriptModulesPlugin.getCompilationHooks(compilation).renderMain.tap({name}, replaceSource)
        });
    }
};

function replaceSource(source) {
    source = source['original'] ? source['original']() : source;
    if (source['getChildren']) {
        source['getChildren']().forEach(replaceSource);
    } else {
        // pattern: RegExp|substr, replacement: newSubstr|function
        replacements.forEach(([pattern, replacement]) => {
            if (pattern.test(source.source())) {
                source._value = source.source().replace(pattern, replacement);
            }
        });
    }
}

const toRegExp = s => new RegExp(s.trim().replace(/[?.[\]()]/g, '\\$&').replace(/^\s+/mg, '\\s*'), 'g');
const replacements = [
    [toRegExp(`
    __webpack_require__.r = function(exports) {
        if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
        }
        Object.defineProperty(exports, '__esModule', { value: true });
    };`), `
    __webpack_require__.r = function(exports) {
        // removed by ${name}
    };`.trim()],
    // remove "use strict"
    [/(['"])use\s+strict(['"]);?/gm, ''],
];
