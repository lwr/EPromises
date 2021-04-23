/*
 * Copyright (c) 2021 Coremail.cn, Ltd. All Rights Reserved.
 */

const TerserPlugin = require('terser-webpack-plugin');
const ES3HarmonyPlugin = require('./build/ES3HarmonyPlugin');

module.exports = {
    mode   : 'production',
    target : ['web', 'es5'],

    module : {
        rules : [{
            test : /\..?js$/,
            use  : {
                loader  : 'babel-loader',
                options : {
                    presets : [
                        ['@babel/env', {
                            forceAllTransforms : true,
                            loose              : true,
                            modules            : false, // ES6 modules should be processed only by webpack
                        }],
                    ],
                },
            },
        }],
    },

    entry : {
        'EPromise.min'     : './lib/mainEntry',
        'EPromise.all.min' : ['./lib/polyfill', './lib/mainEntry'],
    },

    optimization : {
        minimizer : [new TerserPlugin({terserOptions : {ie8 : true}})],
    },

    plugins : [new ES3HarmonyPlugin()],
}
