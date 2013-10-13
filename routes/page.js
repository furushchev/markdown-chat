// routes/page.js

var mongoose = require("mongoose");
var config = require("../config");

exports.get_url = "/page/:page_id";

exports.get = function(req, res) {
    var page_id = parseInt(req.params.page_id, 10);
    if (!page_id) page_id = 0;
    
    var Say = mongoose.model("Say");
    Say.find().skip(config.PAGE_MAX * page_id).limit(config.PAGE_MAX)
        .exec(function(err, says) {
            if (err != null) {
                res.send("500", 500);
            }
            else if (says.length == 0) {
                res.send("404", 404);
            }
            else {
                Say.countObject()
                    .then(function(count) {
                        // resolve pager
                        var pager_length = 2;
                        var page_count = count / pager_length;
                        var min_index = page_id - pager_length > 0 ? page_id - pager_length: 0;
                        var max_index = page_id + pager_length < page_count ? page_id + pager_length: page_count - 1;
                        console.log(page_id);
                        console.log(min_index);
                        console.log(max_index);
                        res.render("page", {
                            says: says,
                            title: config.TITLE,
                            count: page_count,
                            index: page_id,
                            min_index: min_index,
                            max_index: max_index,
                        });
                    }, function(err) {
                        res.send("500", 500);
                    });
            }
        });
};
