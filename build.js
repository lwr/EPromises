/*
 * Copyright (c) 2021 Coremail.cn, Ltd. All Rights Reserved.
 */

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
}
