const moduleAlias = require('module-alias');
const path = require('path');

moduleAlias.addAliases({
  '@api': path.resolve(__dirname, 'api'),
  '@controllers': path.resolve(__dirname, 'controllers'),
  '@middlewares': path.resolve(__dirname, 'middlewares'),
  '@loaders': path.resolve(__dirname, 'loaders'),
  '@universe': path.resolve(__dirname, 'universe'),
  '@config': path.resolve(__dirname, 'config'),
  '@interfaces': path.resolve(__dirname, 'interfaces'),
  '@services': path.resolve(__dirname, 'services'),
  '@schema': path.resolve(__dirname, 'schema')
}); 