// routes/login.js
var config = require('../config');
var mongoose = require('mongoose');

var User = mongoose.model('User');

exports.get_url = '/register';

exports.get = function(req, res){
  var error = req.flash('error');
  res.render('register', {
    title: process.env.MD_TITLE || 'Markdown Chat',
    error: error,
    logged_in: false
  });
};

exports.post_url = '/register';
exports.post = function(req, res, next) {
  // creating user
  var nickname = req.param('nickname');
  var email = req.param('email');
  var pass = req.param('password');
  var repass = req.param('repassword');
  // check the arguments
  if (!nickname) {
    req.flash('error', 'You need to fill nickname');
    res.redirect('/register');
  }
  else if (!pass) {
    req.flash('error', 'You need to fill password');
    res.redirect('/register');
  }
  else if (!repass) {
    req.flash('error', 'You need to re-fill password');
    res.redirect('/register');
  }
  else if (pass.toString() !== repass.toString()) {
    req.flash('error', 'password does not match');
    res.redirect('/register');
  }
  else {
    var user = new User({
      nickname: nickname,
      password: pass,
      email: email
    });
    user.save(function(error) {
      if (error) {
        req.flash('error', error.message);
        res.redirect('/register');
      }
      else {
        // success to create new account, force to login automatically
        req.login(user, function(err) {
          if (err) {
            next(err);
          }
          else {
            res.redirect('/');
          }
        });
      }
    });
  }
};
