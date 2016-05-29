const NODE_ENV = process.env.NODE_ENV;
const dotenv   = require('dotenv');

const webpack = require('webpack');
const fs      = require('fs');
const path    = require('path'),
      join    = path.join,
      resolve = path.resolve;

const getConfig = require('hjs-webpack');

const isDev    = NODE_ENV == 'development';
const isTest   = NODE_ENV == 'test';

const root    = resolve(__dirname);
const src     = resolve(root, 'src');
const modules = resolve(root, 'node_modules');
const dest    = resolve(root, 'dist');

var config = getConfig({
  isDev,
  in:     join(src, 'app.js'),
  out:    dest,
  clearBeforeBuild: true
});

const dotEnvVars     = dotenv.config();
const environmentEnv = dotenv.config({
  path: join(root, 'config', `${NODE_ENV}.config.js`),
  silent: true
});

const envVariables = Object.assign({}, dotEnvVars, environmentEnv);

const defines =
  Object.keys(envVariables)
    .reduce((memo, key) => {
      const val = JSON.stringify(envVariables[key]);
      memo[`__${key.toUpperCase()}__`] = val;

      return memo;
    }, {
      __NODE_ENV__: JSON.stringify(NODE_ENV)
    });

config.plugins = [
  new webpack.DefinePlugin(defines)
].concat(config.plugins);

const cssModuleNames = `${isDev ? '[path][name]__[local]__' : ''}[hash:base64:$]`;

const matchCssLoaders = /(^|!)(css-loader)($|!)/;

const findLoader = (loaders, match) => {
  const found = loaders.filter(l => l && l.loader && l.loader.match(match));

  return found ? found[0] : null;
};

const cssloader = findLoader(config.module.loaders, matchCssLoaders);

const newloader = Object.assign({}, cssloader, {
  test: /\.module\.css$/,
  include: [src],
  loader: cssloader.loader.replace(matchCssLoaders, `$1$2?modules&localIdentName=${cssModuleNames}$3`)
});

config.module.loaders.push(newloader);

cssloader.test = new RegExp(`[^module]${cssloader.test.source}`);
cssloader.loader = newloader.loader;

config.module.loaders.push({
  test: /\.css$/,
  include: [modules],
  loader: 'style!css'
});

config.postcss = [].concat([
  require('precss')({}),
  require('autoprefixer')({}),
  require('cssnano')({})
]);

config.resolve.root = [src, modules];
config.resolve.alias = {
  'css':        join(src, 'styles'),
  'containers': join(src, 'containers'),
  'components': join(src, 'components'),
  'utils':      join(src, 'utils')
};

if(isTest) {
  config.externals = {
    'react/lib/ReactContext': true,
    'react/lib/ExecutionEnvironment': true
  };

  config.plugins = config.plugins.filter(p => {
    const name    = p.constructor.toString();
    const fnName  = name.match(/^function (.*)\((.*\))/);

    const idx = [
      'DedupePlugin',
      'UglifyJsPlugin'
    ].indexOf(fnName[1]);

    return idx < 0;
  })
}

module.exports = config;
