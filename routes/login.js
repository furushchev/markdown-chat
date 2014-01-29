// routes/login.js
var config = require('../config');
var passport = require('passport');
exports.get_url = '/login';

exports.get = function(req, res) {
  res.render('login', {
    title: process.env.MD_TITLE || "Markdown Chat",
    error: req.flash('error'),
    logged_in: false
  });
};

exports.post_url = '/login';
exports.post = function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      req.flash('error', info.message);
      return res.redirect('/login')
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/');
    });
  })(req, res, next);
};
