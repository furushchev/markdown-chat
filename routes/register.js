// routes/login.js
var config = require('../config');

exports.get_url = '/register';

exports.get = function(req, res){
  var error = req.flash('error');
  res.render('register', {
    title: config.TITLE,
    error: error
  });
};

exports.post_url = '/register';
exports.post = function(req, res, nex) {
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
    res.send({hello: 'hello'});
  }
};
