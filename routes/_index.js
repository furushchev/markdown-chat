/*
 * GET home page.
 */
var config = require("../config");

exports.get_url = "/";
exports.get = function(req, res){
  res.render('index', { title: config.TITLE });
};
