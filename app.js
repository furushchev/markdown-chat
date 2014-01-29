/**
 * markdown chat
 */

var express = require('express')
, user = require('./routes/user')
, http = require('http')
, https = require('https')
, mongoose = require('mongoose')
, path = require('path')
, ejs = require("ejs")
, fs = require("fs")
, passport = require("passport")
, LocalStrategy = require('passport-local').Strategy
, flash = require('connect-flash')
, _ = require('lodash')
, express_ex = require("./utils/express_ex")
, $ = require("cheerio");

var config = require("./config");

var app = express();

var server = http.createServer(app);


if (process.env.MONGOLAB_URI) {
  mongoose.connect(process.env.MONGOLAB_URI);
}
else {
  mongoose.connect('mongodb://localhost/markdown_chat2');
}

// load local libraries
require("./model");

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



if (process.env.MD_BASIC_USER && process.env.MD_BASIC_PASSWD) {
   app.all("*", express_ex.basicAuth(function(user, pass) {
     return user == process.env.MD_BASIC_USER && pass == process.env.MD_BASIC_PASSWD;
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
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// routing
var routes = require("./routes");
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

var Say = mongoose.model('Say');
// settings for socket.io
var io = require('socket.io').listen(server);

server.listen(app.get('port'), function() {
  console.log('express server listening on port ' + app.get('port'));
});

io.sockets.on('connection', function(socket) {
  var user_id = null;
  // 初回接続時の履歴取得
  socket.on('msg update', function(msg) {
    if (msg.hasOwnProperty('user_id')) {
      if (msg['user_id']) {
        user_id = msg['user_id'];
      }
    }
    Say.find()
      .limit(config.PAGE_MAX)
      .exec(function(err, docs) {
        socket.emit('msg open', docs.map(function(doc) {
          if (user_id && doc.user.toString() === user_id.toString()) {
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
    say.renderMarkdown(user_id)
      .then(function(rendered_html) {
        var send_data = {
          html: rendered_html,
          date: now,
          _id: say._id
        };
        socket.emit('msg push', send_data);
        data['markdown'] = rendered_html;
        data["date"] = now;
        socket.broadcast.emit('msg push', send_data);
      }, function(err) {
        console.log("failed to render markdown");
        console.log(err);
      })
  });

  // delete from database
  socket.on('deleteDB', function() {
    socket.emit('db drop');
    socket.broadcast.emit('db drop');
    Say.find().remove();
  });

  socket.on('disconnect', function() {
    console.log('disconnected.');
  });
});
