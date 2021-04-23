/*
 * Copyright (c) 2021 Coremail.cn, Ltd. All Rights Reserved.
 */

const fs = require('fs');
const webpack = require('webpack');
const config = require('./webpack.config');

// build uncompressed
webpack({
    ...config,
    entry        : {'EPromise' : './lib/mainEntry'},
    optimization : {...config.optimization, minimize : false},
}).run(webpackCallback);

// build minimized
webpack(config).run(webpackCallback);

function log(msg) {
    log.logged ? console.log('') : (log.logged = true); // add blank line
    console.log(msg);
}

function webpackCallback(err, stats) {
    if (err) {
        process.exit(1);
    }
    log(stats.toString());
    convert(Object.keys(stats['compilation']['assets']).filter(x => /EPromise(\.min)?\.js/.test(x))[0]);
}

log('generating CommonJS modules sources');
fs.mkdirSync('dist/cjs', {recursive : true});
fs.readdirSync('lib', 'utf8').filter(x => /mjs$/.test(x)).forEach(file => {
    const content = fs.readFileSync(`lib/${file}`, 'utf8');
    fs.writeFileSync(`dist/cjs/${file.replace(/mjs$/, 'js')}`, content
            .replace(/export const (\w+)/g, 'const $1 = exports.$1')
            .replace(/export default (\w+)/g, 'module.exports = $1')
            .replace(/import (?:\* as (\w+)|({[^}]+})) from '([^']+).mjs'/g, "const $1$2 = require('$3.js')")
    );
    console.log(`  - dist/cjs/${file.replace(/mjs$/, 'js')}`);
})

function convert(file) {
    const content = fs.readFileSync(`dist/${file}`, 'utf8');
    const cjsFile = file.replace(/^EPromise/, 'EPromiseCJS');
    fs.writeFileSync(`dist/${file}`, content
            .replace(/\bself.EPromise\b/, 'EPromise'));
    fs.writeFileSync(`dist/${cjsFile}`, content
            .replace(/\bself.EPromise\b/, 'module.exports'));
    console.log(`asset ${cjsFile} ${fs.statSync(`dist/${cjsFile}`).size} bytes [converted to CommonJS]`)
}
