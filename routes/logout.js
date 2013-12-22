// routes/logout

exports.get_url = '/logout';
exports.get = function(req, res) {
  if (req.isAuthenticated()) {
    req.logout();
    res.redirect('/login');
  }
  else {
    res.redirect('/');
  }
};
