var mongoose = require("mongoose");
var q = require("q");

exports.get_url = "/user/:id";

exports.get = function(req, res, next) {
  var user_id = req.params.id;
  var Say = mongoose.model("Say");
  var User = mongoose.model("User");
  User.findById(user_id, function(err, user) {
    if (err != null) {
      next(err);
    }
    else if (user == null) {
      next(404);
    }
    else { 
      Say.find({user: user_id}, function(err, says) {
        if (!says) {
          says = [];
        }
        q.allSettled(says.map(function(say) {
          return say.renderMarkdown();
        }))
          .then(function(results) {
            res.render("user", {
              title: "MarkdownChat",
              logged_in: req.isAuthenticated(),
              nickname: (req.user || {}).nickname,
              user_id: (req.user || {})._id,
              user_name: user.nickname,
              htmls: results.map(function(r) {
                return r.value;
              })
            });
          });
      });
    }
  });
};
