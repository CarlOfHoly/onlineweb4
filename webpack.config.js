const path = require('path');
const BundleTracker = require('webpack-bundle-tracker');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const fs = require('fs');

// webpack-extra-resolve is generated by webpack_resolve.py
const extraResolveFile = 'webpack-extra-resolve.json';
// Extra resolve path for static files
// This should be used if any Python packages contain static files that webpack needs
let resolvePaths = [];
if (fs.existsSync(extraResolveFile)) {
  resolvePaths = JSON.parse(fs.readFileSync(extraResolveFile, 'utf-8')).paths;
} else {
  console.error('Start the django web server before running webpack'); // eslint-disable-line no-console
  process.exit(1);
}

/*
  A base configuration for webpack.
  Both the webpack dev server and production config extend from this
*/
const webpackConfig = {
  context: __dirname,
  // Sourcemapping. eval-source-map shows original code as source map and has decent rebuild speed
  devtool: 'eval-source-map',
  // Entries sshould be added to django templates using render_bundle with both js and css
  // e.g: {% render_bundle 'entryName' 'js' %}
  // Try to reuse existing entries instead of creating more
  entry: {
    articleDetails: [
      './assets/article/details/index',
    ],
    articleArchive: [
      './assets/article/archive/index',
    ],
    authentication: [
      './assets/authentication/index',
    ],
    core: [
      './assets/core/index',
    ],
    dashboard: [
      './assets/dashboard/core/index',
    ],
    dashboardApproval: [
      './assets/dashboard/approval/index',
    ],
    dashboardArticle: [
      './assets/dashboard/article/index',
    ],
    dashboardAuthentication: [
      './assets/dashboard/authentication/index',
    ],
    dashboardCareeropportunity: [
      './assets/dashboard/careeropportunity/index',
    ],
    dashboardChunks: [
      './assets/dashboard/chunks/index',
    ],
    dashboardEvents: [
      './assets/dashboard/events/index',
    ],
    dashboardGallery: [
      './assets/dashboard/gallery/index',
    ],
    dashboardGroups: [
      './assets/dashboard/groups/index',
    ],
    dashboardInventory: [
      './assets/dashboard/inventory/index',
    ],
    dashboardMarks: [
      './assets/dashboard/marks/index',
    ],
    dashboardPosters: [
      './assets/dashboard/posters/index',
    ],
    dashboardWebshop: [
      './assets/dashboard/webshop/index',
    ],
    eventsArchive: [
      './assets/events/archive/index',
    ],
    eventsDetails: [
      './assets/events/details/index',
    ],
    feedback: [
      './assets/feedback/index',
    ],
    frontpage: [
      './assets/frontpage/index',
    ],
    genfors: [
      './assets/genfors/index',
    ],
    mailinglists: [
      './assets/mailinglists/index',
    ],
    offline: [
      './assets/offline/index',
    ],
    profiles: [
      './assets/profiles/index',
    ],
    sso: [
      './assets/sso/index',
    ],
    resourcecenter: [
      './assets/resourcecenter/index',
    ],
    webshop: [
      './assets/webshop/index',
    ],
    wiki: [
      './assets/wiki/index',
    ],
  },
  // Webpack's resolve magic https://webpack.github.io/docs/resolving.html
  resolve: {
    // Makes it possible to write `import 'common/blabla'` to avoid a bunch of ../../
    root: path.resolve(__dirname, './assets/'),
    // Extra resolve paths like wiki static files
    fallback: resolvePaths,
  },
  // Generated bundles output
  output: {
    // This path should be added to django's static file paths
    path: path.resolve('./bundles/webpack/'),
    // [name] is the entry name and [hash] is a unique hash for each compilation
    filename: '[name]-[hash].js',
  },
  // Externally managed dependencies
  // Ideally all dependencies should come from npm, but this is not always possible
  externals: {
    // django-js-reverse adds a global Urls object which we use to generate urls in javascript
    urls: 'Urls',
  },
  module: {
    /*
      By default webpack does not know what to do when importing files
      We need to specify regexes (test) to tell webpack what to do with the various file types

      Loaders using `loader1!loader2` syntax is evaluated right to left
      which means that higher level loaders should be on the rightmost side
    */
    loaders: [
      {
        // With a few expections we need to run all js files
        // through babel to transpile ES6 to ES5
        test: /\.js$/,
        // Somehow babel fucks up jqplot
        exclude: /(node_modules|jqplot\.\w+\.js)/,
        loaders: ['babel'],
      },
      {
        // Hack for modules that depend on global jQuery
        // https://webpack.js.org/guides/shimming/#imports-loader
        test: /(node_modules\/bootstrap\/.+|jquery.jqplot|jqplot\.\w+)\.js$/,
        loader: 'imports?jQuery=jquery,$=jquery,this=>window',
      },
      {
        test: /\.css$/,
        loader:
          // Load CSS by inserting <style> elements. Necessary for hot reloading
          'style-loader!' +
          // CSS + sourcemapping
          'css-loader?sourceMap!',
      },
      {
        // Like .css execept that we run the file through a less transpiler first
        test: /\.less$/,
        loader:
          'style-loader!' +
          'css-loader?sourceMap!' +
          'less-loader?sourceMap',
      },
      {
        // webpack can import images from both javascript and css
        // By using url-loader we can inline small images (<10kB) in css
        test: /\.(png|gif|jpe?g)$/,
        loader: 'url-loader?limit=10000',
      },
      {
        /*
          Importing fonts.
          The `(\?[a-z0-9=&.]+)?` part is because font-awesome adds a query-string
          with the version number to the font url which is completely useless for us
        */
        test: /\.(eot|svg|ttf|woff|woff2)(\?[a-z0-9=&.]+)?$/,
        loader: 'url-loader?limit=10000',
      },
    ],
  },
  plugins: [
    // If several entries import the same code we can avoid duplication
    // of dependencies by adding it to a common entry which all entries can import from
    new CommonsChunkPlugin({
      names: ['common'],
      minChunks: 2,
    }),
    // This is how we tell django which entries exist and where they are stored
    new BundleTracker({ filename: './webpack-stats.json' }),
  ],
};

// Add abakus override if instructed to do so
if (process.env.OW4_ABAKUS_OVERRIDE && process.env.OW4_ABAKUS_OVERRIDE.toLowerCase() === 'true') {
  webpackConfig.entry.core.push('./assets/core/z_override_abakus');
}

module.exports = webpackConfig;