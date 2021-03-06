// webpack.config.js
var Encore = require('@symfony/webpack-encore');

Encore
// directory where all compiled assets will be stored
    .setOutputPath('web/build/')

    // what's the public path to this directory (relative to your project's document root dir)
    //.setPublicPath('/hots_webapp/web/build')
    // setPublicPath holds both the production relpath, and the dev relpath
    // Encore determines its production status based on how files were compiled, ie:
    // "./node_modules/.bin/encore" dev
    // "./node_modules/.bin/encore" production
    .setPublicPath(Encore.isProduction() ? '/build' : '/hots_webapp/web/build')
    .setManifestKeyPrefix('build')

    // empty the outputPath dir before each build
    .cleanupOutputBeforeBuild()

    // will output as web/build/app.js
    //.addEntry('app', './assets/js/main.js')
    .addEntry('hotstatus-bootstrap-select', './assets/js/hotstatus-bootstrap-select.js')
    .addEntry('hotstatus', './assets/js/hotstatus.js')
    .addEntry('heroes-statslist', './assets/js/heroes-statslist.js')
    .addEntry('hero-loader', './assets/js/hero-loader.js')
    .addEntry('player-loader', './assets/js/player-loader.js')
    .addEntry('player-hero-loader', './assets/js/player-hero-loader.js')
    .addEntry('player-heroes-statslist', './assets/js/player-heroes-statslist.js')
    .addEntry('rankings-loader', './assets/js/rankings-loader.js')

    // will output as web/build/global.css
    //.addStyleEntry('global', './assets/css/global.scss')
    .addStyleEntry('base', './assets/css/base.css')

    // allow sass/scss files to be processed
    .enableSassLoader()

    // allow legacy applications to use $/jQuery as a global variable
    //.autoProvidejQuery()

    .enableSourceMaps(!Encore.isProduction())

    // create hashed filenames (e.g. app.abc123.css)
    .enableVersioning()
;

// export the final configuration
module.exports = Encore.getWebpackConfig();