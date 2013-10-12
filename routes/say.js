// routes/say.js

var mongoose = require("mongoose");

exports.get_url = "/say/:id";

exports.get = function(req, res) {
    var Say = mongoose.model("Say");
    var id = req.params.id;
    Say.findById(id, function(err, say) {
        if (err != null) {
            res.send("404", 404);
        }
        else if (say == null) {
            res.send("404", 404);
        }
        else {
            say.renderMarkdown()
                .then(function(rendered_html) {
                    
                    res.render("say", {
                        title: "@" + say.name + " on " + (say.date_str),
                        date: say.date,
                        html: rendered_html,
                        date_str: say.readableDateStr(),
                        _id: say._id,
                        raw_markdown: (say.raw_markdown || "").replace(/(^\s+)|(\s+$)/g, "")
                    });
                });
        }
    });
};
