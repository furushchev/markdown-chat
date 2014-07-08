/**
 * markdown chat
 */

var express = require('express');
var user = require('./routes/user');
var http = require('http');
var https = require('https');
var mongoose = require('mongoose');
var path = require('path');
var ejs = require('ejs');
var fs = require('fs');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
var _ = require('lodash');
var Q = require('q');
var express_ex = require('./utils/express_ex');
var $ = require('cheerio');

var config = require('./config');

var app = express();

var server = http.createServer(app);


if (process.env.MONGOLAB_URI) {
  mongoose.connect(process.env.MONGOLAB_URI);
}
else {
  mongoose.connect('mongodb://localhost/markdown_chat2');
}

// load local libraries
require('./model');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({ secret: 'markdown-chat-0E46CB44-0B66-4B74-AD6B-8D467D51FBC8' }));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// force to use https
if ('production'.toString() === app.get('env').toString()) {
  app.use(function(req, res, next) {
    var schema = req.headers['x-forwarded-proto'];
    if (schema.toString() === 'https'.toString()) {
      // Already https; don't do anything special.
      next();
    }
    else {
      // Redirect to https.
      res.redirect('https://' + req.headers.host + req.url);
    }
  });
}


if (process.env.MD_BASIC_USER && process.env.MD_BASIC_PASSWD) {
   app.all('*', express_ex.basicAuth(function(user, pass) {
     return user.toString() === process.env.MD_BASIC_USER.toString() && pass.toString() === process.env.MD_BASIC_PASSWD.toString();
   }));
   // app.use(function(req, res, next) {
   //   req.basicAuthUser = req.user;
   //   req.user = null;
   //   next();
   // });  
}

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
// development only
if ('development'.toString() === app.get('env').toString()) {
  app.use(express.errorHandler());
}

// routing
var routes = require('./routes');
routes.routes.forEach(function(r) {
  if (r.get_url && r.get) {
    if (r.get_url instanceof Array) {
      r.get_url.forEach(function(u) {
        app.get(u, r.get);
      });
    }
    else {
      app.get(r.get_url, r.get);
    }
  }
  if (r.post_url && r.post) {
    if (r.post_url instanceof Array) {
      r.post_url.forEach(function(u) {
        app.post(u, r.post);
      });
    }
    else {
      app.post(r.post_url, r.post);
    }
  }
});

// plugins
var plugins = require('./plugins').plugins;

var Say = mongoose.model('Say');
// settings for socket.io
var io = require('socket.io').listen(server, {'log level': 2});

server.listen(app.get('port'), function() {
  console.log('express server listening on port ' + app.get('port'));
});

var clients = [];
var sockets = [];
io.sockets.on('connection', function(socket) {
  sockets.push(socket);
  var user_id = null;
  var User = mongoose.model('User');
  var pushActiveUsers = function() {
    var active_user_ids = _(clients).filter().uniq().value();

    User.find({_id: {$in: active_user_ids}}, function(err, users) {
      if (err !== null) {
        console.log(err);
      }
      else {
        var data = {
          users: _.map(users, function(u) {
            return {name: u.nickname, url: u.getIconURL(), id: u._id};
          })
        };
        socket.broadcast.emit('users active', data);
        socket.emit('users active', data);
      }
    });
  };
  
  pushActiveUsers();
  socket.on('disconnect', function() {
    if (user_id) {
      clients.splice(clients.indexOf(user_id), 1);
      console.log(clients.length + ' clients');
    }
    pushActiveUsers();
  });

  
  // 初回接続時の履歴取得
  socket.on('msg update', function(msg) {
    if (msg.hasOwnProperty('user_id')) {
      if (msg['user_id']) {
        user_id = msg['user_id'];
        clients.push(user_id);
        pushActiveUsers();
      }
    }
    Say.countObject()
      .then(function(say_count) {
        Say.find()
          .sort([['date', 'ascending']])
          .skip(Math.max(say_count - config.PAGE_MAX, 0))
          .limit(config.PAGE_MAX)
          .populate('user')
          .exec(function(err, docs) {
            socket.emit('msg open', docs.map(function(doc) {
              if (user_id && doc.user._id.toString() === user_id.toString()) {
                return {
                  html: doc.renderMeWithEJS(),
                  date: doc.date,
                  _id: doc._id
                };
              }
              else {
                return {
                  html: doc.renderWithEJS(),
                  date: doc.date,
                  _id: doc._id
                };
              }
            }));
          });
      });
  });

  socket.on('msg edit', function(data) {
    var say_id = data.say_id;
    var markdown = data.markdown;
    Say.find({_id: say_id})
      .populate('user')
      .exec(function(err, says) {
        var say = null;
        if (says.length === 1) {
          say = says[0];
        }
        if (err) {
          console.log('failed to find say object');
          console.log(err);
        }
        else if (say === null) {
          console.log('cannot find say: ' + say_id);
        }
        else {
          say.updateMarkdown(markdown)
            .then(function(html) {
              // broadcasting the message
              sockets.forEach(function(socket) {
                var the_user_id = socket.user_id;
                socket.emit('msg changed', {
                  html: html,
                  say_id: say_id,
                  raw_markdown: markdown,
                  user_id: user_id
                });
              });
            })
            .fail(function(err) {
              console.log('failed to update markdown');
              console.log(err);
            });
        }
      });
  });
  
  // when received message
  
  socket.on('msg send', function(data) {
    var now = new Date(); // now
    var say = new Say({
      name: data.name,
      date: now,
      raw_markdown: data.msg,
      message: data.message,
      user: user_id
    });
    // populate user
    Say.populate(say, {path: 'user'}, function(err, say) {
      say.renderMarkdown(user_id)
        .then(function(me_html) {
          say.renderMarkdown()
            .then(function(other_html) {
              var send_data = {
                me_html: me_html,
                other_html: other_html,
                date: now,
                _id: say._id,
                user_id: user_id
              };
              socket.emit('msg push', send_data);
              socket.broadcast.emit('msg push', send_data);
            })
            .fail(function(err) {
              console.log(err);
            });
        })
        .fail(function(err) {
          console.log(err);
        });
    });
  });

  // delete from database
  socket.on('msg delete', function(data) {
    var say_id = data.say_id;
    if (say_id) {
      Say.findById(say_id, function(err, say) {
        if (err) {
          console.log('[msg delete] failed to find say');
        }
        else if (!say) {
          console.log('[msg delete] cannod find say');
        }
        else {
          say.remove(function(err) {
            if (err) {
              console.log('[msg delete] failed to remove say object');
            }
            else {
              socket.broadcast.emit('msg delete-one', {say_id: say_id});
            }
          });
        }
      });
    }
    //console.log('msg delete');
    //console.log(data);
  });

  socket.on('msg push', function(data){
    var mentions = plugins.containsMentions(data.msg);
    if (mentions.find("jskbot")){
      var msgs = data.msg.split(' ').slice(1).join(' ');
      plugins.getZatsudan(msgs, function(err, res, body){
        if (!err && res.statusCode == 200){
          var send_data = {
            me_html: null,
            other_html: null,
            date: now,
            _id: 'jskbot',
            user_id: user_id
          };
          socket.broadcast.emit('msg push', send_data);
        } else {
          console.log(err);
        }
      });
    }
  });

  socket.on('disconnect', function() {
    console.log('disconnected.');
  });

});

