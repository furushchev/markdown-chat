// routes/login.js
var config = require('../config');
exports.get_url = '/login';
exports.get = function(req, res) {
  res.render('login', { title: config.TITLE });
};
