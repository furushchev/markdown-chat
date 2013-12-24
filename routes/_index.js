/*
 * GET home page.
 */
var config = require("../config");

exports.get_url = "/";
exports.get = function(req, res){
  if (req.isAuthenticated()) {
    res.render('index', {
      title: config.TITLE,
      logged_in: true,
      nickname: req.user.nickname
    });
  }
  else {
    res.render('index', {
      title: config.TITLE,
      logged_in: false
    });
  }
};
