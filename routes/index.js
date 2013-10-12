var _ = require("lodash");
var files = ["_index"];

exports.routes = _.map(files, function(f) {
    return require("./" + f);
});
