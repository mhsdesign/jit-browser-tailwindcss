const path = require('path');
const { createLoader } = require('simple-functional-loader');
const { ESBuildMinifyPlugin } = require('esbuild-loader');

const moduleOverrides = {
    fs: path.resolve(__dirname, 'src/mockedModules/fs.js'),
};

const nullExternals = {
    chokidar: 'window.chokidar',
    purgecss: 'window.purgecss',
    tmp: 'window.tmp',
};

const getNullExternal = (context, request, callback) => /node_modules/.test(context) && nullExternals[request]
    ? callback(null, nullExternals[request])
    : callback();

module.exports = {
    // watch: true,
    mode: 'production',
    entry: './src/main.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'umd'
    },
    resolve: {
        alias: moduleOverrides
    },
    module: {
        rules: [
            // mock globs
            // there's some node-specific stuff in parse-glob
            // we don't use globs though so this can be overridden
            {
                test: require.resolve('tailwindcss/node_modules/glob-parent'),
                use: [
                    createLoader(function(_source) { return `module.exports = () => ''`; }),
                ],
            },
            {
                test: require.resolve('is-glob'),
                use: [
                    createLoader(function(_source) { return `module.exports = () => false`; }),
                ],
            },
            {
                test: require.resolve('fast-glob'),
                use: [
                    createLoader(function (_source) { return `module.exports = { sync: (patterns) => [].concat(patterns) }` }),
                ],
            },
        ]
    },
    externals: [
        getNullExternal
    ],
    optimization: {
        minimizer: [
            new ESBuildMinifyPlugin({
                target: 'esnext',
            })
        ]
    }
};
