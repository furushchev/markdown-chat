var _ = require("lodash");
var files = ["_index", "say", "page"];

exports.routes = _.map(files, function(f) {
    return require("./" + f);
});
