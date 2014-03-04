var mongoose = require('mongoose');
var q = require('q');
var gravatar = require('gravatar');

exports.get_url = '/user/:id';

exports.get = function(req, res, next) {
  var user_id = req.params.id;
  var Say = mongoose.model('Say');
  var User = mongoose.model('User');
  var my_user_id = null;
  if (req.isAuthenticated()) {
    my_user_id = req.user._id;
  }
  User.findById(user_id, function(err, user) {
    if (err !== null) {
      next(err);
    }
    else if (user === null) {
      next(404);
    }
    else {
      Say.find({user: user_id})
        .populate('user')
        .exec(function(err, says) {
          if (!says) {
            says = [];
          }
          q.allSettled(says.map(function(say) {
            return say.renderMarkdown(my_user_id);
          }))
            .then(function(results) {
              var latest_say = {};
              if (says.length > 0) {
                latest_say = says[0];
              }
              res.render('user', {
                title: process.env.MD_TITLE || 'Markdown Chat',
                logged_in: req.isAuthenticated(),
                nickname: (req.user || {}).nickname,
                user_id: (req.user || {})._id,
                user_name: user.nickname,
                gravatar_url: latest_say.user.getIconURL(),
                htmls: results.map(function(r) {
                  return r.value;
                })
              });
            });
        });
    }
  });
};
