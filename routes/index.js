var _ = require('lodash');
var files = ['_index', 'say', 'page', 'search', 'login', 'register', 'logout', 'user',
            'profile'];

exports.routes = _.map(files, function(f) {
    return require('./' + f);
});
