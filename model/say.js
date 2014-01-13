// model/say.js

var mongoose = require("mongoose")
, util = require('util')
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
  raw_markdown: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Say', SaySchema);
var Say = mongoose.model('Say');

/**
 * Convert a string of Markdown into html using github API.
 * @param {string} input_md - a string written in Markdown
 */
Say.renderMarkdownByGithub = function(input_md) {
  var defered = Q.defer();
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
      defered.resolve(response.join());
    });
  });
  
  req.on('error', function(e) {
    defered.reject(e.message);
  });
  req.write(input_md);
  req.end();
  return defered.promise;
}

Say.forceToUseBlank = function(html) {
  // force to use _target="blank" attributes in a tags
  var $md = $(html);
  $md.find("a").attr("target", "_blank");
  return $("<div>").append($md.clone()).html();
};

var chat_ejs = fs.readFileSync("views/chat.ejs", "utf8"); // node-dev cannot ditect the change of chat.ejs

Say.prototype.readableDateStr = function() {
  var self = this;
  var date_str = self.date.getFullYear() + "/"
    + (self.date.getMonth() + 1) + "/"
    + (self.date.getDate()) + " "
    + (self.date.getHours()) + ":" + (self.date.getMinutes());
  return date_str;
}

Say.prototype.renderWithEJS = function() {
  try {
    var self = this;
    self.date_str = self.readableDateStr();
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
  // this is asynchronous method, so returns defered object.
  var self = this;
  if (self.markdown) {
    var defered = Q.defer();
    var rendered_html = self.renderWithEJS();
    // update the markdown property
    defered.resolve(rendered_html); // SetTimeout required?
    return defered.promise;
  }
  else {
    return Say.renderMarkdownByGithub(self.raw_markdown)
      .then(function(githubhtml) {
        var defered = Q.defer();
        self.markdown = Say.forceToUseBlank(githubhtml);
        defered.resolve(githubhtml);
        self.save();
        return defered.promise;
      })
      .then(function(githubhtml) {
        var defered = Q.defer();
        var rendered_html = self.renderWithEJS();
        defered.resolve(rendered_html); // SetTimeout required?
        return defered.promise;
      });
  }
  
};

Say.countObject = function() {
  var deferred = Q.defer();
  Say.count(function(err, count) {
    if (err)
      deferred.reject(err);
    else
      deferred.resolve(count);
  });
  return deferred.promise;
};

// migration sequence
// remove old Say objects
Say.find().exists('user', false)
  .exec(function(err, says) {
    says.forEach(function(say) {
      say.remove();
    });
  });
