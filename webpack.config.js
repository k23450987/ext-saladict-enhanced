const config = require('neutrino')().webpack();

module.exports = {
  ...config,
  devtool: 'source-map',
  resolve: {
    ...config.resolve,
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
  }
}
