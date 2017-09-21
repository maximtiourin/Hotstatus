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
    .addEntry('jquery', './assets/js/thirdparty/jquery-3.2.1.min.js')
    .addEntry('popper', './assets/js/thirdparty/popper.min.js')
    .addEntry('bootstrap', './assets/js/thirdparty/bootstrap.min.js')
    .addEntry('list', './assets/js/thirdparty/list.min.js')

    // will output as web/build/global.css
    //.addStyleEntry('global', './assets/css/global.scss')
    .addStyleEntry('base', './assets/css/base.css')
    .addStyleEntry('bootstrapStyle', './assets/css/thirdparty/bootstrap.min.css')

    // allow sass/scss files to be processed
    .enableSassLoader()

    // allow legacy applications to use $/jQuery as a global variable
    .autoProvidejQuery()

    .enableSourceMaps(!Encore.isProduction())

    // create hashed filenames (e.g. app.abc123.css)
    .enableVersioning()
;

// export the final configuration
module.exports = Encore.getWebpackConfig();