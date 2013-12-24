// routes/search.js
var config = require("../config");
var mongoose = require("mongoose");
var _ = require("lodash");
var Q = require("q");
exports.post_url = "/search";
exports.post = function(req, res) {
  var query = req.param("search-query");
  var splitted_query = query.split(" ");
  // this is naive implmentation
  mongoose.model("Say")
    .find()
    .exec(function(err, all_says) {
      var matched_says = _.remove(all_says, function(say) {
        var text = say.raw_markdown;
        if (text) {
          for (var i = 0; i < splitted_query.length; i++) {
            if (text.indexOf(splitted_query[i]) == -1) {
              return false;
            }
          }
          return true;
        }
        else {
          return false;
        }
      });
      Q.allSettled(matched_says.map(function(say) { return say.renderMarkdown(); }))
        .then(function(says_html) {
          res.render("search", {
            says: matched_says,
            says_html: says_html.map(function(v) { return v.value}),
            //title: "search result of \"" + query + "\": matched " + matched_says.length,
            title: config.TITLE,
            query: query,
            logged_in: req.isAuthenticated(),
            nickname: req.isAuthenticated() ? req.user.nickname : null,
            placeholder: query
          });
        });
    });
};
