// model/say.js

var mongoose = require("mongoose")
  , https = require('https')
  , Q = require("q")
  , $ = require("cheerio")
  , ejs = require("ejs")
  , fs = require("fs");

var Schema = mongoose.Schema;
var SaySchema = new Schema({
    name: String,
    date: Date,
    message: String,
    markdown: String,
    raw_markdown: String
});

mongoose.model('Say', SaySchema);
var Say = mongoose.model('Say');

Say.renderMarkdownByGithub = function(input_md) {
    var deffered = Q.defer();
    var settings = {
        host: 'api.github.com',
        path: '/markdown/raw',
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain'
        }
    };
    var req = https.request(settings, function(res) {
        var response = [];
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            response.push(chunk);
        });
        res.on('end', function() {
            deffered.resolve(response.join());
        });
    });
    
    req.on('error', function(e) {
        deffered.reject(e.message);
    });
    req.write(input_md);
    req.end();
    return deffered.promise;
}

Say.forceToUseBlank = function(html) {
    // force to use _target="blank" attributes in a tags
    var $md = $(html);
    $md.find("a").attr("target", "_blank");
    return $("<div>").append($md.clone()).html();
};

var chat_ejs = fs.readFileSync("views/chat.ejs", "utf8"); // node-dev cannot ditect the change of chat.ejs

Say.prototype.renderWithEJS = function() {
    try {
        var self = this;
        return ejs.render(chat_ejs, self);
    } catch(e) {
        console.log(e);
    }
}

Say.prototype.renderMarkdown = function() {
    // rendering markdown into html
    // (markdown -> html rendered by github -> html formatted by chat.ejs)
    // but if the markdown is already rendered by github, we don't call it twice
    // the html is 
    // this is asynchronous method, so returns deffered object.
    var self = this;
    if (self.markdown) {
        var deffered = Q.defer();
        var rendered_html = self.renderWithEJS();
        // update the markdown property
        deffered.resolve(rendered_html); // SetTimeout required?
        return deffered.promise;
    }
    else {
        return Say.renderMarkdownByGithub(self.raw_markdown)
            .then(function(githubhtml) {
                var deffered = Q.defer();
                self.markdown = Say.forceToUseBlank(githubhtml);
                deffered.resolve(githubhtml);
                return deffered.promise;
            })
            .then(function(githubhtml) {
                var deffered = Q.defer();
                var rendered_html = self.renderWithEJS();
                deffered.resolve(rendered_html); // SetTimeout required?
                return deffered.promise;
            });
    }
    
};

