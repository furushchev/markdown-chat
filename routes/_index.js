/*
 * GET home page.
 */
var config = require('../config');

exports.get_url = '/';
exports.get = function(req, res){
  if (req.isAuthenticated()) {
    res.render('index', {
      title: process.env.MD_TITLE || 'Markdown Chat',
      logged_in: true,
      nickname: req.user.nickname,
      user_id: req.user._id
    });
  }
  else {
    res.render('index', {
      title: process.env.MD_TITLE || 'Markdown Chat',
      logged_in: false
    });
  }
};
