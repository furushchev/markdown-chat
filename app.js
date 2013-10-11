
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , https = require('https')
  , mongoose = require('mongoose')
  , path = require('path')
  , ejs = require("ejs")
  , fs = require("fs")
  , $ = require("cheerio");

// load local libraries
require("./model")

var app = express();
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
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname, 'bower_components')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
//app.get('/users', user.list);

var server = http.createServer(app)


if (process.env.MONGOLAB_URI) {
    mongoose.connect(process.env.MONGOLAB_URI);
}
else {
    mongoose.connect('mongodb://localhost/markdown_chat');
}
var Say = mongoose.model('Say');


// settings for socket.io
var io = require('socket.io').listen(server);

io.configure(function() {
    io.set("transports", ["xhr-polling"]); 
    io.set("polling duration", 10); 

});

function request(msg, cb) {
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
			console.log('received: ' + chunk);
			response.push(chunk);
		});
		res.on('end', function() {
			cb(null, response.join());
		});
	});
	
	req.on('error', function(e) {
		cb('\033[31m' + e.message + '\033[0m');
	});

	req.write(msg);
	req.end();
}

server.listen(app.get('port'), function(){
  console.log('express server listening on port ' + app.get('port'));
});

var chat_ejs = fs.readFileSync("./views/chat.ejs", "utf8"); // node-dev cannot ditect the change of chat.ejs

function renderData(values) {
    return ejs.render(chat_ejs, values);
}

io.sockets.on('connection', function(socket) {

	// 初回接続時の履歴取得
	socket.on('msg update', function() {
		Say.find(function(err, docs) {
			socket.emit('msg open', docs.map(renderData));
		});
	});

	// when received message
	socket.on('msg send', function(data) {
		request(data.msg, function(err, md) {
            // rewrite <a> tag
            var $md = $(md);
            $md.find("a").attr("target", "_blank");
            md = $("<div>").append($md.clone()).html();
			console.log('md: ' + md);
			data['markdown'] = md;
            var now = new Date(); // now
            data["date"] = now;
			socket.emit('msg push', renderData(data));
			socket.broadcast.emit('msg push', data);

			// register to database
			var say = new Say();
			say.name = data.name;
			say.date = now;
            say.raw_markwodn = data.msg;
			say.message = data.message;
			say.markdown = md;
			say.save(function(e) {
				if (e) {
					console.log("error: register to database: " + e.message);
				}
			});
		});
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
