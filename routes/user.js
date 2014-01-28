var mongoose = require("mongoose");
var q = require("q");

exports.get_url = "/user/:id";

exports.get = function(req, res) {
  var user_id = req.params.id;
  var Say = mongoose.model("Say");
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
        htmls: results.map(function(r) {
          return r.value;
        })
      });
    });
  });
  // console.log(user_id);
  // res.send(200);
};
