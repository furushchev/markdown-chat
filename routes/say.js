// routes/say.js

var mongoose = require("mongoose");

exports.get_url = "/say/:id";

exports.get = function(req, res) {
    var Say = mongoose.model("Say");
    var id = req.params.id;
    Say.find({_id: id}).populate("user").exec(function(err, says) {
      if (err != null) {
        res.send("404", 404);
      }
      else if (says == null || says.length == 0) {
        res.send("404", 404);
      }
      else {
        var say = says[0];
        say.renderMarkdown()
          .then(function(rendered_html) {
            res.render("say", {
              title: process.env.MD_TITLE || "Markdown Chat",
              date: say.date,
              html: rendered_html,
              date_str: say.readableDateStr(),
              _id: say._id,
              raw_markdown: (say.raw_markdown || "")
                .replace(/(^\s+)|(\s+$)/g, "")
            });
          });
      }
    });
};
