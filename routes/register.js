// routes/login.js
var config = require('../config');
exports.get_url = '/register';
exports.get = function(req, res){
  res.render('register', { title: config.TITLE });
};
