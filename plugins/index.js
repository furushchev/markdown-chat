var _ = require('lodash');
files = ['zatsudan.js'];

exports.plugins = _.map(files, function(f){
  return require('./'+f);
});
